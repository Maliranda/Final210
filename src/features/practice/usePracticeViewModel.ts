import { useCallback, useMemo, useState } from 'react'
import type { PracticeMode, VocabularyWord } from '../../types'
import { useVocabularyBuilderContext } from '../../context/VocabularyBuilderContext'
import { useRequireAuthAction } from '../../hooks/useRequireAuthAction'

const QUESTIONS_PER_ROUND = 5
const MATCHING_MIN = 2
const MULTIPLE_CHOICE_MIN = 2

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function pickOptions(correct: VocabularyWord, all: VocabularyWord[], count: number) {
  const wrong = shuffle(all.filter((w) => w.id !== correct.id))
    .slice(0, count - 1)
    .map((w) => ({ term: w.term, wordId: w.id }))
  return shuffle([{ term: correct.term, wordId: correct.id }, ...wrong])
}

type MasteryFilter = 'all' | 'new' | 'learned'
type Phase = 'idle' | 'active' | 'result'

export function usePracticeViewModel() {
  const { state, updateWordMastery, recordPracticeSession } = useVocabularyBuilderContext()
  const authGate = useRequireAuthAction('Please sign in (or create an account) to practice vocabulary.')

  const [practiceListId, setPracticeListId] = useState('')
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('multiple-choice')
  const [practiceMasteryFilter, setPracticeMasteryFilter] = useState<MasteryFilter>('all')
  const [currentMode, setCurrentMode] = useState<PracticeMode | null>(null)

  const words = useMemo(() => {
    let list = practiceListId ? state.words.filter((w) => w.listId === practiceListId) : state.words
    if (practiceMasteryFilter === 'new') list = list.filter((w) => w.masteryLevel === 1)
    else if (practiceMasteryFilter === 'learned') list = list.filter((w) => w.masteryLevel === 2)
    return list
  }, [state.words, practiceListId, practiceMasteryFilter])

  const listOptions = useMemo(
    () => [{ value: '', label: 'All words' }, ...state.lists.map((l) => ({ value: l.id, label: l.name }))],
    [state.lists],
  )

  const [phase, setPhase] = useState<Phase>('idle')
  const [roundWords, setRoundWords] = useState<VocabularyWord[]>([])
  const [qi, setQi] = useState(0)
  const [options, setOptions] = useState<{ term: string; wordId: string }[]>([])
  const [answered, setAnswered] = useState(false)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [markLearned, setMarkLearned] = useState(false)
  const [roundCorrect, setRoundCorrect] = useState(0)
  const [roundTotal, setRoundTotal] = useState(0)
  const [result, setResult] = useState({ correct: 0, total: 0 })
  const [fillIn, setFillIn] = useState('')
  const [defOrder, setDefOrder] = useState<VocabularyWord[]>([])
  const [matchSel, setMatchSel] = useState<Record<string, string>>({})
  const [matchChecked, setMatchChecked] = useState(false)
  const [matchResults, setMatchResults] = useState<Record<string, boolean>>({})

  const cur = roundWords[qi] ?? null
  const total = roundWords.length

  const makeSession = useCallback((mode: PracticeMode, correct: number) => ({
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    mode,
    wordIds: roundWords.map((w) => w.id),
    correctCount: correct,
    totalCount: roundTotal,
    masteryChanges: [],
  }), [roundWords, roundTotal])

  const finishRound = useCallback((finalCorrect: number, mode: PracticeMode) => {
    setResult({ correct: finalCorrect, total: roundTotal })
    recordPracticeSession(makeSession(mode, finalCorrect))
    setPhase('result')
  }, [roundTotal, makeSession, recordPracticeSession])

  const canStart =
    words.length >= 1
    && (practiceMode !== 'matching' || words.length >= MATCHING_MIN)
    && (practiceMode !== 'multiple-choice' || words.length >= MULTIPLE_CHOICE_MIN)

  const startRound = useCallback(() => {
    if (!authGate.guard()) return
    if (!canStart) return
    setCurrentMode(practiceMode)
    const count = Math.min(QUESTIONS_PER_ROUND, words.length)
    const selected = shuffle(words).slice(0, count)
    setRoundWords(selected)
    setRoundTotal(count)
    setRoundCorrect(0)
    setQi(0)
    setAnswered(false)
    setFillIn('')
    setMarkLearned(false)
    setMatchSel({})
    setMatchChecked(false)
    setMatchResults({})
    if (practiceMode === 'matching') {
      setDefOrder(shuffle([...selected]))
    } else if (selected[0]) {
      if (practiceMode === 'multiple-choice') {
        setOptions(pickOptions(selected[0], words, Math.min(4, words.length)))
      } else {
        setOptions([])
      }
    }
    setPhase('active')
  }, [authGate, canStart, words, practiceMode])

  const markAnswer = (correct: boolean) => {
    setWasCorrect(correct)
    setAnswered(true)
    setMarkLearned(false)
    if (correct) setRoundCorrect((c) => c + 1)
  }

  const handleAnswer = useCallback((wordId: string) => {
    if (answered || !cur) return
    markAnswer(wordId === cur.id)
  }, [answered, cur])

  const handleFillInCheck = useCallback(() => {
    if (!cur) return
    markAnswer(fillIn.trim().toLowerCase() === cur.term.trim().toLowerCase())
  }, [cur, fillIn])

  const handleMatchingCheck = useCallback(() => {
    const results: Record<string, boolean> = {}
    defOrder.forEach((w) => { results[w.id] = matchSel[w.id] === w.id })
    const correct = defOrder.filter((w) => results[w.id]).length
    setMatchResults(results)
    setMatchChecked(true)
    setResult({ correct, total: roundTotal })
    recordPracticeSession(makeSession('matching', correct))
  }, [defOrder, matchSel, roundTotal, makeSession, recordPracticeSession])

  const handleNext = useCallback(() => {
    if (!cur) return
    if (wasCorrect && markLearned && cur.masteryLevel === 1) updateWordMastery(cur.id, 2)
    if (qi + 1 >= total) { finishRound(roundCorrect, currentMode ?? 'multiple-choice'); return }
    const next = roundWords[qi + 1]
    setQi(qi + 1)
    setAnswered(false)
    setFillIn('')
    setMarkLearned(false)
    if (next && currentMode !== 'matching') {
      if (currentMode === 'multiple-choice') {
        setOptions(pickOptions(next, words, Math.min(4, words.length)))
      } else {
        setOptions([])
      }
    }
  }, [cur, wasCorrect, markLearned, qi, total, roundWords, roundCorrect, words, currentMode, finishRound, updateWordMastery])

  return {
    state,
    authGate,
    // selection
    practiceListId,
    setPracticeListId,
    practiceMode,
    setPracticeMode,
    practiceMasteryFilter,
    setPracticeMasteryFilter,
    listOptions,
    words,
    canStart,
    // round state
    phase,
    setPhase,
    currentMode,
    cur,
    total,
    qi,
    options,
    answered,
    wasCorrect,
    markLearned,
    setMarkLearned,
    fillIn,
    setFillIn,
    defOrder,
    matchSel,
    setMatchSel,
    matchChecked,
    matchResults,
    result,
    // actions
    startRound,
    handleAnswer,
    handleFillInCheck,
    handleMatchingCheck,
    handleNext,
    nextLabel: qi + 1 >= total ? 'See results' : 'Next',
    constants: { QUESTIONS_PER_ROUND, MATCHING_MIN, MULTIPLE_CHOICE_MIN },
  }
}


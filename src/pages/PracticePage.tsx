import { useState, useCallback, useMemo } from 'react'
import { useVocabularyBuilderContext } from '../context/VocabularyBuilderContext'
import Box from '@mui/material/Box'
import {
  PageLayout, Heading, Text, AppLink, Section, Strong, Button, Card,
  List, ListItem, FormField, Select, Input,
} from '../components/ui'
import type { VocabularyWord, PracticeMode } from '../types'

const QUESTIONS_PER_ROUND = 5
const MATCHING_MIN = 2

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function pickOptions(correct: VocabularyWord, all: VocabularyWord[], count: number) {
  const wrong = shuffle(all.filter((w) => w.id !== correct.id)).slice(0, count - 1)
    .map((w) => ({ term: w.term, wordId: w.id }))
  return shuffle([{ term: correct.term, wordId: correct.id }, ...wrong])
}

const MODE_OPTIONS: { value: PracticeMode; label: string }[] = [
  { value: 'multiple-choice', label: 'Multiple choice' },
  { value: 'fill-in-the-blank', label: 'Fill-in-the-blank' },
  { value: 'matching', label: 'Matching' },
]

type MasteryFilter = 'all' | 'new' | 'learned'
const MASTERY_FILTER_OPTIONS: { value: MasteryFilter; label: string }[] = [
  { value: 'all', label: 'All words' },
  { value: 'new', label: 'New words only' },
  { value: 'learned', label: 'Learned words only' },
]

function Feedback({ correct, term }: { correct: boolean; term?: string }) {
  return (
    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: correct ? 'success.light' : 'error.light', color: correct ? 'success.dark' : 'error.dark' }}>
      <Text>{correct ? 'Correct!' : `Wrong. The correct term is: ${term}`}</Text>
    </Box>
  )
}

type Phase = 'idle' | 'active' | 'result'

export default function PracticePage() {
  const { state, updateWordMastery, recordPracticeSession } = useVocabularyBuilderContext()
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
    id: crypto.randomUUID(), startedAt: new Date().toISOString(), endedAt: new Date().toISOString(),
    mode, wordIds: roundWords.map((w) => w.id), correctCount: correct, totalCount: roundTotal, masteryChanges: [],
  }), [roundWords, roundTotal])

  const finishRound = useCallback((finalCorrect: number, mode: PracticeMode) => {
    setResult({ correct: finalCorrect, total: roundTotal })
    recordPracticeSession(makeSession(mode, finalCorrect))
    setPhase('result')
  }, [roundTotal, makeSession, recordPracticeSession])

  const startRound = useCallback(() => {
    if (words.length === 0) return
    if (practiceMode === 'matching' && words.length < MATCHING_MIN) return
    setCurrentMode(practiceMode)
    const count = Math.min(QUESTIONS_PER_ROUND, words.length)
    const selected = shuffle(words).slice(0, count)
    setRoundWords(selected); setRoundTotal(count); setRoundCorrect(0)
    setQi(0); setAnswered(false); setFillIn('')
    setMatchSel({}); setMatchChecked(false); setMatchResults({})
    if (practiceMode === 'matching') {
      setDefOrder(shuffle([...selected]))
    } else if (selected[0]) {
      setOptions(pickOptions(selected[0], words, Math.min(4, words.length)))
    }
    setPhase('active')
  }, [words, practiceMode])

  const markAnswer = (correct: boolean) => {
    setWasCorrect(correct); setAnswered(true)
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
    setMatchResults(results); setMatchChecked(true)
    setResult({ correct, total: roundTotal })
    recordPracticeSession(makeSession('matching', correct))
  }, [defOrder, matchSel, roundTotal, makeSession, recordPracticeSession])

  const handleNext = useCallback(() => {
    if (!cur) return
    if (wasCorrect && cur.masteryLevel === 1)
      updateWordMastery(cur.id, 2)
    if (qi + 1 >= total) { finishRound(roundCorrect, currentMode ?? 'multiple-choice'); return }
    const next = roundWords[qi + 1]
    setQi(qi + 1); setAnswered(false); setFillIn('')
    if (next) setOptions(pickOptions(next, words, Math.min(4, words.length)))
  }, [cur, wasCorrect, qi, total, roundWords, roundCorrect, words, currentMode, finishRound, updateWordMastery])

  const nextLabel = qi + 1 >= total ? 'See results' : 'Next'
  const canStart = words.length >= 1 && (practiceMode !== 'matching' || words.length >= MATCHING_MIN)

  return (
    <PageLayout>
      <Heading level={1}>Practice</Heading>
      <Text>Practice your vocabulary with multiple choice, fill-in-the-blank, or matching.</Text>
      <Text as="span"><AppLink to="/">← Back to Home</AppLink></Text>

      <Section title="Overview">
        <Text>
          You have <Strong>{words.length}</Strong> {words.length === 1 ? 'word' : 'words'}
          {practiceListId ? ' in the selected list' : ' in your vocabulary'}.
        </Text>
        <Text>You have completed <Strong>{state.sessions.length}</Strong> practice {state.sessions.length === 1 ? 'session' : 'sessions'}.</Text>
        {state.words.length === 0 && <Text><AppLink to="/vocabulary">Add some words</AppLink> before practicing.</Text>}
      </Section>

      {state.words.length >= 1 && phase === 'idle' && (
        <Section title="Choose practice mode">
          <FormField label="Mode:">
            <Select options={MODE_OPTIONS} value={practiceMode} onChange={(e) => setPracticeMode(e.target.value as PracticeMode)} />
          </FormField>
          <FormField label="Practice from:">
            <Select options={listOptions} value={practiceListId} onChange={(e) => setPracticeListId(e.target.value)} />
          </FormField>
          <FormField label="Words to practice:">
            <Select options={MASTERY_FILTER_OPTIONS} value={practiceMasteryFilter} onChange={(e) => setPracticeMasteryFilter(e.target.value as MasteryFilter)} />
          </FormField>
          {words.length === 0 && (
            <Text>
              {practiceMasteryFilter !== 'all'
                ? `No ${practiceMasteryFilter === 'new' ? 'new' : 'learned'} words${practiceListId ? ' in this list' : ''}. Change filter or add words.`
                : practiceListId
                  ? 'This list has no words. Add words to the list or choose another list.'
                  : 'Add some words first.'}
            </Text>
          )}
          {practiceMode === 'matching' && words.length >= 1 && words.length < MATCHING_MIN && (
            <Text>Matching needs at least {MATCHING_MIN} words.</Text>
          )}
          {canStart && (
            <>
              <Text>
                {practiceMode === 'multiple-choice' && 'See the definition and choose the correct term from 4 options.'}
                {practiceMode === 'fill-in-the-blank' && 'See the definition and type the correct term.'}
                {practiceMode === 'matching' && `Match ${Math.min(QUESTIONS_PER_ROUND, words.length)} definitions to their terms.`}
              </Text>
              <Button onClick={startRound}>Start practice</Button>
            </>
          )}
        </Section>
      )}

      {phase === 'active' && currentMode === 'multiple-choice' && cur && (
        <Section title={`Question ${qi + 1} of ${total}`}>
          <Card>
            <Text><Strong>Definition:</Strong> {cur.definition}</Text>
            <Text>Choose the correct term:</Text>
            <List>
              {options.map((opt) => (
                <ListItem key={opt.wordId}>
                  <Button
                    variant={answered ? (opt.wordId === cur.id ? 'primary' : 'secondary') : 'secondary'}
                    onClick={() => handleAnswer(opt.wordId)}
                    disabled={answered}
                  >{opt.term}</Button>
                </ListItem>
              ))}
            </List>
            {answered && <Feedback correct={wasCorrect} term={cur.term} />}
            {answered && <Button onClick={handleNext}>{nextLabel}</Button>}
          </Card>
        </Section>
      )}

      {phase === 'active' && currentMode === 'fill-in-the-blank' && cur && (
        <Section title={`Question ${qi + 1} of ${total}`}>
          <Card>
            <Text><Strong>Definition:</Strong> {cur.definition}</Text>
            <Text>Type the correct term:</Text>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, my: 1 }}>
              <Input placeholder="Your answer" value={fillIn} onChange={(e) => setFillIn(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !answered && handleFillInCheck()} disabled={answered} style={{ minWidth: 200 }} />
              {!answered && <Button onClick={handleFillInCheck}>Check</Button>}
            </Box>
            {answered && (
              <>
                <Feedback correct={wasCorrect} term={cur.term} />
                <Button onClick={handleNext}>{nextLabel}</Button>
              </>
            )}
          </Card>
        </Section>
      )}

      {phase === 'active' && currentMode === 'matching' && roundWords.length > 0 && (
        <Section title={matchChecked ? 'Results' : 'Match definitions to terms'}>
          <Card>
            {!matchChecked ? (
              <>
                <Text>For each definition, choose the correct term from the dropdown.</Text>
                <List>
                  {defOrder.map((w) => (
                    <ListItem key={w.id}>
                      <Box component="span" sx={{ flex: 1 }}><Strong>Definition:</Strong> {w.definition}</Box>
                      <Select
                        options={[{ value: '', label: '— choose term —' }, ...roundWords.map((rw) => ({ value: rw.id, label: rw.term }))]}
                        value={matchSel[w.id] ?? ''} onChange={(e) => setMatchSel((p) => ({ ...p, [w.id]: e.target.value }))}
                      />
                    </ListItem>
                  ))}
                </List>
                <Box sx={{ mt: 1 }}><Button onClick={handleMatchingCheck}>Check answers</Button></Box>
              </>
            ) : (
              <>
                <List>
                  {defOrder.map((w) => {
                    const ok = matchResults[w.id]
                    const sel = roundWords.find((rw) => rw.id === matchSel[w.id])
                    return (
                      <Box key={w.id} sx={{ bgcolor: ok ? 'success.light' : 'error.light', color: ok ? 'success.dark' : 'error.dark', borderRadius: 1, mb: 0.5, p: 1.25, borderBottom: '1px solid', borderColor: ok ? 'success.main' : 'error.main' }}>
                        <Strong>Definition:</Strong> {w.definition} → {sel?.term ?? '—'}{ok ? ' ✓' : ` (correct: ${w.term})`}
                      </Box>
                    )
                  })}
                </List>
                <Box sx={{ mt: 1 }}><Text>You got <Strong>{result.correct}</Strong> out of <Strong>{result.total}</Strong> correct.</Text></Box>
                <Box sx={{ mt: 1 }}><Button onClick={() => setPhase('result')}>See summary</Button></Box>
              </>
            )}
          </Card>
        </Section>
      )}

      {phase === 'result' && (
        <Section title="Round complete">
          <Card>
            <Text>You got <Strong>{result.correct}</Strong> out of <Strong>{result.total}</Strong> correct.</Text>
            <Text>Choose how and what you want to practice next.</Text>
            <Box sx={{ mt: 1 }}><Button onClick={() => setPhase('idle')}>Choose mode and list</Button></Box>
          </Card>
        </Section>
      )}
    </PageLayout>
  )
}

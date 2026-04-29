import Box from '@mui/material/Box'
import { AppShell } from '../components/AppShell'
import { AuthRequiredDialog } from '../components/AuthRequiredDialog'
import {
  AppLink,
  BackLink,
  Button,
  Card,
  Checkbox,
  FormField,
  Heading,
  Input,
  List,
  ListItem,
  PageLayout,
  Section,
  Select,
  Strong,
  Text,
} from '../components/ui'
import { usePracticeViewModel } from '../features/practice/usePracticeViewModel'
import type { PracticeMode } from '../types'

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
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        bgcolor: correct ? 'success.light' : 'error.light',
        color: correct ? 'success.dark' : 'error.dark',
      }}
    >
      <Text>{correct ? 'Correct!' : `Wrong. The correct term is: ${term}`}</Text>
    </Box>
  )
}

export default function PracticePageClean() {
  const vm = usePracticeViewModel()

  return (
    <AppShell>
      <PageLayout>
        <Heading level={1}>Practice</Heading>
        <Text>Practice your vocabulary with multiple choice, fill-in-the-blank, or matching.</Text>
        <Text as="span">
          <BackLink to="/" />
        </Text>

        <Section title="Overview">
          <Text>
            You have <Strong>{vm.words.length}</Strong> {vm.words.length === 1 ? 'word' : 'words'}
            {vm.practiceListId ? ' in the selected list' : ' in your vocabulary'}.
          </Text>
          <Text>
            You have completed <Strong>{vm.state.sessions.length}</Strong> practice{' '}
            {vm.state.sessions.length === 1 ? 'session' : 'sessions'}.
          </Text>
          {vm.state.words.length === 0 && (
            <Text>
              <AppLink to="/vocabulary">Add some words</AppLink> before practicing.
            </Text>
          )}
        </Section>

        {vm.state.words.length >= 1 && vm.phase === 'idle' && (
          <Section title="Choose practice mode">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
              <FormField label="Mode:">
                <Select
                  options={MODE_OPTIONS}
                  value={vm.practiceMode}
                  onChange={(e) => vm.setPracticeMode(e.target.value as PracticeMode)}
                />
              </FormField>
              <FormField label="Practice from:">
                <Select
                  options={vm.listOptions}
                  value={vm.practiceListId}
                  onChange={(e) => vm.setPracticeListId(e.target.value)}
                />
              </FormField>
              <FormField label="Words to practice:">
                <Select
                  options={MASTERY_FILTER_OPTIONS}
                  value={vm.practiceMasteryFilter}
                  onChange={(e) => vm.setPracticeMasteryFilter(e.target.value as MasteryFilter)}
                />
              </FormField>
            </Box>

            {vm.words.length === 0 && (
              <Text>
                {vm.practiceMasteryFilter !== 'all'
                  ? `No ${vm.practiceMasteryFilter === 'new' ? 'new' : 'learned'} words${vm.practiceListId ? ' in this list' : ''}. Change filter or add words.`
                  : vm.practiceListId
                    ? 'This list has no words. Add words to the list or choose another list.'
                    : 'Add some words first.'}
              </Text>
            )}

            {vm.practiceMode === 'multiple-choice' &&
              vm.words.length >= 1 &&
              vm.words.length < vm.constants.MULTIPLE_CHOICE_MIN && (
                <Text>Multiple choice needs at least {vm.constants.MULTIPLE_CHOICE_MIN} words.</Text>
              )}
            {vm.practiceMode === 'matching' && vm.words.length >= 1 && vm.words.length < vm.constants.MATCHING_MIN && (
              <Text>Matching needs at least {vm.constants.MATCHING_MIN} words.</Text>
            )}

            {vm.canStart && (
              <>
                <Text>
                  {vm.practiceMode === 'multiple-choice' &&
                    'See the definition and choose the correct term from 4 options.'}
                  {vm.practiceMode === 'fill-in-the-blank' && 'See the definition and type the correct term.'}
                  {vm.practiceMode === 'matching' &&
                    `Match ${Math.min(vm.constants.QUESTIONS_PER_ROUND, vm.words.length)} definitions to their terms.`}
                </Text>
                <Button onClick={vm.startRound}>Start practice</Button>
              </>
            )}
          </Section>
        )}

        {vm.phase === 'active' && vm.currentMode === 'multiple-choice' && vm.cur && (
          <Section title={`Question ${vm.qi + 1} of ${vm.total}`}>
            <Card>
              <Text>
                <Strong>Definition:</Strong> {vm.cur.definition}
              </Text>
              <Text>Choose the correct term:</Text>
              <List>
                {vm.options.map((opt) => (
                  <ListItem key={opt.wordId}>
                    <Button
                      variant={vm.answered ? (opt.wordId === vm.cur!.id ? 'primary' : 'secondary') : 'secondary'}
                      onClick={() => vm.handleAnswer(opt.wordId)}
                      disabled={vm.answered}
                    >
                      {opt.term}
                    </Button>
                  </ListItem>
                ))}
              </List>

              {vm.answered && (
                <Box sx={{ mt: 1.5 }}>
                  <Feedback correct={vm.wasCorrect} term={vm.cur.term} />
                </Box>
              )}
              {vm.answered && vm.wasCorrect && (
                <Box sx={{ mt: 1 }}>
                  <Checkbox checked={vm.markLearned} onChange={vm.setMarkLearned} label="Mark as learned" />
                </Box>
              )}
              {vm.answered && (
                <Box sx={{ mt: 1.5 }}>
                  <Button onClick={vm.handleNext}>{vm.nextLabel}</Button>
                </Box>
              )}
            </Card>
          </Section>
        )}

        {vm.phase === 'active' && vm.currentMode === 'fill-in-the-blank' && vm.cur && (
          <Section title={`Question ${vm.qi + 1} of ${vm.total}`}>
            <Card>
              <Text>
                <Strong>Definition:</Strong> {vm.cur.definition}
              </Text>
              <Text>Type the correct term:</Text>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, my: 1 }}>
                <Input
                  placeholder="Your answer"
                  value={vm.fillIn}
                  onChange={(e) => vm.setFillIn(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !vm.answered && vm.handleFillInCheck()}
                  disabled={vm.answered}
                  style={{ minWidth: 200 }}
                />
                {!vm.answered && <Button onClick={vm.handleFillInCheck}>Check</Button>}
              </Box>

              {vm.answered && (
                <>
                  <Box sx={{ mt: 1.5 }}>
                    <Feedback correct={vm.wasCorrect} term={vm.cur.term} />
                  </Box>
                  {vm.wasCorrect && (
                    <Box sx={{ mt: 1 }}>
                      <Checkbox checked={vm.markLearned} onChange={vm.setMarkLearned} label="Mark as learned" />
                    </Box>
                  )}
                  <Box sx={{ mt: 1.5 }}>
                    <Button onClick={vm.handleNext}>{vm.nextLabel}</Button>
                  </Box>
                </>
              )}
            </Card>
          </Section>
        )}

        {vm.phase === 'active' && vm.currentMode === 'matching' && vm.defOrder.length > 0 && (
          <Section title={vm.matchChecked ? 'Results' : 'Match definitions to terms'}>
            <Card>
              {!vm.matchChecked ? (
                <>
                  <Text>For each definition, choose the correct term from the dropdown.</Text>
                  <List>
                    {vm.defOrder.map((w) => (
                      <ListItem key={w.id}>
                        <Box component="span" sx={{ flex: 1 }}>
                          <Strong>Definition:</Strong> {w.definition}
                        </Box>
                        <Select
                          options={[
                            { value: '', label: '— choose term —' },
                            ...vm.defOrder.map((rw) => ({ value: rw.id, label: rw.term })),
                          ]}
                          value={vm.matchSel[w.id] ?? ''}
                          onChange={(e) => vm.setMatchSel((p) => ({ ...p, [w.id]: e.target.value }))}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: 1 }}>
                    <Button onClick={vm.handleMatchingCheck}>Check answers</Button>
                  </Box>
                </>
              ) : (
                <>
                  <List>
                    {vm.defOrder.map((w) => {
                      const ok = vm.matchResults[w.id]
                      const sel = vm.defOrder.find((rw) => rw.id === vm.matchSel[w.id])
                      return (
                        <Box
                          key={w.id}
                          sx={{
                            bgcolor: ok ? 'success.light' : 'error.light',
                            color: ok ? 'success.dark' : 'error.dark',
                            borderRadius: 1,
                            mb: 0.5,
                            p: 1.25,
                            borderBottom: '1px solid',
                            borderColor: ok ? 'success.main' : 'error.main',
                          }}
                        >
                          <Strong>Definition:</Strong> {w.definition} → {sel?.term ?? '—'}
                          {ok ? ' ✓' : ` (correct: ${w.term})`}
                        </Box>
                      )
                    })}
                  </List>
                  <Box sx={{ mt: 1 }}>
                    <Text>
                      You got <Strong>{vm.result.correct}</Strong> out of <Strong>{vm.result.total}</Strong> correct.
                    </Text>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Button onClick={() => vm.setPhase('result')}>See summary</Button>
                  </Box>
                </>
              )}
            </Card>
          </Section>
        )}

        {vm.phase === 'result' && (
          <Section title="Round complete">
            <Card>
              <Text>
                You got <Strong>{vm.result.correct}</Strong> out of <Strong>{vm.result.total}</Strong> correct.
              </Text>
              <Text>Choose how and what you want to practice next.</Text>
              <Box sx={{ mt: 1 }}>
                <Button onClick={() => vm.setPhase('idle')}>Choose mode and list</Button>
              </Box>
            </Card>
          </Section>
        )}

        <AuthRequiredDialog
          open={vm.authGate.open}
          message={vm.authGate.message}
          onCancel={() => vm.authGate.setOpen(false)}
          onGoLogin={vm.authGate.goLogin}
        />
      </PageLayout>
    </AppShell>
  )
}


import { PageLayout, Heading, Text, Section, AppLink, List, ListItem, Strong } from '../components/ui'

export default function AboutPage() {
  return (
    <PageLayout>
      <Heading level={1}>About</Heading>
      <Text as="span"><AppLink to="/">← Back to Home</AppLink></Text>

      <Section title="Vocabulary Builder">
        <Text>
          A vocabulary learning app built with React, TypeScript, and Firebase.
          Part of the SDT210 course project series.
        </Text>
      </Section>

      <Section title="Features">
        <List>
          <ListItem><Strong>Words</Strong> — Add vocabulary terms with definitions</ListItem>
          <ListItem><Strong>Lists</Strong> — Organize words into themed collections</ListItem>
          <ListItem><Strong>Practice</Strong> — Multiple choice, fill-in-the-blank, and matching modes</ListItem>
          <ListItem><Strong>Mastery tracking</Strong> — Track progress with levels 1–5</ListItem>
          <ListItem><Strong>Cloud sync</Strong> — Data persists via Firebase Firestore</ListItem>
          <ListItem><Strong>Authentication</Strong> — Sign in to sync across devices</ListItem>
        </List>
      </Section>

      <Section title="Tech stack">
        <List>
          <ListItem>React 18 + TypeScript</ListItem>
          <ListItem>Zustand for state management</ListItem>
          <ListItem>React Router for navigation</ListItem>
          <ListItem>Firebase (Auth + Firestore)</ListItem>
          <ListItem>MUI (Material UI) components</ListItem>
          <ListItem>Vite build tool</ListItem>
          <ListItem>Vitest for testing</ListItem>
        </List>
      </Section>

      <Section title="Project history">
        <List>
          <ListItem><Strong>Project 2</Strong> — TypeScript types, React Router, app foundation</ListItem>
          <ListItem><Strong>Project 3</Strong> — Custom hook with 5+ operations and tests</ListItem>
          <ListItem><Strong>Project 4</Strong> — Zustand store, API service interface, agent instructions</ListItem>
          <ListItem><Strong>Project 5</Strong> — End-to-end assembly with Firebase persistence</ListItem>
        </List>
      </Section>
    </PageLayout>
  )
}

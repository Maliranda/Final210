import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, waitFor, within } from '@testing-library/react'
import { useVocabularyStore } from '../store/vocabularyStore'
import { resetVocabularyStore, renderApp } from './testUtils'

/** Local-only mode: real projects often have Firebase env vars in the shell; tests must not depend on that. */
vi.mock('../services/firebase-config', () => ({
  isFirebaseConfigured: () => false,
  getFirestoreInstance: () => null,
  getAuthInstance: () => null,
}))

describe('App integration — vocabulary & practice flows', () => {
  beforeEach(() => {
    resetVocabularyStore()
  })

  it('home page loads with main heading', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { name: /learn vocabulary in one place/i })).toBeInTheDocument()
  })

  it('adds a word and shows it inside the default folder', async () => {
    renderApp('/vocabulary')
    await screen.findByRole('heading', { name: /^vocabulary$/i })

    const termInput = screen.getByPlaceholderText(/term/i)
    const defInput = screen.getByPlaceholderText(/^definition$/i)
    fireEvent.change(termInput, { target: { value: 'hello' } })
    fireEvent.change(defInput, { target: { value: 'a greeting' } })

    fireEvent.click(screen.getByRole('button', { name: /add word/i }))

    const foldersSection = screen.getByRole('heading', { name: /folders/i }).closest('section')
    expect(foldersSection).toBeTruthy()
    const folderCards = within(foldersSection!).getAllByRole('button').filter(
      (el) => el.tagName.toLowerCase() === 'div' && el.textContent?.includes('undefined'),
    )
    expect(folderCards.length).toBeGreaterThan(0)
    fireEvent.click(folderCards[0]!)

    expect(await screen.findByText('hello')).toBeInTheDocument()
    expect(screen.getByText(/a greeting/i)).toBeInTheDocument()
  })

  it('shows validation when adding a word with empty fields', async () => {
    renderApp('/vocabulary')
    await screen.findByRole('heading', { name: /^vocabulary$/i })

    fireEvent.click(screen.getByRole('button', { name: /add word/i }))

    const wordAlert = await screen.findByRole('alert')
    expect(wordAlert).toHaveTextContent(/required fields cannot be left empty/i)
  })

  it('shows validation when creating a folder with an empty name', async () => {
    renderApp('/vocabulary')
    await screen.findByRole('heading', { name: /^vocabulary$/i })

    fireEvent.click(screen.getByRole('button', { name: /create folder/i }))

    const folderAlert = await screen.findByRole('alert')
    expect(folderAlert).toHaveTextContent(/please enter a folder name/i)
  })

  it('runs fill-in-the-blank practice and records a session', async () => {
    useVocabularyStore.getState().addWord('cat', 'small animal')

    renderApp('/practice')
    await screen.findByRole('heading', { name: /^practice$/i })

    const section = screen.getByRole('heading', { name: /choose practice mode/i }).closest('section')
    expect(section).toBeTruthy()
    const combos = within(section!).getAllByRole('combobox')
    const modeSelect = combos[0]
    fireEvent.mouseDown(modeSelect)

    const fillOpt = await screen.findByRole('option', { name: /fill-in-the-blank/i })
    fireEvent.click(fillOpt)

    fireEvent.click(screen.getByRole('button', { name: /start practice/i }))

    expect(await screen.findByText(/type the correct term/i)).toBeInTheDocument()

    const answerInput = screen.getByPlaceholderText(/your answer/i)
    fireEvent.change(answerInput, { target: { value: 'cat' } })
    fireEvent.click(screen.getByRole('button', { name: /^check$/i }))

    expect(await screen.findByText('Correct!')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /see results/i }))

    await waitFor(() => {
      expect(useVocabularyStore.getState().sessions).toHaveLength(1)
      expect(useVocabularyStore.getState().sessions[0].mode).toBe('fill-in-the-blank')
    })
  })
})

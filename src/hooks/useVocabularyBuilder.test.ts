import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVocabularyBuilder } from './useVocabularyBuilder';

describe('useVocabularyBuilder', () => {
  it('should start with empty words, lists, and sessions', () => {
    const { result } = renderHook(() => useVocabularyBuilder());
    expect(result.current.state.words).toHaveLength(0);
    expect(result.current.state.lists).toHaveLength(0);
    expect(result.current.state.sessions).toHaveLength(0);
    expect(result.current.state.currentListFilter).toBeNull();
    expect(result.current.state.masteryFilter).toBeNull();
  });

  it('should add a new word with default mastery level 1', () => {
    const { result } = renderHook(() => useVocabularyBuilder());

    act(() => {
      result.current.addWord('hello', 'a greeting');
    });

    expect(result.current.state.words).toHaveLength(1);
    expect(result.current.state.words[0].term).toBe('hello');
    expect(result.current.state.words[0].definition).toBe('a greeting');
    expect(result.current.state.words[0].masteryLevel).toBe(1);
    expect(result.current.state.words[0].listId).toBeNull();
    expect(result.current.state.words[0].id).toBeDefined();
    expect(result.current.state.words[0].createdAt).toBeDefined();
  });

  it('should delete a word by id', () => {
    const { result } = renderHook(() => useVocabularyBuilder());

    act(() => {
      result.current.addWord('hello', 'a greeting');
    });
    const wordId = result.current.state.words[0].id;
    expect(result.current.state.words).toHaveLength(1);

    act(() => {
      result.current.deleteWord(wordId);
    });

    expect(result.current.state.words).toHaveLength(0);
  });

  it('should add a list and set list filter', () => {
    const { result } = renderHook(() => useVocabularyBuilder());

    act(() => {
      result.current.addList('Spanish 101', 'Basic Spanish vocabulary');
    });

    expect(result.current.state.lists).toHaveLength(1);
    expect(result.current.state.lists[0].name).toBe('Spanish 101');
    expect(result.current.state.lists[0].description).toBe(
      'Basic Spanish vocabulary'
    );

    act(() => {
      result.current.setCurrentListFilter(result.current.state.lists[0].id);
    });

    expect(result.current.state.currentListFilter).toBe(
      result.current.state.lists[0].id
    );
  });

  it('should update word term and definition', () => {
    const { result } = renderHook(() => useVocabularyBuilder());

    act(() => {
      result.current.addWord('old', 'old def');
    });
    const wordId = result.current.state.words[0].id;

    act(() => {
      result.current.updateWord(wordId, {
        term: 'new term',
        definition: 'new definition',
      });
    });

    expect(result.current.state.words[0].term).toBe('new term');
    expect(result.current.state.words[0].definition).toBe('new definition');
  });

  it('should update word mastery level', () => {
    const { result } = renderHook(() => useVocabularyBuilder());

    act(() => {
      result.current.addWord('test', 'definition');
    });
    const wordId = result.current.state.words[0].id;

    act(() => {
      result.current.updateWordMastery(wordId, 2);
    });

    expect(result.current.state.words[0].masteryLevel).toBe(2);
  });

  it('should record a practice session', () => {
    const { result } = renderHook(() => useVocabularyBuilder());

    act(() => {
      result.current.recordPracticeSession({
        id: crypto.randomUUID(),
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        mode: 'multiple-choice',
        wordIds: [],
        correctCount: 5,
        totalCount: 5,
        masteryChanges: [],
      });
    });

    expect(result.current.state.sessions).toHaveLength(1);
    expect(result.current.state.sessions[0].mode).toBe('multiple-choice');
    expect(result.current.state.sessions[0].correctCount).toBe(5);
  });

  it('edge case: deleteWord with non-existent id leaves state unchanged', () => {
    const { result } = renderHook(() => useVocabularyBuilder());

    act(() => {
      result.current.addWord('only', 'one word');
    });
    expect(result.current.state.words).toHaveLength(1);

    act(() => {
      result.current.deleteWord('non-existent-id');
    });

    expect(result.current.state.words).toHaveLength(1);
    expect(result.current.state.words[0].term).toBe('only');
  });
});

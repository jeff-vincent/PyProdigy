import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LessonText from '../lesson-text';

// Mock Prism
jest.mock('prismjs', () => ({
  highlightAll: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

describe('LessonText Component', () => {
  const mockLessonData = {
    text: `
      <p>This is a sample lesson</p>
      <pre><code class="language-python">print("Hello World")</code></pre>
      <p>More lesson content</p>
    `
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  test('fetches and displays lesson text', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => mockLessonData
    });

    render(<LessonText lessonID="1" />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/lessons/lesson/1');
      expect(screen.getByText('This is a sample lesson')).toBeInTheDocument();
    });
  });

  test('parses and highlights code blocks', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => mockLessonData
    });

    const Prism = require('prismjs');

    render(<LessonText lessonID="1" />);

    await waitFor(() => {
      expect(Prism.highlightAll).toHaveBeenCalled();
    });
  });

  test('handles fetch error gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    console.error = jest.fn();

    render(<LessonText lessonID="1" />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching lesson:', expect.any(Error));
    });
  });

  test('shows loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(<LessonText lessonID="1" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
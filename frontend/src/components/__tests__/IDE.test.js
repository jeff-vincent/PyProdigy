import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IDE from '../ide';

// Mock AceEditor
jest.mock('react-ace', () => {
  return function AceEditor({ value, onChange, ...props }) {
    return (
      <textarea
        data-testid="ace-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    );
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('IDE Component', () => {
  const mockLessonData = {
    example_code: 'print("Hello World")',
    expected_output: 'Hello World',
    name: 'Test Lesson'
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  test('fetches and displays lesson data on mount', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => mockLessonData
    });

    render(<IDE lessonID="1" />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/lessons/lesson/1');
      expect(screen.getByDisplayValue('print("Hello World")')).toBeInTheDocument();
    });
  });

  test('handles code execution', async () => {
    fetch
      .mockResolvedValueOnce({
        json: async () => mockLessonData
      })
      .mockResolvedValueOnce({
        json: async () => ({ stdout: 'Hello World\n', stderr: '' })
      });

    render(<IDE lessonID="1" />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('print("Hello World")')).toBeInTheDocument();
    });

    const runButton = screen.getByText(/run/i);
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/compute/run', expect.objectContaining({
        method: 'POST'
      }));
    });
  });

  test('updates file content when typing', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => mockLessonData
    });

    render(<IDE lessonID="1" />);

    await waitFor(() => {
      const editor = screen.getByTestId('ace-editor');
      expect(editor).toBeInTheDocument();
    });

    const editor = screen.getByTestId('ace-editor');
    fireEvent.change(editor, { target: { value: 'print("Updated code")' } });

    expect(editor.value).toBe('print("Updated code")');
  });

  test('shows success modal when output matches expected', async () => {
    fetch
      .mockResolvedValueOnce({
        json: async () => mockLessonData
      })
      .mockResolvedValueOnce({
        json: async () => ({ stdout: 'Hello World\n', stderr: '' })
      });

    render(<IDE lessonID="1" />);

    await waitFor(() => {
      const runButton = screen.getByText(/run/i);
      fireEvent.click(runButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/congratulations/i)).toBeInTheDocument();
    });
  });

  test('handles execution errors gracefully', async () => {
    fetch
      .mockResolvedValueOnce({
        json: async () => mockLessonData
      })
      .mockRejectedValueOnce(new Error('Execution failed'));

    console.error = jest.fn();

    render(<IDE lessonID="1" />);

    await waitFor(() => {
      const runButton = screen.getByText(/run/i);
      fireEvent.click(runButton);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error running code:', expect.any(Error));
    });
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateLesson from '../create-lesson';

// Mock ReactQuill
jest.mock('react-quill', () => {
  return function ReactQuill({ value, onChange }) {
    return (
      <textarea
        data-testid="react-quill"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('CreateLesson Component', () => {
  const mockCategories = [
    { id: '1', name: 'Python Basics' },
    { id: '2', name: 'Advanced Python' }
  ];

  const mockTopics = [
    { id: '1', name: 'Variables', category_id: '1' },
    { id: '2', name: 'Functions', category_id: '1' }
  ];

  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValueOnce({
      json: async () => mockCategories
    });
  });

  test('fetches categories on mount', async () => {
    render(<CreateLesson />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/lessons/category');
    });
  });

  test('handles category selection and fetches topics', async () => {
    fetch
      .mockResolvedValueOnce({ json: async () => mockCategories })
      .mockResolvedValueOnce({ json: async () => mockTopics });

    render(<CreateLesson />);

    await waitFor(() => {
      const categorySelect = screen.getByDisplayValue('');
    });

    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: '1' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/lessons/1/topics');
    });
  });

  test('handles form submission', async () => {
    const mockFormData = new FormData();
    global.FormData = jest.fn(() => mockFormData);
    mockFormData.append = jest.fn();

    fetch
      .mockResolvedValueOnce({ json: async () => mockCategories })
      .mockResolvedValueOnce({ json: async () => mockTopics })
      .mockResolvedValueOnce({ 
        ok: true,
        json: async () => ({ id: '123', message: 'Lesson created successfully' })
      });

    render(<CreateLesson />);

    // Fill form fields
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/lesson name/i);
      fireEvent.change(nameInput, { target: { value: 'Test Lesson' } });
    });

    const lessonTextArea = screen.getByTestId('react-quill');
    fireEvent.change(lessonTextArea, { target: { value: 'This is a test lesson' } });

    const submitButton = screen.getByText(/create lesson/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/lessons/lesson', expect.objectContaining({
        method: 'POST'
      }));
    });
  });

  test('handles form submission error', async () => {
    fetch
      .mockResolvedValueOnce({ json: async () => mockCategories })
      .mockRejectedValueOnce(new Error('Network error'));

    console.error = jest.fn();

    render(<CreateLesson />);

    const submitButton = screen.getByText(/create lesson/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error creating lesson:', expect.any(Error));
    });
  });
});
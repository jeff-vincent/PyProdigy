import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LabLayout from '../LabLayout';

// Mock child components
jest.mock('../video', () => {
  return function VideoPlayer() {
    return <div data-testid="video-player">Video Player</div>;
  };
});

jest.mock('../ide', () => {
  return function IDE() {
    return <div data-testid="ide">IDE Component</div>;
  };
});

jest.mock('../lesson-text', () => {
  return function LessonText() {
    return <div data-testid="lesson-text">Lesson Text</div>;
  };
});

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    labId: 'test-lab-123'
  })
}));

// Mock fetch
global.fetch = jest.fn();

const MockedLabLayout = () => (
  <BrowserRouter>
    <LabLayout />
  </BrowserRouter>
);

describe('LabLayout Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.setItem('jwt', 'mock-jwt-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders all components correctly', () => {
    render(<MockedLabLayout />);
    
    expect(screen.getByTestId('video-player')).toBeInTheDocument();
    expect(screen.getByTestId('ide')).toBeInTheDocument();
    expect(screen.getByTestId('lesson-text')).toBeInTheDocument();
  });

  test('starts compute environment on mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'started' })
    });

    render(<MockedLabLayout />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/compute/start/test-lab-123', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token'
        }
      });
    });
  });

  test('handles compute environment start error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    console.error = jest.fn();

    render(<MockedLabLayout />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Failed to start compute environment:',
        expect.any(Error)
      );
    });
  });
});
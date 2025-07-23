import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn()
}));

// Mock components
jest.mock('./components/Homepage', () => {
  return function Homepage() {
    return <div data-testid="homepage">Homepage</div>;
  };
});

jest.mock('./components/NotFound', () => {
  return function NotFound() {
    return <div data-testid="not-found">Not Found</div>;
  };
});

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear URL search params
    delete window.location;
    window.location = { href: 'http://localhost/', search: '' };
  });

  test('renders homepage by default', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('homepage')).toBeInTheDocument();
    });
  });

  test('handles JWT token from URL and redirects to lab', async () => {
    const mockToken = 'mock.jwt.token';
    const mockDecoded = { lab_id: 'test-lab-123' };
    
    const { jwtDecode } = require('jwt-decode');
    jwtDecode.mockReturnValue(mockDecoded);

    // Mock URL with token parameter
    delete window.location;
    window.location = { 
      href: `http://localhost/?token=${mockToken}`,
      search: `?token=${mockToken}`
    };

    // Mock URL constructor and searchParams
    global.URL = jest.fn().mockImplementation((url) => ({
      searchParams: {
        get: jest.fn().mockReturnValue(mockToken),
        delete: jest.fn()
      }
    }));

    render(<App />);

    await waitFor(() => {
      expect(localStorage.getItem('jwt')).toBe(mockToken);
    });
  });

  test('handles invalid JWT token gracefully', async () => {
    const invalidToken = 'invalid.token';
    const { jwtDecode } = require('jwt-decode');
    jwtDecode.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    console.error = jest.fn(); // Mock console.error

    global.URL = jest.fn().mockImplementation(() => ({
      searchParams: {
        get: jest.fn().mockReturnValue(invalidToken),
        delete: jest.fn()
      }
    }));

    render(<App />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Invalid token', expect.any(Error));
    });
  });
});

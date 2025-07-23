import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Homepage from './Homepage';

// Mock fetch
global.fetch = jest.fn();

const MockedHomepage = () => (
  <BrowserRouter>
    <Homepage />
  </BrowserRouter>
);

describe('Homepage Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders homepage content', () => {
    render(<MockedHomepage />);
    expect(screen.getByText(/PyProdigy/i)).toBeInTheDocument();
  });

  test('handles navigation correctly', () => {
    render(<MockedHomepage />);
    // Test any navigation elements or buttons
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
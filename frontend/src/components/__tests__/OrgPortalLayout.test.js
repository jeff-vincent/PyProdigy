import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrgPortalLayout from '../OrgPortalLayout';

const MockedOrgPortalLayout = () => (
  <BrowserRouter>
    <OrgPortalLayout />
  </BrowserRouter>
);

describe('OrgPortalLayout Component', () => {
  test('renders with default labs tab active', () => {
    render(<MockedOrgPortalLayout />);
    expect(screen.getByText('Labs')).toBeInTheDocument();
  });

  test('can switch between tabs', async () => {
    render(<MockedOrgPortalLayout />);
    
    const orgInfoTab = screen.getByText('Org Info');
    fireEvent.click(orgInfoTab);
    
    await waitFor(() => {
      expect(screen.getByText('Acme Org')).toBeInTheDocument();
    });
  });

  test('can create new lab', async () => {
    render(<MockedOrgPortalLayout />);
    
    const input = screen.getByPlaceholderText(/lab name/i);
    const createButton = screen.getByText(/create lab/i);
    
    fireEvent.change(input, { target: { value: 'New Test Lab' } });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('New Test Lab')).toBeInTheDocument();
    });
  });

  test('can delete lab', async () => {
    render(<MockedOrgPortalLayout />);
    
    const deleteButton = screen.getByText(/delete/i);
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Sample Lab')).not.toBeInTheDocument();
    });
  });

  test('can issue new API key', async () => {
    render(<MockedOrgPortalLayout />);
    
    // Switch to API Keys tab
    const apiKeysTab = screen.getByText('API Keys');
    fireEvent.click(apiKeysTab);
    
    const issueKeyButton = screen.getByText(/issue new key/i);
    fireEvent.click(issueKeyButton);
    
    await waitFor(() => {
      const keys = screen.getAllByText(/sk_/);
      expect(keys.length).toBeGreaterThan(1);
    });
  });
});
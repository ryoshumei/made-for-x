import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeedbackButton from '../FeedbackButton';
import { ShippingDimensions, ShippingResult } from '../types';

// Mock the FeedbackModal component
jest.mock('../FeedbackModal', () => {
  return function MockFeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return isOpen ? (
      <div data-testid="feedback-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null;
  };
});

describe('FeedbackButton', () => {
  const mockDimensions: ShippingDimensions = {
    length: 10,
    width: 8,
    height: 5,
  };

  const mockResult: ShippingResult = {
    groups: [],
    totalAvailable: 3,
  };

  it('renders feedback button when user has input dimensions', () => {
    render(<FeedbackButton userDimensions={mockDimensions} calculationResult={mockResult} />);

    const button = screen.getByLabelText('フィードバックを送信');
    expect(button).toBeInTheDocument();
  });

  it('does not render when no dimensions are input', () => {
    const emptyDimensions = { length: 0, width: 0, height: 0 };
    render(<FeedbackButton userDimensions={emptyDimensions} calculationResult={null} />);

    const button = screen.queryByLabelText('フィードバックを送信');
    expect(button).not.toBeInTheDocument();
  });

  it('opens feedback modal when button is clicked', () => {
    render(<FeedbackButton userDimensions={mockDimensions} calculationResult={mockResult} />);

    const button = screen.getByLabelText('フィードバックを送信');
    fireEvent.click(button);

    const modal = screen.getByTestId('feedback-modal');
    expect(modal).toBeInTheDocument();
  });

  it('closes feedback modal when close button is clicked', () => {
    render(<FeedbackButton userDimensions={mockDimensions} calculationResult={mockResult} />);

    const button = screen.getByLabelText('フィードバックを送信');
    fireEvent.click(button);

    const closeButton = screen.getByText('Close Modal');
    fireEvent.click(closeButton);

    const modal = screen.queryByTestId('feedback-modal');
    expect(modal).not.toBeInTheDocument();
  });

  it('renders when partial dimensions are provided', () => {
    const partialDimensions = { length: 5, width: 0, height: 0 };
    render(<FeedbackButton userDimensions={partialDimensions} calculationResult={null} />);

    const button = screen.getByLabelText('フィードバックを送信');
    expect(button).toBeInTheDocument();
  });
});

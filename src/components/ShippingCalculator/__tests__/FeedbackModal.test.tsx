import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeedbackModal from '../FeedbackModal';
import { ShippingDimensions, ShippingResult } from '../types';

// Mock fetch
global.fetch = jest.fn();

describe('FeedbackModal', () => {
  const mockDimensions: ShippingDimensions = {
    length: 10,
    width: 8,
    height: 5,
  };

  const mockResult: ShippingResult = {
    groups: [],
    totalAvailable: 3,
  };

  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    userDimensions: mockDimensions,
    calculationResult: mockResult,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it('does not render when isOpen is false', () => {
    render(<FeedbackModal {...mockProps} isOpen={false} />);

    const modal = screen.queryByText('フィードバック');
    expect(modal).not.toBeInTheDocument();
  });

  it('renders modal content when isOpen is true', () => {
    render(<FeedbackModal {...mockProps} />);

    expect(screen.getByText('フィードバック')).toBeInTheDocument();
    expect(screen.getByText('入力された寸法')).toBeInTheDocument();
    expect(screen.getByText('該当する問題を選択してください')).toBeInTheDocument();
  });

  it('displays user dimensions correctly', () => {
    render(<FeedbackModal {...mockProps} />);

    const dimensionText = screen.getByText(/長さ: 10cm × 幅: 8cm × 高さ: 5cm/);
    expect(dimensionText).toBeInTheDocument();
  });

  it('displays calculation result when available', () => {
    render(<FeedbackModal {...mockProps} />);

    expect(screen.getByText('計算結果')).toBeInTheDocument();
    expect(screen.getByText('3件の配送方法が見つかりました')).toBeInTheDocument();
  });

  it('enables submit button when feedback is selected', () => {
    render(<FeedbackModal {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /送信/ });
    expect(submitButton).toBeDisabled();

    const pricingCheckbox = screen.getByLabelText('料金が実際と異なる');
    fireEvent.click(pricingCheckbox);

    expect(submitButton).toBeEnabled();
  });

  it('enables submit button when custom feedback is provided', () => {
    render(<FeedbackModal {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /送信/ });
    expect(submitButton).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/具体的な問題や改善要望/);
    fireEvent.change(textarea, { target: { value: 'Test feedback' } });

    expect(submitButton).toBeEnabled();
  });

  it('submits feedback successfully', async () => {
    render(<FeedbackModal {...mockProps} />);

    const pricingCheckbox = screen.getByLabelText('料金が実際と異なる');
    fireEvent.click(pricingCheckbox);

    const submitButton = screen.getByRole('button', { name: /送信/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/shipping/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userDimensions: mockDimensions,
          calculationResult: mockResult,
          feedbackTypes: {
            pricing: true,
            shippingInfo: false,
            sizeCalculation: false,
            newService: false,
            other: false,
          },
          customFeedback: null,
          userAgent: navigator.userAgent,
        }),
      });
    });
  });

  it('shows success message after submission', async () => {
    render(<FeedbackModal {...mockProps} />);

    const pricingCheckbox = screen.getByLabelText('料金が実際と異なる');
    fireEvent.click(pricingCheckbox);

    const submitButton = screen.getByRole('button', { name: /送信/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('フィードバックありがとうございます！')).toBeInTheDocument();
    });
  });

  it('handles submission error', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    // Mock alert
    window.alert = jest.fn();

    render(<FeedbackModal {...mockProps} />);

    const pricingCheckbox = screen.getByLabelText('料金が実際と異なる');
    fireEvent.click(pricingCheckbox);

    const submitButton = screen.getByRole('button', { name: /送信/ });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'フィードバックの送信に失敗しました。もう一度お試しください。'
      );
    });
  });

  it('calls onClose when close button is clicked', () => {
    render(<FeedbackModal {...mockProps} />);

    // Find the close button by its position (first button without text)
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find((button) => button.textContent === '');
    expect(closeButton).toBeDefined();

    fireEvent.click(closeButton!);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<FeedbackModal {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: /キャンセル/ });
    fireEvent.click(cancelButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });
});

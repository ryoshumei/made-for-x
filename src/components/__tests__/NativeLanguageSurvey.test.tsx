import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NativeLanguageSurvey from '../NativeLanguageSurvey';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('NativeLanguageSurvey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
  });

  it('renders the survey question and all language buttons', () => {
    render(<NativeLanguageSurvey />);

    expect(screen.getByText(/あなたの母語は？/)).toBeInTheDocument();
    expect(screen.getByText(/What is your native language/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '日本語' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '中文' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '한국어' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Other' })).toBeInTheDocument();
  });

  it('renders the subtitle text', () => {
    render(<NativeLanguageSurvey />);

    expect(screen.getByText(/サービス向上のために/)).toBeInTheDocument();
  });

  it('shows thank you message after clicking a language button', () => {
    render(<NativeLanguageSurvey />);

    fireEvent.click(screen.getByRole('button', { name: '日本語' }));

    expect(screen.getByText(/ありがとうございます/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '日本語' })).not.toBeInTheDocument();
  });

  it('sends POST request with selected language', () => {
    render(<NativeLanguageSurvey />);

    fireEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(global.fetch).toHaveBeenCalledWith('/api/native-language', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'english' }),
    });
  });

  it('sets localStorage flag after clicking', () => {
    render(<NativeLanguageSurvey />);

    fireEvent.click(screen.getByRole('button', { name: '中文' }));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'survey_native_language_completed',
      'true'
    );
  });

  it('disables all buttons after first click', () => {
    render(<NativeLanguageSurvey />);

    fireEvent.click(screen.getByRole('button', { name: '한국어' }));

    // After click, buttons should no longer be present (replaced by thank you)
    expect(screen.queryByRole('button', { name: '日本語' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'English' })).not.toBeInTheDocument();
  });

  it('does not crash when fetch fails', () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<NativeLanguageSurvey />);

    // Should not throw
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Other' }));
    }).not.toThrow();

    // Should still show thank you
    expect(screen.getByText(/ありがとうございます/)).toBeInTheDocument();
  });

  it('does not crash when localStorage is unavailable', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage unavailable');
    });

    render(<NativeLanguageSurvey />);

    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: '日本語' }));
    }).not.toThrow();

    expect(screen.getByText(/ありがとうございます/)).toBeInTheDocument();
  });
});

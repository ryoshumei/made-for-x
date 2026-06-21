import { normalize } from './normalize';

describe('normalize', () => {
  it('strips spaces (half and full width)', () => {
    expect(normalize('三山 1丁目')).toBe('三山1丁目');
    expect(normalize('三山　1丁目')).toBe('三山1丁目');
  });
  it('strips separators', () => {
    expect(normalize('万町・東本町、西本町')).toBe('万町東本町西本町');
  });
  it('converts full-width alphanumerics to half-width', () => {
    expect(normalize('Ａ１２３')).toBe('A123');
  });
  it('keeps circled numbers and kanji untouched', () => {
    expect(normalize('中央①')).toBe('中央①');
  });
  it('handles empty/nullish', () => {
    expect(normalize('')).toBe('');
  });
});

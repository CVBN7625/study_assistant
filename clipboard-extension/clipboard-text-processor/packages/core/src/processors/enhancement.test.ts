import { describe, it, expect } from 'vitest';
import {
  addSpaceBetweenChineseAndEnglish,
  addSpaceAfterPunctuation,
  panguSpacing,
  addParagraphIndent
} from './enhancement';

describe('Enhancement Processors', () => {
  describe('addSpaceBetweenChineseAndEnglish', () => {
    it('should add space between Chinese and English', () => {
      const input = '你好World';
      const expected = '你好 World';
      expect(addSpaceBetweenChineseAndEnglish.execute(input)).toBe(expected);
    });

    it('should add space between English and Chinese', () => {
      const input = 'Hello世界';
      const expected = 'Hello 世界';
      expect(addSpaceBetweenChineseAndEnglish.execute(input)).toBe(expected);
    });

    it('should handle multiple Chinese and English', () => {
      const input = '你好World世界Hello';
      const expected = '你好 World 世界 Hello';
      expect(addSpaceBetweenChineseAndEnglish.execute(input)).toBe(expected);
    });
  });

  describe('addSpaceAfterPunctuation', () => {
    it('should add space after punctuation', () => {
      const input = 'Hello,World';
      const expected = 'Hello, World';
      expect(addSpaceAfterPunctuation.execute(input)).toBe(expected);
    });

    it('should not add space if already exists', () => {
      const input = 'Hello, World';
      const expected = 'Hello, World';
      expect(addSpaceAfterPunctuation.execute(input)).toBe(expected);
    });
  });

  describe('panguSpacing', () => {
    it('should add spaces between Chinese and English', () => {
      const input = '你好World';
      const expected = '你好 World';
      expect(panguSpacing.execute(input)).toBe(expected);
    });
  });

  describe('addParagraphIndent', () => {
    it('should add paragraph indent', () => {
      const input = 'Hello\n\nWorld';
      const expected = '  Hello\n\n  World';
      expect(addParagraphIndent.execute(input)).toBe(expected);
    });
  });
});

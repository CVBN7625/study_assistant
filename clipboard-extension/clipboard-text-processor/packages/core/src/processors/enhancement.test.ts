import { describe, it, expect } from 'vitest';
import {
  addSpaceBetweenChineseAndEnglish,
  addSpaceBetweenLettersAndNumbers,
  addSpaceAfterPunctuation,
  addParagraphIndent
} from './enhancement';

describe('Enhancement Processors', () => {
  describe('addSpaceBetweenChineseAndEnglish', () => {
    it('should be inactive by default', () => {
      expect(addSpaceBetweenChineseAndEnglish.isActive).toBe(false);
    });

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

  describe('addSpaceBetweenLettersAndNumbers', () => {
    it('should be inactive by default', () => {
      expect(addSpaceBetweenLettersAndNumbers.isActive).toBe(false);
    });

    it('should add space between letters and numbers', () => {
      const input = 'A1B2';
      const expected = 'A 1 B 2';
      expect(addSpaceBetweenLettersAndNumbers.execute(input)).toBe(expected);
    });

    it('should add space between numbers and letters', () => {
      const input = '2024year';
      const expected = '2024 year';
      expect(addSpaceBetweenLettersAndNumbers.execute(input)).toBe(expected);
    });
  });

  describe('addSpaceAfterPunctuation', () => {
    it('should be inactive by default', () => {
      expect(addSpaceAfterPunctuation.isActive).toBe(false);
    });

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

  describe('addParagraphIndent', () => {
    it('should add paragraph indent', () => {
      const input = 'Hello\n\nWorld';
      const expected = '  Hello\n\n  World';
      expect(addParagraphIndent.execute(input)).toBe(expected);
    });
  });
});

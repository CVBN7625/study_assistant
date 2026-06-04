import { describe, it, expect } from 'vitest';
import {
  fullWidthToHalfWidth,
  halfWidthToFullWidth,
  uppercaseToLowerCase,
  lowercaseToUpperCase,
  englishToChinesePunctuation,
  chineseToEnglishPunctuation
} from './conversion';

describe('Conversion Processors', () => {
  describe('fullWidthToHalfWidth', () => {
    it('should convert full-width characters to half-width', () => {
      const input = 'Ｈｅｌｌｏ';
      const expected = 'Hello';
      expect(fullWidthToHalfWidth.execute(input)).toBe(expected);
    });

    it('should convert full-width spaces', () => {
      const input = 'Ｈｅｌｌｏ　Ｗｏｒｌｄ';
      const expected = 'Hello World';
      expect(fullWidthToHalfWidth.execute(input)).toBe(expected);
    });
  });

  describe('halfWidthToFullWidth', () => {
    it('should convert half-width characters to full-width', () => {
      const input = 'Hello';
      const expected = 'Ｈｅｌｌｏ';
      expect(halfWidthToFullWidth.execute(input)).toBe(expected);
    });

    it('should convert half-width spaces', () => {
      const input = 'Hello World';
      const expected = 'Ｈｅｌｌｏ　Ｗｏｒｌｄ';
      expect(halfWidthToFullWidth.execute(input)).toBe(expected);
    });
  });

  describe('uppercaseToLowerCase', () => {
    it('should convert uppercase to lowercase', () => {
      const input = 'HELLO WORLD';
      const expected = 'hello world';
      expect(uppercaseToLowerCase.execute(input)).toBe(expected);
    });
  });

  describe('lowercaseToUpperCase', () => {
    it('should convert lowercase to uppercase', () => {
      const input = 'hello world';
      const expected = 'HELLO WORLD';
      expect(lowercaseToUpperCase.execute(input)).toBe(expected);
    });
  });

  describe('englishToChinesePunctuation', () => {
    it('should convert English punctuation to Chinese', () => {
      const input = 'Hello, World!';
      const expected = 'Hello，World！';
      expect(englishToChinesePunctuation.execute(input)).toBe(expected);
    });

    it('should convert all punctuation', () => {
      const input = 'test: (hello) [world]?';
      const expected = 'test：（hello）【world】？';
      expect(englishToChinesePunctuation.execute(input)).toBe(expected);
    });
  });

  describe('chineseToEnglishPunctuation', () => {
    it('should convert Chinese punctuation to English', () => {
      const input = 'Hello，World！';
      const expected = 'Hello, World!';
      expect(chineseToEnglishPunctuation.execute(input)).toBe(expected);
    });

    it('should convert all punctuation', () => {
      const input = 'test：（hello）【world】？';
      const expected = 'test: (hello) [world]?';
      expect(chineseToEnglishPunctuation.execute(input)).toBe(expected);
    });
  });
});

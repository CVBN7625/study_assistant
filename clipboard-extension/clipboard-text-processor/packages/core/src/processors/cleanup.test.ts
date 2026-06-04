import { describe, it, expect } from 'vitest';
import {
  deleteDuplicateNewlines,
  deleteDuplicateSpaces,
  removeSpacesBetweenChinese,
  deleteExtraWhitespace,
  deleteReferenceBadges,
  deleteFootnotes,
  removeLineBreaksInParagraphs,
  stripHtmlTags,
  removeUrls
} from './cleanup';

describe('Cleanup Processors', () => {
  describe('deleteDuplicateNewlines', () => {
    it('should delete duplicate newlines', () => {
      const input = 'Hello\n\n\nWorld';
      const expected = 'Hello\nWorld';
      expect(deleteDuplicateNewlines.execute(input)).toBe(expected);
    });

    it('should handle Windows-style newlines', () => {
      const input = 'Hello\r\n\r\nWorld';
      const expected = 'Hello\nWorld';
      expect(deleteDuplicateNewlines.execute(input)).toBe(expected);
    });

    it('should handle mixed newlines', () => {
      const input = 'Hello\n\r\nWorld';
      const expected = 'Hello\nWorld';
      expect(deleteDuplicateNewlines.execute(input)).toBe(expected);
    });
  });

  describe('deleteDuplicateSpaces', () => {
    it('should delete duplicate spaces', () => {
      const input = 'Hello   World';
      const expected = 'Hello World';
      expect(deleteDuplicateSpaces.execute(input)).toBe(expected);
    });

    it('should handle multiple spaces', () => {
      const input = 'Hello     World';
      const expected = 'Hello World';
      expect(deleteDuplicateSpaces.execute(input)).toBe(expected);
    });
  });

  describe('removeSpacesBetweenChinese', () => {
    it('should remove all spaces', () => {
      const input = '你 好 世 界';
      const expected = '你好世界';
      expect(removeSpacesBetweenChinese.execute(input)).toBe(expected);
    });

    it('should remove spaces between Chinese and English', () => {
      const input = 'Hello World';
      const expected = 'HelloWorld';
      expect(removeSpacesBetweenChinese.execute(input)).toBe(expected);
    });

    it('should remove multiple spaces', () => {
      const input = '你   好   世   界';
      const expected = '你好世界';
      expect(removeSpacesBetweenChinese.execute(input)).toBe(expected);
    });
  });

  describe('deleteExtraWhitespace', () => {
    it('should delete extra whitespace from lines', () => {
      const input = '  Hello  \n  World  ';
      const expected = 'Hello\nWorld';
      expect(deleteExtraWhitespace.execute(input)).toBe(expected);
    });
  });

  describe('deleteReferenceBadges', () => {
    it('should delete reference badges', () => {
      const input = 'This is a reference [1] and [2, 3]';
      const expected = 'This is a reference  and ';
      expect(deleteReferenceBadges.execute(input)).toBe(expected);
    });

    it('should delete Chinese reference badges', () => {
      const input = 'This is a reference 【1】 and 【2, 3】';
      const expected = 'This is a reference  and ';
      expect(deleteReferenceBadges.execute(input)).toBe(expected);
    });

    it('should delete curved reference badges', () => {
      const input = 'This is a reference (1) and (2, 3)';
      const expected = 'This is a reference  and ';
      expect(deleteReferenceBadges.execute(input)).toBe(expected);
    });
  });

  describe('deleteFootnotes', () => {
    it('should delete footnotes', () => {
      const input = 'This is a footnote ① and ②';
      const expected = 'This is a footnote  and ';
      expect(deleteFootnotes.execute(input)).toBe(expected);
    });
  });

  describe('removeLineBreaksInParagraphs', () => {
    it('should remove line breaks in paragraphs', () => {
      const input = 'Hello\nWorld\n\nNew Paragraph';
      const expected = 'Hello World\n\nNew Paragraph';
      expect(removeLineBreaksInParagraphs.execute(input)).toBe(expected);
    });
  });

  describe('stripHtmlTags', () => {
    it('should strip HTML tags', () => {
      const input = '<p>Hello <b>World</b></p>';
      const expected = 'Hello World';
      expect(stripHtmlTags.execute(input)).toBe(expected);
    });
  });

  describe('removeUrls', () => {
    it('should remove URLs', () => {
      const input = 'Visit https://example.com for more info';
      const expected = 'Visit  for more info';
      expect(removeUrls.execute(input)).toBe(expected);
    });
  });
});

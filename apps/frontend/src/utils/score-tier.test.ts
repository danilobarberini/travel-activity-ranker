import { describe, expect, it } from 'vitest';
import { getScoreTier } from './score-tier';

describe('getScoreTier', () => {
  it('returns "unavailable" for null', () => {
    expect(getScoreTier(null).className).toBe('unavailable');
  });

  it('returns "excellent" for scores 80 and above', () => {
    expect(getScoreTier(80).className).toBe('excellent');
    expect(getScoreTier(100).className).toBe('excellent');
  });

  it('returns "good" for scores between 60 and 79', () => {
    expect(getScoreTier(60).className).toBe('good');
    expect(getScoreTier(79).className).toBe('good');
  });

  it('returns "fair" for scores between 40 and 59', () => {
    expect(getScoreTier(40).className).toBe('fair');
    expect(getScoreTier(59).className).toBe('fair');
  });

  it('returns "poor" for scores below 40', () => {
    expect(getScoreTier(0).className).toBe('poor');
    expect(getScoreTier(39).className).toBe('poor');
  });

  it('always includes a text label, never relying on color alone', () => {
    expect(getScoreTier(null).label).toBeTruthy();
    expect(getScoreTier(90).label).toBeTruthy();
  });
});

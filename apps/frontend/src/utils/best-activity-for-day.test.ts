import { describe, expect, it } from 'vitest';
import { getBestActivityForDay } from './best-activity-for-day';

describe('getBestActivityForDay', () => {
  it('picks the highest-scoring activity', () => {
    const result = getBestActivityForDay([
      { activity: 'SKIING', score: 25, reasoning: [] },
      { activity: 'SURFING', score: 85, reasoning: ['Boa ondulação'] },
      { activity: 'OUTDOOR_SIGHTSEEING', score: 60, reasoning: [] },
      { activity: 'INDOOR_SIGHTSEEING', score: 85 - 1, reasoning: [] },
    ]);

    expect(result?.activity).toBe('SURFING');
    expect(result?.score).toBe(85);
  });

  it('ignores null scores when picking the best', () => {
    const result = getBestActivityForDay([
      { activity: 'SURFING', score: null, reasoning: ['Sem dados de ondas'] },
      { activity: 'SKIING', score: 25, reasoning: [] },
    ]);

    expect(result?.activity).toBe('SKIING');
  });

  it('returns null when every activity is null', () => {
    const result = getBestActivityForDay([
      { activity: 'SURFING', score: null, reasoning: [] },
    ]);

    expect(result).toBeNull();
  });
});

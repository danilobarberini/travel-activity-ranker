import { describe, expect, it } from 'vitest';
import { getBestDayPerActivity } from './best-day-per-activity';

describe('getBestDayPerActivity', () => {
  it('picks the highest-scoring day for each activity', () => {
    const result = getBestDayPerActivity([
      { date: '2026-08-20', activities: [{ activity: 'SKIING', score: 40 }] },
      { date: '2026-08-21', activities: [{ activity: 'SKIING', score: 90 }] },
      { date: '2026-08-22', activities: [{ activity: 'SKIING', score: 60 }] },
    ]);

    expect(result.SKIING).toEqual({ date: '2026-08-21', score: 90 });
  });

  it('omits an activity entirely when every day is null instead of defaulting to a fake entry', () => {
    const result = getBestDayPerActivity([
      {
        date: '2026-08-20',
        activities: [{ activity: 'SURFING', score: null }],
      },
      {
        date: '2026-08-21',
        activities: [{ activity: 'SURFING', score: null }],
      },
    ]);

    expect(result.SURFING).toBeUndefined();
  });

  it('ignores null days for an activity but still picks the best among the valid ones', () => {
    const result = getBestDayPerActivity([
      {
        date: '2026-08-20',
        activities: [{ activity: 'SURFING', score: null }],
      },
      { date: '2026-08-21', activities: [{ activity: 'SURFING', score: 55 }] },
    ]);

    expect(result.SURFING).toEqual({ date: '2026-08-21', score: 55 });
  });

  it('tracks each activity independently', () => {
    const result = getBestDayPerActivity([
      {
        date: '2026-08-20',
        activities: [
          { activity: 'SKIING', score: 30 },
          { activity: 'SURFING', score: 85 },
        ],
      },
    ]);

    expect(result.SKIING).toEqual({ date: '2026-08-20', score: 30 });
    expect(result.SURFING).toEqual({ date: '2026-08-20', score: 85 });
  });
});

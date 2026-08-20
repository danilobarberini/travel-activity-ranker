import { RankingService } from './ranking.service';
import { ActivityScorer } from './interfaces/activity-scorer.interface';
import { ActivityType } from './enums/activity-type.enum';
import { NormalizedDailyWeather } from '../weather/interfaces/normalized-daily-weather.interface';
import { buildDay } from './test-utils/weather-fixture';

function stubScorer(
  activity: ActivityType,
  score: number | null,
): ActivityScorer {
  return {
    activity,
    score: () => ({ score, reasoning: [`stub for ${activity}`] }),
  };
}

describe('RankingService', () => {
  it('applies every scorer to every day and preserves the date/activity shape', () => {
    const scorers = [
      stubScorer(ActivityType.SKIING, 80),
      stubScorer(ActivityType.SURFING, null),
    ];
    const service = new RankingService(scorers);
    const days: NormalizedDailyWeather[] = [
      buildDay({ date: '2026-08-20' }),
      buildDay({ date: '2026-08-21' }),
    ];

    const result = service.rankDailyWeather(days);

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2026-08-20');
    expect(result[0].activities).toEqual([
      {
        activity: ActivityType.SKIING,
        score: 80,
        reasoning: ['stub for SKIING'],
      },
      {
        activity: ActivityType.SURFING,
        score: null,
        reasoning: ['stub for SURFING'],
      },
    ]);
    expect(result[1].date).toBe('2026-08-21');
  });
});

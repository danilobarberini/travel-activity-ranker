import { IndoorSightseeingScorer } from './indoor-sightseeing.scorer';
import { buildDay } from '../test-utils/weather-fixture';

describe('IndoorSightseeingScorer', () => {
  const scorer = new IndoorSightseeingScorer();

  it('stays at a high, stable baseline on a normal day', () => {
    const result = scorer.score(buildDay());
    expect(result.score).toBe(85);
  });

  it('is not simply the inverse of the outdoor score — mild rain does not boost it', () => {
    const result = scorer.score(buildDay({ precipitationSumMm: 8 }));
    expect(result.score).toBe(85);
    expect(result.reasoning.some((r) => r.includes('escape the rain'))).toBe(
      true,
    );
  });

  it('only drops for genuinely severe weather', () => {
    const result = scorer.score(
      buildDay({ precipitationSumMm: 40, windSpeedMaxKmh: 70 }),
    );
    expect(result.score!).toBeLessThan(85);
  });

  it('does not treat a severe storm as a "perfect museum day"', () => {
    const stormy = scorer.score(
      buildDay({ precipitationSumMm: 80, windSpeedMaxKmh: 90 }),
    );
    expect(stormy.score!).toBeLessThan(70);
  });
});

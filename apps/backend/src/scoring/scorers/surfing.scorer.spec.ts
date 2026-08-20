import { SurfingScorer } from './surfing.scorer';
import { buildDay } from '../test-utils/weather-fixture';

describe('SurfingScorer', () => {
  const scorer = new SurfingScorer();

  it('returns null instead of a fabricated score when there is no wave data', () => {
    const result = scorer.score(buildDay({ waveHeightMaxM: null }));
    expect(result.score).toBeNull();
    expect(result.reasoning[0]).toMatch(/sem dados/i);
  });

  it('scores a good-sized, well-organized swell highly', () => {
    const result = scorer.score(
      buildDay({
        waveHeightMaxM: 1.5,
        wavePeriodMaxS: 11,
        windSpeedMaxKmh: 10,
      }),
    );
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  it('penalizes a flat, no-swell day', () => {
    const result = scorer.score(
      buildDay({ waveHeightMaxM: 0.1, wavePeriodMaxS: 8, windSpeedMaxKmh: 10 }),
    );
    expect(result.score!).toBeLessThan(50);
  });

  it('penalizes dangerously large waves', () => {
    const result = scorer.score(
      buildDay({ waveHeightMaxM: 5, wavePeriodMaxS: 12, windSpeedMaxKmh: 10 }),
    );
    expect(result.score!).toBeLessThan(60);
  });

  it('penalizes strong wind even with a decent swell', () => {
    const calm = scorer.score(
      buildDay({
        waveHeightMaxM: 1.2,
        wavePeriodMaxS: 10,
        windSpeedMaxKmh: 10,
      }),
    );
    const windy = scorer.score(
      buildDay({
        waveHeightMaxM: 1.2,
        wavePeriodMaxS: 10,
        windSpeedMaxKmh: 45,
      }),
    );
    expect(windy.score!).toBeLessThan(calm.score!);
  });
});

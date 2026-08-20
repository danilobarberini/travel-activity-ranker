import { OutdoorSightseeingScorer } from './outdoor-sightseeing.scorer';
import { buildDay } from '../test-utils/weather-fixture';

describe('OutdoorSightseeingScorer', () => {
  const scorer = new OutdoorSightseeingScorer();

  it('scores a mild, sunny, dry day highly', () => {
    const result = scorer.score(
      buildDay({
        temperatureMaxC: 24,
        temperatureMinC: 16,
        precipitationSumMm: 0,
        windSpeedMaxKmh: 10,
        sunshineDurationSeconds: 8 * 3600,
      }),
    );
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  it('penalizes heavy rain', () => {
    const result = scorer.score(buildDay({ precipitationSumMm: 25 }));
    expect(result.score!).toBeLessThan(60);
  });

  it('flags extreme heat', () => {
    const result = scorer.score(buildDay({ temperatureMaxC: 40 }));
    expect(result.reasoning).toContain('Temperatura extrema');
  });

  it('penalizes strong wind', () => {
    const calm = scorer.score(buildDay({ windSpeedMaxKmh: 10 }));
    const windy = scorer.score(buildDay({ windSpeedMaxKmh: 55 }));
    expect(windy.score!).toBeLessThan(calm.score!);
  });
});

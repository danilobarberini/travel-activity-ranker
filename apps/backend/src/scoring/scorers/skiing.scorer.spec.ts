import { SkiingScorer } from './skiing.scorer';
import { buildDay } from '../test-utils/weather-fixture';

describe('SkiingScorer', () => {
  const scorer = new SkiingScorer();

  it('scores a cold, snowy, calm day highly', () => {
    const result = scorer.score(
      buildDay({
        temperatureMaxC: -3,
        snowfallSumCm: 15,
        windSpeedMaxKmh: 10,
        precipitationSumMm: 15,
      }),
    );
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  it('penalizes a warm day with no snow', () => {
    const result = scorer.score(
      buildDay({ temperatureMaxC: 22, snowfallSumCm: 0 }),
    );
    expect(result.score!).toBeLessThan(30);
    expect(result.reasoning.some((r) => r.includes('quente'))).toBe(true);
  });

  it('penalizes strong wind even on an otherwise good day', () => {
    const good = scorer.score(
      buildDay({ temperatureMaxC: -3, snowfallSumCm: 10, windSpeedMaxKmh: 10 }),
    );
    const windy = scorer.score(
      buildDay({ temperatureMaxC: -3, snowfallSumCm: 10, windSpeedMaxKmh: 60 }),
    );
    expect(windy.score!).toBeLessThan(good.score!);
  });

  it('flags rain falling on a day too warm to keep the snow', () => {
    const result = scorer.score(
      buildDay({
        temperatureMaxC: 4,
        snowfallSumCm: 0,
        precipitationSumMm: 20,
      }),
    );
    expect(result.reasoning.some((r) => r.includes('Chuva sobre neve'))).toBe(
      true,
    );
  });

  it('never returns a score outside the 0-100 range', () => {
    const worst = scorer.score(
      buildDay({
        temperatureMaxC: 40,
        snowfallSumCm: 0,
        windSpeedMaxKmh: 100,
        precipitationSumMm: 50,
      }),
    );
    expect(worst.score).toBeGreaterThanOrEqual(0);
    expect(worst.score).toBeLessThanOrEqual(100);
  });
});

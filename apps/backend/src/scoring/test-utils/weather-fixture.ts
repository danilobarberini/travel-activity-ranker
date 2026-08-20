import { NormalizedDailyWeather } from '../../weather/interfaces/normalized-daily-weather.interface';

export function buildDay(
  overrides: Partial<NormalizedDailyWeather> = {},
): NormalizedDailyWeather {
  return {
    date: '2026-08-20',
    temperatureMaxC: 20,
    temperatureMinC: 12,
    precipitationSumMm: 0,
    snowfallSumCm: 0,
    windSpeedMaxKmh: 10,
    weatherCode: 1,
    sunshineDurationSeconds: 5 * 3600,
    uvIndexMax: 5,
    waveHeightMaxM: null,
    wavePeriodMaxS: null,
    windWaveHeightMaxM: null,
    ...overrides,
  };
}

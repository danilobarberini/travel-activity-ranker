export interface NormalizedDailyWeather {
  date: string;
  temperatureMaxC: number;
  temperatureMinC: number;
  precipitationSumMm: number;
  snowfallSumCm: number;
  windSpeedMaxKmh: number;
  weatherCode: number;
  sunshineDurationSeconds: number;
  uvIndexMax: number;
  /**
   * Marine variables are `null` for inland locations (Open-Meteo returns HTTP 200,
   * not an error) AND can be `null` on individual days at a genuinely coastal point
   * (e.g. a flat/calm-sea day with no measurable swell). Never infer "this city has
   * no coast" from a single null day — see OpenMeteoWeatherProvider for the merge logic.
   */
  waveHeightMaxM: number | null;
  wavePeriodMaxS: number | null;
  windWaveHeightMaxM: number | null;
}

import { BadGatewayException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WeatherProvider } from '../interfaces/weather-provider.interface';
import { NormalizedDailyWeather } from '../interfaces/normalized-daily-weather.interface';

const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1';
const MARINE_BASE_URL = 'https://marine-api.open-meteo.com/v1';

const FORECAST_ARRAY_KEYS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'snowfall_sum',
  'wind_speed_10m_max',
  'weather_code',
  'sunshine_duration',
  'uv_index_max',
] as const;

const MARINE_ARRAY_KEYS = [
  'wave_height_max',
  'wave_period_max',
  'wind_wave_height_max',
] as const;

const FORECAST_DAILY_PARAMS = FORECAST_ARRAY_KEYS.join(',');
const MARINE_DAILY_PARAMS = MARINE_ARRAY_KEYS.join(',');

type ForecastNumericField = (typeof FORECAST_ARRAY_KEYS)[number];

interface RawForecastDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  snowfall_sum: number[];
  wind_speed_10m_max: number[];
  weather_code: number[];
  sunshine_duration: number[];
  uv_index_max: number[];
}

interface RawMarineDaily {
  time: string[];
  wave_height_max: (number | null)[];
  wave_period_max: (number | null)[];
  wind_wave_height_max: (number | null)[];
}

/**
 * TypeScript's `daily: RawForecastDaily` on the axios response is a compile-time
 * promise only — it doesn't check anything about the JSON that actually comes back
 * over the wire. This is the runtime boundary check: it turns a missing/malformed
 * `daily` block, or a mismatched array length, into a clear 502 instead of letting
 * `.map()` throw a bare "Cannot read properties of undefined" further down, or
 * silently handing out `undefined` typed as `number`.
 */
function assertDailySeriesShape(
  daily: Record<string, unknown> | undefined,
  arrayKeys: readonly string[],
  sourceName: string,
): void {
  if (!daily || !Array.isArray(daily.time)) {
    throw new BadGatewayException(
      `Open-Meteo ${sourceName} response is missing the expected daily time series.`,
    );
  }

  const expectedLength = daily.time.length;
  for (const key of arrayKeys) {
    const series = daily[key];
    if (!Array.isArray(series) || series.length !== expectedLength) {
      throw new BadGatewayException(
        `Open-Meteo ${sourceName} response has a missing or malformed "${key}" series.`,
      );
    }
  }
}

function requireFiniteNumber(
  value: unknown,
  field: string,
  date: string,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new BadGatewayException(
      `Open-Meteo forecast response has an invalid "${field}" value for ${date}.`,
    );
  }
  return value;
}

@Injectable()
export class OpenMeteoWeatherProvider implements WeatherProvider {
  constructor(private readonly http: HttpService) {}

  async getDailyForecast(
    latitude: number,
    longitude: number,
    days = 7,
  ): Promise<NormalizedDailyWeather[]> {
    const [forecast, marine] = await Promise.all([
      this.fetchForecastDaily(latitude, longitude, days),
      this.fetchMarineDaily(latitude, longitude, days),
    ]);

    // Forecast and marine are different weather models, and each one rounds the
    // coordinates we send to its own nearest data point internally — so for the
    // same city, they might not return the exact same set of dates. Merge by
    // date instead of assuming the two arrays line up.
    const marineIndexByDate = new Map(
      marine.time.map((date, index) => [date, index]),
    );

    return forecast.time.map((date, i) => {
      const marineIndex = marineIndexByDate.get(date);
      const requireDailyNumber = (field: ForecastNumericField): number =>
        requireFiniteNumber(forecast[field][i], field, date);

      return {
        date,
        temperatureMaxC: requireDailyNumber('temperature_2m_max'),
        temperatureMinC: requireDailyNumber('temperature_2m_min'),
        precipitationSumMm: requireDailyNumber('precipitation_sum'),
        snowfallSumCm: requireDailyNumber('snowfall_sum'),
        windSpeedMaxKmh: requireDailyNumber('wind_speed_10m_max'),
        weatherCode: requireDailyNumber('weather_code'),
        sunshineDurationSeconds: requireDailyNumber('sunshine_duration'),
        uvIndexMax: requireDailyNumber('uv_index_max'),
        // Intentionally no requireFiniteNumber() here — null is valid, see the
        // waveHeightMaxM doc comment on NormalizedDailyWeather for why.
        waveHeightMaxM:
          marineIndex !== undefined
            ? marine.wave_height_max[marineIndex]
            : null,
        wavePeriodMaxS:
          marineIndex !== undefined
            ? marine.wave_period_max[marineIndex]
            : null,
        windWaveHeightMaxM:
          marineIndex !== undefined
            ? marine.wind_wave_height_max[marineIndex]
            : null,
      };
    });
  }

  private async fetchForecastDaily(
    latitude: number,
    longitude: number,
    days: number,
  ): Promise<RawForecastDaily> {
    const { data } = await firstValueFrom(
      this.http.get<{ daily?: Record<string, unknown> }>(
        `${FORECAST_BASE_URL}/forecast`,
        {
          params: {
            latitude,
            longitude,
            daily: FORECAST_DAILY_PARAMS,
            timezone: 'auto',
            forecast_days: days,
          },
        },
      ),
    );
    assertDailySeriesShape(data.daily, FORECAST_ARRAY_KEYS, 'forecast');
    return data.daily as unknown as RawForecastDaily;
  }

  private async fetchMarineDaily(
    latitude: number,
    longitude: number,
    days: number,
  ): Promise<RawMarineDaily> {
    const { data } = await firstValueFrom(
      this.http.get<{ daily?: Record<string, unknown> }>(
        `${MARINE_BASE_URL}/marine`,
        {
          params: {
            latitude,
            longitude,
            daily: MARINE_DAILY_PARAMS,
            timezone: 'auto',
            forecast_days: days,
          },
        },
      ),
    );
    assertDailySeriesShape(data.daily, MARINE_ARRAY_KEYS, 'marine');
    return data.daily as unknown as RawMarineDaily;
  }
}

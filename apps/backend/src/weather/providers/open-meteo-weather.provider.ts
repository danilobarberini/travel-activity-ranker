import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WeatherProvider } from '../interfaces/weather-provider.interface';
import { NormalizedDailyWeather } from '../interfaces/normalized-daily-weather.interface';

const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1';
const MARINE_BASE_URL = 'https://marine-api.open-meteo.com/v1';

const FORECAST_DAILY_PARAMS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'snowfall_sum',
  'wind_speed_10m_max',
  'weather_code',
  'sunshine_duration',
  'uv_index_max',
].join(',');

const MARINE_DAILY_PARAMS = [
  'wave_height_max',
  'wave_period_max',
  'wind_wave_height_max',
].join(',');

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

    // Marine and forecast are two different Open-Meteo models: they can snap to
    // slightly different grid points internally, so merge by date instead of
    // assuming both arrays share the same length/order.
    const marineIndexByDate = new Map(
      marine.time.map((date, index) => [date, index]),
    );

    return forecast.time.map((date, i) => {
      const marineIndex = marineIndexByDate.get(date);

      return {
        date,
        temperatureMaxC: forecast.temperature_2m_max[i],
        temperatureMinC: forecast.temperature_2m_min[i],
        precipitationSumMm: forecast.precipitation_sum[i],
        snowfallSumCm: forecast.snowfall_sum[i],
        windSpeedMaxKmh: forecast.wind_speed_10m_max[i],
        weatherCode: forecast.weather_code[i],
        sunshineDurationSeconds: forecast.sunshine_duration[i],
        uvIndexMax: forecast.uv_index_max[i],
        // `null` here means "no wave data for this day" — it's the normal Open-Meteo
        // response for inland coordinates (HTTP 200, not an error) and can also happen
        // on individual days at a real coastal point. See the interface doc comment;
        // callers (e.g. the surf scorer) must treat this as "insufficient data for this
        // day", never as a city-level "not coastal" verdict.
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
      this.http.get<{ daily: RawForecastDaily }>(
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
    return data.daily;
  }

  private async fetchMarineDaily(
    latitude: number,
    longitude: number,
    days: number,
  ): Promise<RawMarineDaily> {
    const { data } = await firstValueFrom(
      this.http.get<{ daily: RawMarineDaily }>(`${MARINE_BASE_URL}/marine`, {
        params: {
          latitude,
          longitude,
          daily: MARINE_DAILY_PARAMS,
          timezone: 'auto',
          forecast_days: days,
        },
      }),
    );
    return data.daily;
  }
}

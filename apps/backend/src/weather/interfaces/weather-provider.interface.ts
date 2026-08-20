import { NormalizedDailyWeather } from './normalized-daily-weather.interface';

export const WEATHER_PROVIDER = Symbol('WEATHER_PROVIDER');

export interface WeatherProvider {
  getDailyForecast(
    latitude: number,
    longitude: number,
    days?: number,
  ): Promise<NormalizedDailyWeather[]>;
}

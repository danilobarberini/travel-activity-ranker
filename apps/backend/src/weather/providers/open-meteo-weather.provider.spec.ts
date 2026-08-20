import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { BadGatewayException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { OpenMeteoWeatherProvider } from './open-meteo-weather.provider';

function mockAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as AxiosResponse['config'],
  };
}

const VALID_MARINE_RESPONSE = {
  daily: {
    time: ['2026-08-20'],
    wave_height_max: [0.5],
    wave_period_max: [6],
    wind_wave_height_max: [0.2],
  },
};

const VALID_FORECAST_RESPONSE = {
  daily: {
    time: ['2026-08-20'],
    temperature_2m_max: [24],
    temperature_2m_min: [18],
    precipitation_sum: [0],
    snowfall_sum: [0],
    wind_speed_10m_max: [12],
    weather_code: [1],
    sunshine_duration: [30000],
    uv_index_max: [6],
  },
};

describe('OpenMeteoWeatherProvider', () => {
  let provider: OpenMeteoWeatherProvider;
  let httpGetMock: jest.Mock;

  beforeEach(async () => {
    httpGetMock = jest.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        OpenMeteoWeatherProvider,
        { provide: HttpService, useValue: { get: httpGetMock } },
      ],
    }).compile();

    provider = moduleRef.get(OpenMeteoWeatherProvider);
  });

  it('merges forecast and marine data by date for a coastal location', async () => {
    httpGetMock
      .mockReturnValueOnce(
        of(
          mockAxiosResponse({
            daily: {
              time: ['2026-08-20', '2026-08-21'],
              temperature_2m_max: [24.5, 21.4],
              temperature_2m_min: [18.3, 14.7],
              precipitation_sum: [0.1, 0],
              snowfall_sum: [0, 0],
              wind_speed_10m_max: [15, 18],
              weather_code: [1, 2],
              sunshine_duration: [30000, 28000],
              uv_index_max: [6, 5],
            },
          }),
        ),
      )
      .mockReturnValueOnce(
        of(
          mockAxiosResponse({
            daily: {
              time: ['2026-08-20', '2026-08-21'],
              wave_height_max: [0.46, 0.82],
              wave_period_max: [6.4, 5.45],
              wind_wave_height_max: [0.18, 0.34],
            },
          }),
        ),
      );

    const result = await provider.getDailyForecast(-27.5954, -48.548, 2);

    expect(result).toEqual([
      {
        date: '2026-08-20',
        temperatureMaxC: 24.5,
        temperatureMinC: 18.3,
        precipitationSumMm: 0.1,
        snowfallSumCm: 0,
        windSpeedMaxKmh: 15,
        weatherCode: 1,
        sunshineDurationSeconds: 30000,
        uvIndexMax: 6,
        waveHeightMaxM: 0.46,
        wavePeriodMaxS: 6.4,
        windWaveHeightMaxM: 0.18,
      },
      {
        date: '2026-08-21',
        temperatureMaxC: 21.4,
        temperatureMinC: 14.7,
        precipitationSumMm: 0,
        snowfallSumCm: 0,
        windSpeedMaxKmh: 18,
        weatherCode: 2,
        sunshineDurationSeconds: 28000,
        uvIndexMax: 5,
        waveHeightMaxM: 0.82,
        wavePeriodMaxS: 5.45,
        windWaveHeightMaxM: 0.34,
      },
    ]);
  });

  it('normalizes an inland location to null wave fields instead of throwing', async () => {
    httpGetMock
      .mockReturnValueOnce(
        of(
          mockAxiosResponse({
            daily: {
              time: ['2026-08-20'],
              temperature_2m_max: [28],
              temperature_2m_min: [17],
              precipitation_sum: [0],
              snowfall_sum: [0],
              wind_speed_10m_max: [10],
              weather_code: [0],
              sunshine_duration: [35000],
              uv_index_max: [8],
            },
          }),
        ),
      )
      .mockReturnValueOnce(
        of(
          mockAxiosResponse({
            daily: {
              time: ['2026-08-20'],
              wave_height_max: [null],
              wave_period_max: [null],
              wind_wave_height_max: [null],
            },
          }),
        ),
      );

    const [day] = await provider.getDailyForecast(-23.5505, -46.6333, 1);

    expect(day.waveHeightMaxM).toBeNull();
    expect(day.wavePeriodMaxS).toBeNull();
    expect(day.windWaveHeightMaxM).toBeNull();
  });

  it('does not fabricate wave data for a date the marine response is missing', async () => {
    httpGetMock
      .mockReturnValueOnce(
        of(
          mockAxiosResponse({
            daily: {
              time: ['2026-08-20', '2026-08-21'],
              temperature_2m_max: [24, 23],
              temperature_2m_min: [18, 17],
              precipitation_sum: [0, 0],
              snowfall_sum: [0, 0],
              wind_speed_10m_max: [12, 14],
              weather_code: [1, 1],
              sunshine_duration: [30000, 29000],
              uv_index_max: [6, 6],
            },
          }),
        ),
      )
      .mockReturnValueOnce(
        of(
          mockAxiosResponse({
            daily: {
              time: ['2026-08-20'],
              wave_height_max: [0.5],
              wave_period_max: [6],
              wind_wave_height_max: [0.2],
            },
          }),
        ),
      );

    const result = await provider.getDailyForecast(-27.5954, -48.548, 2);

    expect(result[0].waveHeightMaxM).toBe(0.5);
    expect(result[1].waveHeightMaxM).toBeNull();
  });

  it('throws a clear error instead of crashing when the forecast response has no "daily" block', async () => {
    httpGetMock
      .mockReturnValueOnce(of(mockAxiosResponse({})))
      .mockReturnValueOnce(of(mockAxiosResponse(VALID_MARINE_RESPONSE)));

    await expect(
      provider.getDailyForecast(-27.5954, -48.548, 1),
    ).rejects.toThrow(BadGatewayException);
  });

  it('throws a clear error instead of silently truncating when a forecast series is shorter than "time"', async () => {
    httpGetMock
      .mockReturnValueOnce(
        of(
          mockAxiosResponse({
            daily: {
              ...VALID_FORECAST_RESPONSE.daily,
              time: ['2026-08-20', '2026-08-21'],
              // temperature_2m_max intentionally left with only 1 entry for 2 days
              temperature_2m_max: [24],
            },
          }),
        ),
      )
      .mockReturnValueOnce(of(mockAxiosResponse(VALID_MARINE_RESPONSE)));

    await expect(
      provider.getDailyForecast(-27.5954, -48.548, 2),
    ).rejects.toThrow(BadGatewayException);
  });

  it('throws a clear error instead of returning a bogus number when a forecast value is null', async () => {
    httpGetMock
      .mockReturnValueOnce(
        of(
          mockAxiosResponse({
            daily: {
              ...VALID_FORECAST_RESPONSE.daily,
              temperature_2m_max: [null],
            },
          }),
        ),
      )
      .mockReturnValueOnce(of(mockAxiosResponse(VALID_MARINE_RESPONSE)));

    await expect(
      provider.getDailyForecast(-27.5954, -48.548, 1),
    ).rejects.toThrow(BadGatewayException);
  });

  it('throws a clear error instead of crashing when the marine response has no "daily" block', async () => {
    httpGetMock
      .mockReturnValueOnce(of(mockAxiosResponse(VALID_FORECAST_RESPONSE)))
      .mockReturnValueOnce(of(mockAxiosResponse({})));

    await expect(
      provider.getDailyForecast(-27.5954, -48.548, 1),
    ).rejects.toThrow(BadGatewayException);
  });
});

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ForecastResolver } from './forecast.resolver';
import { LocationProvider } from '../weather/interfaces/location-provider.interface';
import { WeatherProvider } from '../weather/interfaces/weather-provider.interface';
import { RankingService } from '../scoring/ranking.service';
import { NormalizedDailyWeather } from '../weather/interfaces/normalized-daily-weather.interface';
import { ActivityType } from '../scoring/enums/activity-type.enum';
import { DayRanking } from '../scoring/interfaces/day-ranking.interface';

function buildResolver(overrides: {
  findByName?: jest.Mock;
  getDailyForecast?: jest.Mock;
  rankDailyWeather?: jest.Mock;
}) {
  const locationProvider = {
    findByName: overrides.findByName ?? jest.fn(),
  } as unknown as LocationProvider;
  const weatherProvider = {
    getDailyForecast: overrides.getDailyForecast ?? jest.fn(),
  } as unknown as WeatherProvider;
  const rankingService = {
    rankDailyWeather: overrides.rankDailyWeather ?? jest.fn(),
  } as unknown as RankingService;

  return new ForecastResolver(
    locationProvider,
    weatherProvider,
    rankingService,
  );
}

describe('ForecastResolver', () => {
  it('orchestrates geocoding, forecast and ranking into a single response', async () => {
    const findByName = jest.fn().mockResolvedValue([
      {
        name: 'Florianópolis',
        country: 'Brazil',
        admin1: 'Santa Catarina',
        latitude: -27.5954,
        longitude: -48.548,
      },
    ]);
    const days: NormalizedDailyWeather[] = [
      {
        date: '2026-08-20',
        temperatureMaxC: 24,
        temperatureMinC: 18,
        precipitationSumMm: 0,
        snowfallSumCm: 0,
        windSpeedMaxKmh: 12,
        weatherCode: 1,
        sunshineDurationSeconds: 30000,
        uvIndexMax: 6,
        waveHeightMaxM: 0.8,
        wavePeriodMaxS: 9,
        windWaveHeightMaxM: 0.3,
      },
    ];
    const getDailyForecast = jest.fn().mockResolvedValue(days);
    const rankings: DayRanking[] = [
      {
        date: '2026-08-20',
        activities: [
          {
            activity: ActivityType.SURFING,
            score: 80,
            reasoning: ['good swell'],
          },
        ],
      },
    ];
    const rankDailyWeather = jest.fn().mockReturnValue(rankings);

    const resolver = buildResolver({
      findByName,
      getDailyForecast,
      rankDailyWeather,
    });

    const result = await resolver.cityForecast('Florianópolis');

    expect(findByName).toHaveBeenCalledWith('Florianópolis', 1);
    expect(getDailyForecast).toHaveBeenCalledWith(-27.5954, -48.548);
    expect(result.location.name).toBe('Florianópolis');
    expect(result.days).toEqual([
      {
        date: '2026-08-20',
        weather: days[0],
        activities: rankings[0].activities,
      },
    ]);
  });

  it('throws NotFoundException when the location cannot be resolved', async () => {
    const findByName = jest.fn().mockResolvedValue([]);
    const resolver = buildResolver({ findByName });

    await expect(resolver.cityForecast('asdkfjasldkjf')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws BadRequestException for an empty or whitespace-only location', async () => {
    const resolver = buildResolver({});

    await expect(resolver.cityForecast('   ')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws BadRequestException for a location over 100 characters', async () => {
    const resolver = buildResolver({});

    await expect(resolver.cityForecast('a'.repeat(101))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('trims the location before searching', async () => {
    const findByName = jest.fn().mockResolvedValue([]);
    const resolver = buildResolver({ findByName });

    await expect(resolver.cityForecast('  Lisbon  ')).rejects.toThrow(
      NotFoundException,
    );
    expect(findByName).toHaveBeenCalledWith('Lisbon', 1);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import {
  LOCATION_PROVIDER,
  type LocationProvider,
} from './../src/weather/interfaces/location-provider.interface';
import {
  WEATHER_PROVIDER,
  type WeatherProvider,
} from './../src/weather/interfaces/weather-provider.interface';
import type { NormalizedDailyWeather } from './../src/weather/interfaces/normalized-daily-weather.interface';

interface CityForecastResponseBody {
  data?: {
    cityForecast: {
      location: { name: string; country: string | null };
      days: Array<{
        date: string;
        activities: Array<{
          activity: string;
          score: number | null;
          reasoning: string[];
        }>;
      }>;
    };
  };
  errors?: Array<{ extensions: Record<string, unknown> }>;
}

/**
 * Integration test for the real GraphQL pipeline: real module wiring, real
 * schema, real resolver, real RankingService/scorers, real error formatting.
 * Only the outermost network boundary (Open-Meteo) is faked — everything
 * downstream of it runs for real. Unit tests already cover each piece in
 * isolation; this covers whether the pieces are actually wired together
 * correctly (e.g. `formatGraphQLError` being plugged into the real Apollo
 * pipeline is something no unit test can verify).
 */
describe('Forecast GraphQL (integration)', () => {
  let app: INestApplication<App>;

  const fakeDay: NormalizedDailyWeather = {
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
  };

  const fakeLocationProvider: LocationProvider = {
    findByName: (query: string) => {
      if (query === 'Nonexistent City') {
        return Promise.resolve([]);
      }
      return Promise.resolve([
        {
          name: 'Test City',
          country: 'Brazil',
          admin1: null,
          latitude: -27.5954,
          longitude: -48.548,
        },
      ]);
    },
  };

  const fakeWeatherProvider: WeatherProvider = {
    getDailyForecast: () => Promise.resolve([fakeDay]),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LOCATION_PROVIDER)
      .useValue(fakeLocationProvider)
      .overrideProvider(WEATHER_PROVIDER)
      .useValue(fakeWeatherProvider)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('resolves a city forecast through the real GraphQL schema and RankingService', () => {
    const query = `
      query {
        cityForecast(location: "Florianopolis") {
          location { name country }
          days {
            date
            activities { activity score reasoning }
          }
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200)
      .expect((res) => {
        const body = res.body as CityForecastResponseBody;
        const forecast = body.data?.cityForecast;
        expect(forecast?.location).toEqual({
          name: 'Test City',
          country: 'Brazil',
        });
        expect(forecast?.days).toHaveLength(1);
        const activities = forecast?.days[0].activities ?? [];
        expect(activities).toHaveLength(4);
        expect(activities.map((a) => a.activity).sort()).toEqual(
          [
            'INDOOR_SIGHTSEEING',
            'OUTDOOR_SIGHTSEEING',
            'SKIING',
            'SURFING',
          ].sort(),
        );
      });
  });

  it('returns a NOT_FOUND error with no leaked stacktrace when the city cannot be resolved', () => {
    const query = `
      query {
        cityForecast(location: "Nonexistent City") {
          location { name }
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200)
      .expect((res) => {
        const body = res.body as CityForecastResponseBody;
        const [error] = body.errors ?? [];
        expect(error.extensions.code).toBe('NOT_FOUND');
        expect(error.extensions.stacktrace).toBeUndefined();
        expect(error.extensions.originalError).toBeUndefined();
      });
  });
});

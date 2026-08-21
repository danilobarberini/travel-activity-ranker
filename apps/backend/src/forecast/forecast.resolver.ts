import { Inject, NotFoundException } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import {
  LOCATION_PROVIDER,
  type LocationProvider,
} from '../weather/interfaces/location-provider.interface';
import {
  WEATHER_PROVIDER,
  type WeatherProvider,
} from '../weather/interfaces/weather-provider.interface';
import { RankingService } from '../scoring/ranking.service';
import { CityForecastType } from './types/city-forecast.type';

@Resolver()
export class ForecastResolver {
  constructor(
    @Inject(LOCATION_PROVIDER)
    private readonly locationProvider: LocationProvider,
    @Inject(WEATHER_PROVIDER) private readonly weatherProvider: WeatherProvider,
    private readonly rankingService: RankingService,
  ) {}

  @Query(() => CityForecastType)
  async cityForecast(
    @Args('location') location: string,
  ): Promise<CityForecastType> {
    const [match] = await this.locationProvider.findByName(location, 1);
    if (!match) {
      throw new NotFoundException(`No city found for "${location}".`);
    }

    const days = await this.weatherProvider.getDailyForecast(
      match.latitude,
      match.longitude,
    );
    const rankings = this.rankingService.rankDailyWeather(days);
    const activitiesByDate = new Map(
      rankings.map((ranking) => [ranking.date, ranking.activities]),
    );

    return {
      location: match,
      days: days.map((day) => ({
        date: day.date,
        weather: day,
        activities: activitiesByDate.get(day.date) ?? [],
      })),
    };
  }
}

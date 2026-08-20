import { Inject, Injectable } from '@nestjs/common';
import { NormalizedDailyWeather } from '../weather/interfaces/normalized-daily-weather.interface';
import {
  ACTIVITY_SCORERS,
  ActivityScorer,
} from './interfaces/activity-scorer.interface';
import { DayRanking } from './interfaces/day-ranking.interface';

@Injectable()
export class RankingService {
  constructor(
    @Inject(ACTIVITY_SCORERS) private readonly scorers: ActivityScorer[],
  ) {}

  rankDailyWeather(days: NormalizedDailyWeather[]): DayRanking[] {
    return days.map((day) => ({
      date: day.date,
      activities: this.scorers.map((scorer) => ({
        activity: scorer.activity,
        ...scorer.score(day),
      })),
    }));
  }
}

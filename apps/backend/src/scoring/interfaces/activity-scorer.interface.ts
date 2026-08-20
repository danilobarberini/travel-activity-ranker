import { NormalizedDailyWeather } from '../../weather/interfaces/normalized-daily-weather.interface';
import { ActivityType } from '../enums/activity-type.enum';

export interface ScoreResult {
  /** 0-100, or `null` when there isn't enough data to assess this activity (e.g. surf with no wave data). */
  score: number | null;
  reasoning: string[];
}

export const ACTIVITY_SCORERS = Symbol('ACTIVITY_SCORERS');

export interface ActivityScorer {
  readonly activity: ActivityType;
  score(day: NormalizedDailyWeather): ScoreResult;
}

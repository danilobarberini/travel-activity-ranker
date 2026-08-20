import { ActivityType } from '../enums/activity-type.enum';

export interface ActivityScore {
  activity: ActivityType;
  score: number | null;
  reasoning: string[];
}

export interface DayRanking {
  date: string;
  activities: ActivityScore[];
}

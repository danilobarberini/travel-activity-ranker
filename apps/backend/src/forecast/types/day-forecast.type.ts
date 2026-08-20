import { Field, ObjectType } from '@nestjs/graphql';
import { DailyWeatherType } from './daily-weather.type';
import { ActivityScoreType } from './activity-score.type';

@ObjectType()
export class DayForecastType {
  @Field()
  date: string;

  @Field(() => DailyWeatherType)
  weather: DailyWeatherType;

  @Field(() => [ActivityScoreType])
  activities: ActivityScoreType[];
}

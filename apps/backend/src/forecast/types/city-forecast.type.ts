import { Field, ObjectType } from '@nestjs/graphql';
import { LocationType } from './location.type';
import { DayForecastType } from './day-forecast.type';

@ObjectType()
export class CityForecastType {
  @Field(() => LocationType)
  location: LocationType;

  @Field(() => [DayForecastType])
  days: DayForecastType[];
}

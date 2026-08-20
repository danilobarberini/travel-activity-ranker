import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DailyWeatherType {
  @Field()
  date: string;

  @Field(() => Float)
  temperatureMaxC: number;

  @Field(() => Float)
  temperatureMinC: number;

  @Field(() => Float)
  precipitationSumMm: number;

  @Field(() => Float)
  snowfallSumCm: number;

  @Field(() => Float)
  windSpeedMaxKmh: number;

  @Field(() => Int)
  weatherCode: number;

  @Field(() => Float)
  sunshineDurationSeconds: number;

  @Field(() => Float)
  uvIndexMax: number;

  @Field(() => Float, { nullable: true })
  waveHeightMaxM: number | null;

  @Field(() => Float, { nullable: true })
  wavePeriodMaxS: number | null;

  @Field(() => Float, { nullable: true })
  windWaveHeightMaxM: number | null;
}

import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LocationType {
  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  country: string | null;

  @Field(() => String, { nullable: true })
  admin1: string | null;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;
}

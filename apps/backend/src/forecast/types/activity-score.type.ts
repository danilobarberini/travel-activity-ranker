import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ActivityType } from '../../scoring/enums/activity-type.enum';
import '../graphql-enums';

@ObjectType()
export class ActivityScoreType {
  @Field(() => ActivityType)
  activity: ActivityType;

  @Field(() => Int, { nullable: true })
  score: number | null;

  @Field(() => [String])
  reasoning: string[];
}

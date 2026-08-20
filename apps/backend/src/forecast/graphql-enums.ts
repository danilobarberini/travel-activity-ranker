import { registerEnumType } from '@nestjs/graphql';
import { ActivityType } from '../scoring/enums/activity-type.enum';

registerEnumType(ActivityType, {
  name: 'ActivityType',
  description: 'An activity that gets ranked for a given day.',
});

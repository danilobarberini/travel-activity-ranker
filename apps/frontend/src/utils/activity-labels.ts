import type { ActivityType } from '../graphql/generated/graphql';

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  SKIING: 'Esqui',
  SURFING: 'Surf',
  OUTDOOR_SIGHTSEEING: 'Passeio ao ar livre',
  INDOOR_SIGHTSEEING: 'Passeio indoor',
};

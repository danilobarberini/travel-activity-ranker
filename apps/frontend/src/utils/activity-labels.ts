import type { ActivityType } from '../graphql/generated/graphql';

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  SKIING: 'Esqui',
  SURFING: 'Surf',
  OUTDOOR_SIGHTSEEING: 'Passeios ao ar livre',
  INDOOR_SIGHTSEEING: 'Passeios indoor',
};

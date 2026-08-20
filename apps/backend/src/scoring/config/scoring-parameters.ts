import { ActivityType } from '../enums/activity-type.enum';

interface SkiingScoringParams {
  SNOW_SAFE_MAX_TEMP_C: number;
  SNOW_MELT_WARNING_TEMP_C: number;
  STRONG_WIND_KMH: number;
  MODERATE_WIND_KMH: number;
  RAIN_ON_SNOW_MM: number;
}

interface SurfingScoringParams {
  FLAT_MAX_M: number;
  SMALL_MAX_M: number;
  GOOD_MAX_M: number;
  BIG_MAX_M: number;
  LONG_PERIOD_S: number;
  SHORT_PERIOD_S: number;
  STRONG_WIND_KMH: number;
}

interface OutdoorSightseeingScoringParams {
  HEAVY_RAIN_MM: number;
  LIGHT_RAIN_MM: number;
  EXTREME_HEAT_C: number;
  EXTREME_COLD_C: number;
  WARM_C: number;
  COOL_C: number;
  STRONG_WIND_KMH: number;
  HIGH_SUNSHINE_SECONDS: number;
  LOW_SUNSHINE_SECONDS: number;
}

interface IndoorSightseeingScoringParams {
  BASELINE_SCORE: number;
  SEVERE_RAIN_MM: number;
  SEVERE_WIND_KMH: number;
  NOTABLE_RAIN_MM: number;
  EXTREME_HEAT_C: number;
  EXTREME_COLD_C: number;
}

interface ScoringParametersMap {
  [ActivityType.SKIING]: SkiingScoringParams;
  [ActivityType.SURFING]: SurfingScoringParams;
  [ActivityType.OUTDOOR_SIGHTSEEING]: OutdoorSightseeingScoringParams;
  [ActivityType.INDOOR_SIGHTSEEING]: IndoorSightseeingScoringParams;
}

const SCORING_PARAMETERS: ScoringParametersMap = {
  [ActivityType.SKIING]: {
    SNOW_SAFE_MAX_TEMP_C: 2,
    SNOW_MELT_WARNING_TEMP_C: 5,
    STRONG_WIND_KMH: 50,
    MODERATE_WIND_KMH: 30,
    RAIN_ON_SNOW_MM: 5,
  },
  [ActivityType.SURFING]: {
    FLAT_MAX_M: 0.3,
    SMALL_MAX_M: 0.6,
    GOOD_MAX_M: 2.5,
    BIG_MAX_M: 3.5,
    LONG_PERIOD_S: 9,
    SHORT_PERIOD_S: 6,
    STRONG_WIND_KMH: 35,
  },
  [ActivityType.OUTDOOR_SIGHTSEEING]: {
    HEAVY_RAIN_MM: 10,
    LIGHT_RAIN_MM: 2,
    EXTREME_HEAT_C: 34,
    EXTREME_COLD_C: 5,
    WARM_C: 30,
    COOL_C: 10,
    STRONG_WIND_KMH: 40,
    HIGH_SUNSHINE_SECONDS: 6 * 3600,
    LOW_SUNSHINE_SECONDS: 2 * 3600,
  },
  [ActivityType.INDOOR_SIGHTSEEING]: {
    BASELINE_SCORE: 85,
    SEVERE_RAIN_MM: 30,
    SEVERE_WIND_KMH: 60,
    NOTABLE_RAIN_MM: 5,
    EXTREME_HEAT_C: 38,
    EXTREME_COLD_C: -10,
  },
};

/**
 * Single seam for reading scoring thresholds. Today it's a synchronous, in-memory
 * lookup; if these ever need to become admin-tunable (e.g. backed by a database),
 * this is the one function whose signature changes (it would become async) — that
 * ripples into `ActivityScorer.score()` and `RankingService` too, so it's not a
 * free swap, but it IS the one seam that needs to move. The scoring logic inside
 * each scorer wouldn't change at all.
 */
export function getScoringParameters<T extends ActivityType>(
  activity: T,
): ScoringParametersMap[T] {
  return SCORING_PARAMETERS[activity];
}

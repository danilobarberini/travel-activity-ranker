import { Injectable } from '@nestjs/common';
import { NormalizedDailyWeather } from '../../weather/interfaces/normalized-daily-weather.interface';
import {
  ActivityScorer,
  ScoreResult,
} from '../interfaces/activity-scorer.interface';
import { ActivityType } from '../enums/activity-type.enum';
import { clampScore } from '../utils/clamp-score';
import { getScoringParameters } from '../config/scoring-parameters';

@Injectable()
export class IndoorSightseeingScorer implements ActivityScorer {
  readonly activity = ActivityType.INDOOR_SIGHTSEEING;

  score(day: NormalizedDailyWeather): ScoreResult {
    const {
      BASELINE_SCORE,
      SEVERE_RAIN_MM,
      SEVERE_WIND_KMH,
      NOTABLE_RAIN_MM,
      EXTREME_HEAT_C,
      EXTREME_COLD_C,
    } = getScoringParameters(ActivityType.INDOOR_SIGHTSEEING);

    // Deliberately NOT the inverse of the outdoor score: a museum is fine on a mildly
    // rainy day, but a severe storm is a bad day for every activity, indoor included
    // High stable baseline, only extreme weather deducts.
    let score = BASELINE_SCORE;
    const reasoning: string[] = ['Passeios indoor dependem pouco do clima'];

    if (
      day.precipitationSumMm > SEVERE_RAIN_MM ||
      day.windSpeedMaxKmh > SEVERE_WIND_KMH
    ) {
      score -= 30;
      reasoning.push('Clima severo pode dificultar o deslocamento até o local');
    } else if (day.precipitationSumMm > NOTABLE_RAIN_MM) {
      reasoning.push('Boa opção para fugir da chuva');
    }

    if (
      day.temperatureMaxC > EXTREME_HEAT_C ||
      day.temperatureMinC < EXTREME_COLD_C
    ) {
      score -= 15;
      reasoning.push('Temperatura extrema pode tornar o trajeto desagradável');
    }

    return { score: clampScore(score), reasoning };
  }
}

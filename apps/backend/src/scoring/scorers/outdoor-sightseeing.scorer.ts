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
export class OutdoorSightseeingScorer implements ActivityScorer {
  readonly activity = ActivityType.OUTDOOR_SIGHTSEEING;

  score(day: NormalizedDailyWeather): ScoreResult {
    const {
      HEAVY_RAIN_MM,
      LIGHT_RAIN_MM,
      EXTREME_HEAT_C,
      EXTREME_COLD_C,
      WARM_C,
      COOL_C,
      STRONG_WIND_KMH,
      HIGH_SUNSHINE_SECONDS,
      LOW_SUNSHINE_SECONDS,
    } = getScoringParameters(ActivityType.OUTDOOR_SIGHTSEEING);

    let score = 100;
    const reasoning: string[] = [];

    if (day.precipitationSumMm > HEAVY_RAIN_MM) {
      score -= 50;
      reasoning.push(`Chuva forte prevista (${day.precipitationSumMm}mm)`);
    } else if (day.precipitationSumMm > LIGHT_RAIN_MM) {
      score -= 20;
      reasoning.push(`Alguma chuva prevista (${day.precipitationSumMm}mm)`);
    }

    if (
      day.temperatureMaxC > EXTREME_HEAT_C ||
      day.temperatureMinC < EXTREME_COLD_C
    ) {
      score -= 30;
      reasoning.push('Temperatura extrema');
    } else if (day.temperatureMaxC > WARM_C || day.temperatureMinC < COOL_C) {
      score -= 10;
      reasoning.push('Temperatura um pouco fora do ideal');
    }

    if (day.windSpeedMaxKmh > STRONG_WIND_KMH) {
      score -= 20;
      reasoning.push(`Vento forte (${day.windSpeedMaxKmh} km/h)`);
    }

    if (day.sunshineDurationSeconds > HIGH_SUNSHINE_SECONDS) {
      reasoning.push('Bastante sol ao longo do dia');
    } else if (day.sunshineDurationSeconds < LOW_SUNSHINE_SECONDS) {
      score -= 10;
      reasoning.push('Pouco sol, dia mais nublado');
    }

    return { score: clampScore(score), reasoning };
  }
}

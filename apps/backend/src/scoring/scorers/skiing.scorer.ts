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
export class SkiingScorer implements ActivityScorer {
  readonly activity = ActivityType.SKIING;

  score(day: NormalizedDailyWeather): ScoreResult {
    const {
      SNOW_SAFE_MAX_TEMP_C,
      SNOW_MELT_WARNING_TEMP_C,
      STRONG_WIND_KMH,
      MODERATE_WIND_KMH,
      RAIN_ON_SNOW_MM,
    } = getScoringParameters(ActivityType.SKIING);

    let score = 100;
    const reasoning: string[] = [];

    if (day.temperatureMaxC > SNOW_MELT_WARNING_TEMP_C) {
      score -= 60;
      reasoning.push(
        `Muito quente para a neve se manter (máx ${day.temperatureMaxC}°C)`,
      );
    } else if (day.temperatureMaxC > SNOW_SAFE_MAX_TEMP_C) {
      score -= 25;
      reasoning.push(
        `Temperatura no limite para a neve derreter (máx ${day.temperatureMaxC}°C)`,
      );
    } else {
      reasoning.push(
        `Frio o suficiente para manter a neve (máx ${day.temperatureMaxC}°C)`,
      );
    }

    if (day.snowfallSumCm > 0) {
      reasoning.push(`Queda de neve prevista (${day.snowfallSumCm}cm)`);
    } else {
      score -= 15;
      reasoning.push('Sem neve nova prevista');
    }

    if (day.windSpeedMaxKmh > STRONG_WIND_KMH) {
      score -= 30;
      reasoning.push(
        `Vento muito forte, risco de fechamento de teleférico (${day.windSpeedMaxKmh} km/h)`,
      );
    } else if (day.windSpeedMaxKmh > MODERATE_WIND_KMH) {
      score -= 10;
      reasoning.push(`Vento moderado (${day.windSpeedMaxKmh} km/h)`);
    }

    if (
      day.precipitationSumMm > RAIN_ON_SNOW_MM &&
      day.temperatureMaxC > SNOW_SAFE_MAX_TEMP_C
    ) {
      score -= 20;
      reasoning.push('Chuva sobre neve prejudica as condições');
    }

    return { score: clampScore(score), reasoning };
  }
}

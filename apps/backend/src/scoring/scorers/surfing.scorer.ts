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
export class SurfingScorer implements ActivityScorer {
  readonly activity = ActivityType.SURFING;

  score(day: NormalizedDailyWeather): ScoreResult {
    // See NormalizedDailyWeather's doc comment: null means no wave data for this day
    // (inland location, or a genuinely coastal point with a data gap) — never fabricate
    // a number here.
    if (day.waveHeightMaxM === null) {
      return {
        score: null,
        reasoning: ['Sem dados de ondas disponíveis para esta localização/dia'],
      };
    }

    const {
      FLAT_MAX_M,
      SMALL_MAX_M,
      GOOD_MAX_M,
      BIG_MAX_M,
      LONG_PERIOD_S,
      SHORT_PERIOD_S,
      STRONG_WIND_KMH,
    } = getScoringParameters(ActivityType.SURFING);

    let score = 100;
    const reasoning: string[] = [];
    const waveHeight = day.waveHeightMaxM;

    if (waveHeight < FLAT_MAX_M) {
      score -= 60;
      reasoning.push(`Mar quase sem ondulação (${waveHeight}m)`);
    } else if (waveHeight < SMALL_MAX_M) {
      score -= 25;
      reasoning.push(`Ondulação pequena (${waveHeight}m)`);
    } else if (waveHeight <= GOOD_MAX_M) {
      reasoning.push(`Altura de onda numa faixa boa (${waveHeight}m)`);
    } else if (waveHeight <= BIG_MAX_M) {
      score -= 20;
      reasoning.push(
        `Ondas grandes, para surfistas experientes (${waveHeight}m)`,
      );
    } else {
      score -= 50;
      reasoning.push(
        `Ondas muito grandes para a maioria dos surfistas (${waveHeight}m)`,
      );
    }

    if (day.wavePeriodMaxS !== null) {
      if (day.wavePeriodMaxS >= LONG_PERIOD_S) {
        reasoning.push(
          `Período de onda longo, indicando swell bem formado (${day.wavePeriodMaxS}s)`,
        );
      } else if (day.wavePeriodMaxS < SHORT_PERIOD_S) {
        score -= 15;
        reasoning.push(
          `Período de onda curto, mar mais bagunçado (${day.wavePeriodMaxS}s)`,
        );
      }
    }

    if (day.windSpeedMaxKmh > STRONG_WIND_KMH) {
      score -= 15;
      reasoning.push(
        `Vento forte pode prejudicar a qualidade das ondas (${day.windSpeedMaxKmh} km/h)`,
      );
    }

    return { score: clampScore(score), reasoning };
  }
}

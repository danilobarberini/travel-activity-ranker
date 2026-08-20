import { Module } from '@nestjs/common';
import { ACTIVITY_SCORERS } from './interfaces/activity-scorer.interface';
import { SkiingScorer } from './scorers/skiing.scorer';
import { SurfingScorer } from './scorers/surfing.scorer';
import { OutdoorSightseeingScorer } from './scorers/outdoor-sightseeing.scorer';
import { IndoorSightseeingScorer } from './scorers/indoor-sightseeing.scorer';
import { RankingService } from './ranking.service';

@Module({
  providers: [
    SkiingScorer,
    SurfingScorer,
    OutdoorSightseeingScorer,
    IndoorSightseeingScorer,
    {
      provide: ACTIVITY_SCORERS,
      useFactory: (
        skiing: SkiingScorer,
        surfing: SurfingScorer,
        outdoor: OutdoorSightseeingScorer,
        indoor: IndoorSightseeingScorer,
      ) => [skiing, surfing, outdoor, indoor],
      inject: [
        SkiingScorer,
        SurfingScorer,
        OutdoorSightseeingScorer,
        IndoorSightseeingScorer,
      ],
    },
    RankingService,
  ],
  exports: [RankingService],
})
export class ScoringModule {}

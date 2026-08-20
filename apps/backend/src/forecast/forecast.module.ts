import { Module } from '@nestjs/common';
import { WeatherModule } from '../weather/weather.module';
import { ScoringModule } from '../scoring/scoring.module';
import { ForecastResolver } from './forecast.resolver';

@Module({
  imports: [WeatherModule, ScoringModule],
  providers: [ForecastResolver],
})
export class ForecastModule {}

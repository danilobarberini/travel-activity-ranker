import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LOCATION_PROVIDER } from './interfaces/location-provider.interface';
import { WEATHER_PROVIDER } from './interfaces/weather-provider.interface';
import { OpenMeteoLocationProvider } from './providers/open-meteo-location.provider';
import { OpenMeteoWeatherProvider } from './providers/open-meteo-weather.provider';

@Module({
  // Axios has no default timeout, so an unresponsive Open-Meteo would hang
  // the request indefinitely without this.
  imports: [HttpModule.register({ timeout: 5000 })],
  providers: [
    { provide: LOCATION_PROVIDER, useClass: OpenMeteoLocationProvider },
    { provide: WEATHER_PROVIDER, useClass: OpenMeteoWeatherProvider },
  ],
  exports: [LOCATION_PROVIDER, WEATHER_PROVIDER],
})
export class WeatherModule {}

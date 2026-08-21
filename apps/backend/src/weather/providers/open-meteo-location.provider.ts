import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LocationProvider } from '../interfaces/location-provider.interface';
import { NormalizedLocation } from '../interfaces/normalized-location.interface';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';

interface RawGeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

interface RawGeocodingResponse {
  results?: RawGeocodingResult[];
}

@Injectable()
export class OpenMeteoLocationProvider implements LocationProvider {
  constructor(private readonly http: HttpService) {}

  async findByName(query: string, limit = 5): Promise<NormalizedLocation[]> {
    const { data } = await firstValueFrom(
      this.http.get<RawGeocodingResponse>(`${GEOCODING_BASE_URL}/search`, {
        params: { name: query, count: limit, language: 'en', format: 'json' },
      }),
    );

    return (data.results ?? []).map((result) => ({
      name: result.name,
      country: result.country ?? null,
      admin1: result.admin1 ?? null,
      latitude: result.latitude,
      longitude: result.longitude,
    }));
  }
}

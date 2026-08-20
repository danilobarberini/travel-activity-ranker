import { NormalizedLocation } from './normalized-location.interface';

export const LOCATION_PROVIDER = Symbol('LOCATION_PROVIDER');

export interface LocationProvider {
  findByName(query: string, limit?: number): Promise<NormalizedLocation[]>;
}

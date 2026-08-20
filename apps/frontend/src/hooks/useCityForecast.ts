import { useQuery } from '@apollo/client/react';
import { CITY_FORECAST_QUERY } from '../graphql/queries/city-forecast';

export function useCityForecast(location: string | null) {
  const { data, loading, error } = useQuery(CITY_FORECAST_QUERY, {
    variables: { location: location ?? '' },
    skip: !location,
  });

  return {
    forecast: data?.cityForecast ?? null,
    loading,
    error,
  };
}

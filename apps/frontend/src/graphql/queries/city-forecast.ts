import { graphql } from '../generated';

export const CITY_FORECAST_QUERY = graphql(`
  query CityForecast($location: String!) {
    cityForecast(location: $location) {
      location {
        name
        country
        admin1
      }
      days {
        date
        weather {
          temperatureMaxC
          temperatureMinC
          precipitationSumMm
        }
        activities {
          activity
          score
          reasoning
        }
      }
    }
  }
`);

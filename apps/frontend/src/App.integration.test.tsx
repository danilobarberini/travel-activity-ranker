import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing/react';
import App from './App';
import { CITY_FORECAST_QUERY } from './graphql/queries/city-forecast';

/**
 * Integration test: renders the real App tree (form + hook + Apollo cache +
 * results components) with only the network layer mocked. Component-level
 * unit tests (ActivityScoreBadge, CitySearchForm, etc.) already cover each
 * piece in isolation; this covers whether they're actually wired together —
 * whether typing a city really flows through useCityForecast → Apollo →
 * ForecastResults and produces the right screen.
 */
const mockForecastData = {
  cityForecast: {
    __typename: 'CityForecastType' as const,
    location: {
      __typename: 'LocationType' as const,
      name: 'Florianópolis',
      country: 'Brazil',
      admin1: 'Santa Catarina',
    },
    days: [
      {
        __typename: 'DayForecastType' as const,
        date: '2026-08-20',
        weather: {
          __typename: 'DailyWeatherType' as const,
          temperatureMaxC: 24,
          temperatureMinC: 18,
          precipitationSumMm: 0,
          snowfallSumCm: 0,
        },
        activities: [
          {
            __typename: 'ActivityScoreType' as const,
            activity: 'SKIING' as const,
            score: 25,
            reasoning: ['Too warm'],
          },
          {
            __typename: 'ActivityScoreType' as const,
            activity: 'SURFING' as const,
            score: 75,
            reasoning: ['Small swell'],
          },
          {
            __typename: 'ActivityScoreType' as const,
            activity: 'OUTDOOR_SIGHTSEEING' as const,
            score: 100,
            reasoning: ['Plenty of sunshine throughout the day'],
          },
          {
            __typename: 'ActivityScoreType' as const,
            activity: 'INDOOR_SIGHTSEEING' as const,
            score: 85,
            reasoning: ['Indoor activities depend little on the weather'],
          },
        ],
      },
    ],
  },
};

describe('App (integration)', () => {
  it('searches a city and renders the forecast the GraphQL layer returns', async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: CITY_FORECAST_QUERY,
          variables: { location: 'Florianópolis' },
        },
        result: { data: mockForecastData },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <App />
      </MockedProvider>,
    );

    await user.type(screen.getByLabelText(/city/i), 'Florianópolis');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Florianópolis, Brazil')).toBeInTheDocument();
    });

    // Outdoor sightseeing scored highest (100) — it should be the highlighted
    // "Recommended" pick AND appear again in the badge list below, proving
    // the real getBestActivityForDay ran on data that came from the (mocked)
    // network, not from a stub.
    expect(screen.getAllByText('Outdoor sightseeing')).toHaveLength(2);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('shows the backend-provided message for a GraphQL-level error (e.g. city not found)', async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: CITY_FORECAST_QUERY,
          variables: { location: 'Nonexistent City' },
        },
        // A GraphQL response with an `errors` array — what the real backend
        // sends back for a NotFoundException, formatted by formatGraphQLError.
        result: {
          errors: [{ message: 'No city found for "Nonexistent City".' }],
        },
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <App />
      </MockedProvider>,
    );

    await user.type(screen.getByLabelText(/city/i), 'Nonexistent City');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/no city found/i);
    });
  });

  it('hides the raw network error behind a friendly message when the request fails outright', async () => {
    const user = userEvent.setup();
    const mocks = [
      {
        request: {
          query: CITY_FORECAST_QUERY,
          variables: { location: 'Florianopolis' },
        },
        // Simulates the link/fetch layer failing entirely (backend down, CORS
        // blocked, offline) — the raw error is a browser-level "Failed to
        // fetch", which a user should never see.
        error: new TypeError('Failed to fetch'),
      },
    ];

    render(
      <MockedProvider mocks={mocks}>
        <App />
      </MockedProvider>,
    );

    await user.type(screen.getByLabelText(/city/i), 'Florianopolis');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/could not connect/i);
      expect(alert).not.toHaveTextContent(/failed to fetch/i);
    });
  });
});

import { GraphQLFormattedError } from 'graphql';
import { formatGraphQLError } from './graphql-error-formatter';

function buildError(
  overrides: Partial<GraphQLFormattedError> = {},
): GraphQLFormattedError {
  return {
    message: 'Something went wrong',
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      status: 500,
      stacktrace: ['at some/internal/path.ts:42'],
      originalError: { message: 'Something went wrong', statusCode: 500 },
    },
    ...overrides,
  };
}

describe('formatGraphQLError', () => {
  it('maps a 404 status to a NOT_FOUND code', () => {
    const result = formatGraphQLError(
      buildError({
        extensions: { code: 'INTERNAL_SERVER_ERROR', status: 404 },
      }),
    );

    expect(result.extensions?.code).toBe('NOT_FOUND');
  });

  it('maps a 400 status to a BAD_USER_INPUT code', () => {
    const result = formatGraphQLError(
      buildError({
        extensions: { code: 'INTERNAL_SERVER_ERROR', status: 400 },
      }),
    );

    expect(result.extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('maps a 502 status to a BAD_GATEWAY code', () => {
    const result = formatGraphQLError(
      buildError({
        extensions: { code: 'INTERNAL_SERVER_ERROR', status: 502 },
      }),
    );

    expect(result.extensions?.code).toBe('BAD_GATEWAY');
  });

  it('falls back to INTERNAL_SERVER_ERROR for unmapped statuses', () => {
    const result = formatGraphQLError(
      buildError({ extensions: { status: 500 } }),
    );

    expect(result.extensions?.code).toBe('INTERNAL_SERVER_ERROR');
  });

  it('never leaks the stacktrace or originalError to the client', () => {
    const result = formatGraphQLError(buildError());

    expect(result.extensions?.stacktrace).toBeUndefined();
    expect(result.extensions?.originalError).toBeUndefined();
  });

  it('preserves the message and path', () => {
    const result = formatGraphQLError(
      buildError({
        message: 'No city found.',
        path: ['cityForecast'],
      }),
    );

    expect(result.message).toBe('No city found.');
    expect(result.path).toEqual(['cityForecast']);
  });
});

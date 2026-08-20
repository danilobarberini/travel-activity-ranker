import { GraphQLFormattedError } from 'graphql';

const CODE_BY_HTTP_STATUS: Record<number, string> = {
  400: 'BAD_USER_INPUT',
  404: 'NOT_FOUND',
  502: 'BAD_GATEWAY',
};

/**
 * Nest's default GraphQL error formatting leaves `extensions.code` as
 * "INTERNAL_SERVER_ERROR" for every thrown HttpException (even a 404 from
 * `NotFoundException`), and includes the full server stacktrace in the
 * response. This maps known HTTP status codes to a meaningful GraphQL error
 * code and drops anything else (stacktrace, originalError) that shouldn't
 * reach the client.
 */
export function formatGraphQLError(
  formattedError: GraphQLFormattedError,
): GraphQLFormattedError {
  const status = formattedError.extensions?.status as number | undefined;

  return {
    message: formattedError.message,
    ...(formattedError.locations
      ? { locations: formattedError.locations }
      : {}),
    ...(formattedError.path ? { path: formattedError.path } : {}),
    extensions: {
      code:
        (status && CODE_BY_HTTP_STATUS[status]) ??
        formattedError.extensions?.code ??
        'INTERNAL_SERVER_ERROR',
      ...(status ? { status } : {}),
    },
  };
}

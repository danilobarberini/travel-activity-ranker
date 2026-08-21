import { GraphQLFormattedError } from 'graphql';

const CODE_BY_HTTP_STATUS: Record<number, string> = {
  400: 'BAD_USER_INPUT',
  404: 'NOT_FOUND',
  429: 'RATE_LIMITED',
  502: 'BAD_GATEWAY',
};

/**
 * Nest's default GraphQL error formatting leaves `extensions.code` as
 * "INTERNAL_SERVER_ERROR" for every thrown HttpException, and includes the
 * full server stacktrace in the response. This maps known HTTP status codes
 * to a meaningful GraphQL error code and drops anything else (stacktrace,
 * originalError) that shouldn't reach the client.
 *
 * Where that status actually lands is inconsistent depending on the
 * exception (confirmed by inspecting the raw formatted error for both):
 * `NotFoundException` puts it at `extensions.status`, `BadRequestException`
 * only nests it in `extensions.originalError.statusCode` — so both are
 * checked rather than trusting either one alone.
 */
export function formatGraphQLError(
  formattedError: GraphQLFormattedError,
): GraphQLFormattedError {
  const originalError = formattedError.extensions?.originalError as
    { statusCode?: number } | undefined;
  const status =
    (formattedError.extensions?.status as number | undefined) ??
    originalError?.statusCode;

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

import { CombinedGraphQLErrors } from '@apollo/client/errors';

const GENERIC_NETWORK_MESSAGE =
  'Could not connect to the server. Check your connection and try again.';

/**
 * `CombinedGraphQLErrors` means the server responded and our own backend
 * produced the message (e.g. "No city found...") — safe to show
 * as-is. Anything else (a failed fetch, DNS error, CORS block, etc.) is a
 * link/network-level failure whose raw message ("Failed to fetch") is a
 * browser implementation detail, not something a user should see.
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    return error.message;
  }
  return GENERIC_NETWORK_MESSAGE;
}

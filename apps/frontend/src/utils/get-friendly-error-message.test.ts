import { describe, expect, it } from 'vitest';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { getFriendlyErrorMessage } from './get-friendly-error-message';

describe('getFriendlyErrorMessage', () => {
  it('passes through the backend-provided message for a GraphQL-level error', () => {
    const error = new CombinedGraphQLErrors({
      data: null,
      errors: [{ message: 'Nenhuma cidade encontrada para "asdkjf".' }],
    });

    expect(getFriendlyErrorMessage(error)).toBe(
      'Nenhuma cidade encontrada para "asdkjf".',
    );
  });

  it('hides the raw network error behind a friendly generic message', () => {
    const networkError = new TypeError('Failed to fetch');

    expect(getFriendlyErrorMessage(networkError)).toBe(
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
    );
  });

  it('falls back to the generic message for anything unrecognized', () => {
    expect(getFriendlyErrorMessage('a plain string, not an error object')).toBe(
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
    );
  });
});

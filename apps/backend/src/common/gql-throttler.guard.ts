import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

// ThrottlerGuard reads the request off the HTTP context by default, which
// doesn't exist for a GraphQL resolver — this pulls it from the GraphQL
// context instead so throttling can track requests per IP. Only the
// `cityForecast` query goes through GraphQL; `AppController`'s plain REST
// route still needs the default HTTP behavior, so only override when the
// execution context is actually GraphQL.
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext) {
    if (context.getType<'graphql'>() !== 'graphql') {
      return super.getRequestResponse(context);
    }

    const gqlCtx = GqlExecutionContext.create(context).getContext<{
      req: Record<string, unknown>;
      res: Record<string, unknown>;
    }>();
    return { req: gqlCtx.req, res: gqlCtx.res };
  }

  // Thrown as an HttpException, a rejection from a guard doesn't get its
  // status auto-attached to `extensions.status` the way one thrown inside a
  // resolver does (confirmed by inspecting the raw formatted error) — so
  // formatGraphQLError's status-based mapping would silently miss it. Throwing
  // a GraphQLError with explicit extensions here sidesteps that entirely.
  protected throwThrottlingException(): Promise<void> {
    throw new GraphQLError('Too many requests. Please try again shortly.', {
      extensions: { status: 429 },
    });
  }
}

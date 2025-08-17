import { Context, Schema } from "effect"
import { HttpApiMiddleware, HttpApiSecurity, OpenApi, HttpApiSchema } from "@effect/platform"

export class AuthenticatedUserContext extends Context.Tag("AuthenticatedUserContext")<
  AuthenticatedUserContext,
  {
    readonly userAddress: string;
    // readonly userId: string; // Not currently used, but can be added if needed
  }
>() {}

export class Unauthorized extends Schema.TaggedError<Unauthorized>()(
  "Unauthorized",
  {
    message: Schema.String
  },
  HttpApiSchema.annotations({ status: 401 })
) {}


export class Authentication extends HttpApiMiddleware.Tag<Authentication>()("Authentication", {
  optional: false,
  failure: Unauthorized,
  provides: AuthenticatedUserContext,
  security: {
    bearer: HttpApiSecurity.bearer.pipe(
      HttpApiSecurity.annotate(OpenApi.Format, 'jwt'),
    )
  }
}) {}
import { Effect, Context, Schema, Redacted, Layer } from "effect"
import { HttpApiMiddleware, HttpApiSecurity, OpenApi, HttpApiSchema } from "@effect/platform"
import { JwtService } from "./jwtService"

export class AuthenticatedUserContext extends Context.Tag("AuthenticatedUserContext")<
  AuthenticatedUserContext,
  {
    readonly userAddress: string;
    // readonly userId: string; // Not currently used, but can be added if needed
  }
>() {}

class Unauthorized extends Schema.TaggedError<Unauthorized>()(
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

export const AuthenticationLive = Layer.effect(
  Authentication,
  Effect.gen(function* () {
    const jwtService = yield* JwtService;
    return {
      // The key name "bearer" matches the security definition
      bearer: (token: Redacted.Redacted<string>) => // <-- Token is passed as parameter
        Effect.gen(function* () {
          const tokenValue = Redacted.value(token) // Extract the actual token value
          yield* Effect.log(`Received token: ${tokenValue.substring(0, 10)}...`)
          const payload = yield* jwtService.verifyToken(tokenValue);
          return {
            userAddress: payload.address,
            // userId: payload.userId,
          };
        }).pipe(
          Effect.mapError((error) => new Unauthorized({
            message: error.message
          }))
        )
    }
  })
)
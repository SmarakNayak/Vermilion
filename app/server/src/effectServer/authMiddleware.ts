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

export const AuthenticationLive = Layer.effect(
  Authentication,
  Effect.gen(function* () {
    const jwtService = yield* JwtService;
    return {
      // The key name "bearer" matches the security definition
      bearer: (token: Redacted.Redacted<string>) => // <-- Token is passed as parameter
        Effect.gen(function* () {
          const tokenValue = Redacted.value(token) // Extract the actual token value
          if (tokenValue === "") {
            return yield* Effect.fail(new Unauthorized({ message: "No Bearer token provided" }));
          }
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

export const AuthenticationTest = Layer.succeed(
  Authentication,
  Authentication.of({
    bearer: (token: Redacted.Redacted<string>) => Effect.gen(function* () {
      const tokenValue = Redacted.value(token);
      if (tokenValue === "") {
        return yield* Effect.fail(new Unauthorized({
          message: "No Bearer token provided"
        }));
      }
      return {
        userAddress: tokenValue, // For testing, we can use the token value as the user address
        // userId: "test-user-id",
      };
    })
  })
)
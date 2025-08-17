import { Effect, Redacted, Layer } from "effect"
import { JwtService } from "./jwtService"
import { Authentication, Unauthorized } from "../../../shared/api/authMiddleware";

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
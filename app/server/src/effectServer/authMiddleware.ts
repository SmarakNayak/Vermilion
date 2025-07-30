import { Effect, Context } from "effect"
import { HttpLayerRouter } from "@effect/platform"

export class AuthenticatedUserContext extends Context.Tag("AuthenticatedUserContext")<
  AuthenticatedUserContext,
  {
    readonly userAddress: string;
    readonly userId: string;
  }
>() {}

export const AuthMiddleware = HttpLayerRouter.middleware<{
  provides: AuthenticatedUserContext
}>()(
  Effect.gen(function* () {
    yield* Effect.log("Authenticating user...")
    return (httpEffect) => 
      Effect.provideService(httpEffect, AuthenticatedUserContext, {
        userAddress: "0x1234567890abcdef", // Replace with actual user address
        userId: "user-id-1234" // Replace with actual user ID
      })
  })
)
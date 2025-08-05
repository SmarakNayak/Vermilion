import { Data, Effect, Schema } from "effect";
import { ConfigService } from "../config";
import jwt from "jsonwebtoken";

export class JwtError extends Data.TaggedError("JwtError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

const JWTPayload = Schema.Struct({
  address: Schema.String,
  iat: Schema.optional(Schema.Number),
  exp: Schema.optional(Schema.Number)
})

export class JwtService extends Effect.Service<JwtService>()("JwtService", {
  effect: Effect.gen(function* () {
    const config = yield* ConfigService;
    const accessTokenSecret = config.access_token_secret;
    return {
      verifyToken: (token: string) => Effect.gen(function* () {
        const decoded = yield* Effect.try({
          try: () => jwt.verify(token, accessTokenSecret),
          catch: (err: any) => {
            if (err.name === 'TokenExpiredError') {
              return new JwtError({
                message: 'Your session has expired. Please sign in again.',
                cause: err
              })
            } else if (['invalid signature', 'jwt malformed'].includes(err.message)) {
              return new JwtError({
                message: 'Your authentication token is invalid. Please sign in again.',
                cause: err
              })
            } else {
              console.error('Unknown JWT verification error:', err);
              return new JwtError({
                message: err.name || 'Unknown JWT verification error',
                cause: err
              })
            }
          }
        });
        const payload = yield* Schema.decodeUnknown(JWTPayload)(decoded).pipe(
          Effect.mapError((error) => new JwtError({
            message: `JWT payload does not match schema: ${error.message}`,
            cause: error.cause
          }))
        );
        return payload;
      })
    }
  })
}) {};
import { HttpApiMiddleware, HttpServerRequest } from "@effect/platform"
import { Effect, Layer } from "effect"

export class Logger extends HttpApiMiddleware.Tag<Logger>()("Http/Logger") {}

export const LoggerLive = Layer.effect(
  Logger,
  Effect.gen(function* () {
    yield* Effect.log("creating Logger middleware")

    // Middleware implementation as an Effect
    // that can access the `HttpServerRequest` context.
    return Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest
      console.log(`CL Request: ${request.method} ${request.url}`)
      yield* Effect.log(`CL - Request: ${request.method} ${request.url}`)
    })
  })
)
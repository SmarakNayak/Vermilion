import { Result, Atom } from "@effect-atom/atom-react";
import { FetchHttpClient, HttpClient, HttpClientRequest } from "@effect/platform";
import { Context, Effect, Layer } from "effect";
import * as RustClient from '../api/rustClient/RustClient.js';
import { cleanErrorResult } from './atomHelpers.js';

// Define a service tag for the RustClientService
export class RustClientService extends Context.Tag("RustClientService")<
  RustClientService,
  RustClient.RustClient
>() {};

// Create a runtime that provides the RustClient
export const rustClientRuntime = Atom.runtime(
  Layer.effect(RustClientService, Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;
    const configuredClient = httpClient.pipe(
      HttpClient.mapRequest(HttpClientRequest.prependUrl("/api/"))
    );
    return RustClient.make(configuredClient);
  })).pipe(
    Layer.provide(FetchHttpClient.layer)
  )
);

import { AtomHttpApi, Result, useAtomValue } from "@effect-atom/atom-react";
import { FetchHttpClient, HttpClient, HttpClientRequest } from "@effect/platform";
import { Cause, Effect, Layer } from "effect";
import { EffectServerApi } from '../../../shared/api/effectServerApi';
import { type ApiError } from "../../../shared/api/apiErrors";
import type { HttpClientError } from "@effect/platform/HttpClientError";
import type { ParseResult } from "effect";
import useStore from '../store/zustand.js';

export class SocialClient extends AtomHttpApi.Tag<SocialClient>()("SocialClient", {
  api: EffectServerApi,
  httpClient: FetchHttpClient.layer,
  baseUrl: "/effect/",
}) {};

// Create authenticated HTTP client layer that gets token from zustand store
const authenticatedHttpClientLayer = Layer.effect(
  HttpClient.HttpClient,
  Effect.gen(function* () {
    const baseClient = yield* HttpClient.HttpClient;
    
    return baseClient.pipe(
      HttpClient.mapRequest((request) => {
        // Get token dynamically on each request using getState (not the hook)
        const { authToken } = useStore.getState(); // cannot call useStore() hook here -> we're not in react
        return authToken 
          ? HttpClientRequest.setHeader(request, "Authorization", `Bearer ${authToken}`)
          : request;
      })
    );
  })
).pipe(Layer.provide(FetchHttpClient.layer));

// Single social client that handles both authenticated and unauthenticated requests
export class AuthSocialClient extends AtomHttpApi.Tag<AuthSocialClient>()("AuthSocialClient", {
  api: EffectServerApi,
  httpClient: authenticatedHttpClientLayer,
  baseUrl: "/effect/",
}) {};

type SystemError = HttpClientError | ParseResult.ParseError;
type SocialClientError = ApiError | SystemError;

export const getErrorMessage = <E extends SocialClientError>(cause: Cause.Cause<E>) => {
  if (cause._tag === 'Fail') {
    // Check if it's a known API error by checking the _tag property
    if (cause.error._tag === 'Conflict' ||
        cause.error._tag === 'Forbidden' ||
        cause.error._tag === 'Issue' ||
        cause.error._tag === 'NotFound' ||
        cause.error._tag === 'Unauthorized') {
      return `: ${cause.error.message}`;
    }
    // For system errors (ParseError, HttpClientError), return generic message
    return ' for an unknown reason. Please try again.';
  }
  // For other causes, return generic message
  return ' for an unknown reason. Please try again.';
};
import { AtomHttpApi, Result, useAtomValue } from "@effect-atom/atom-react";
import { FetchHttpClient, HttpClient } from "@effect/platform";
import { Cause, Effect  } from "effect";
import { EffectServerApi } from '../../../shared/api/effectServerApi';
import { type ApiError } from "../../../shared/api/apiErrors";
import type { HttpClientError } from "@effect/platform/HttpClientError";
  import type { ParseResult } from "effect";
import type React from "react";

export class SocialClient extends AtomHttpApi.Tag<SocialClient>()("SocialClient", {
  api: EffectServerApi,
  httpClient: FetchHttpClient.layer,
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
      return `: ${cause.error.name} - ${cause.error.message}`;
    }
    // For system errors (ParseError, HttpClientError), return generic message
    return ' for an unknown reason. Please try again.';
  }
  // For other causes, return generic message
  return ' for an unknown reason. Please try again.';
};

export const SomeComponent: React.FC = () => {
  const home = useAtomValue(SocialClient.query("playlists", "home", {
    reactivityKeys: ["home"],
    timeToLive: 1000 * 20, // 20 seconds
  }));

  return (
    <div>
      <p>Home Playlists</p>
      <p>Home: {Result.getOrElse(home, () => 'ahhh nothing2')}</p>
    </div>
  );
}
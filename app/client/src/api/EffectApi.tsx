import { AtomHttpApi, Result, useAtomValue } from "@effect-atom/atom-react";
import { FetchHttpClient } from "@effect/platform";
import { EffectServerApi } from '../../../shared/api/effectServerApi';
import type React from "react";

class SocialClient extends AtomHttpApi.Tag<SocialClient>()("SocialClient", {
  api: EffectServerApi,
  httpClient: FetchHttpClient.layer,
  baseUrl: "http://localhost:1083",
}) {};

export const SomeComponent: React.FC = () => {
  const home = useAtomValue(SocialClient.query("playlists", "home", {
    reactivityKeys: ["home"],
    timeToLive: 1000 * 20, // 20 seconds
  }));

  return (
    <div>
      <p>Home Playlists</p>
      <p>Home: {Result.getOrElse(home, () => 'ahhh nothing')}</p>
    </div>
  );
}
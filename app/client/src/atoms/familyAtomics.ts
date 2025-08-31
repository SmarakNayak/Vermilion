import { Result, Atom } from "@effect-atom/atom-react";
import { AuthSocialClient } from "../api/EffectApi";
import { Option, Cause } from "effect";
import { flatMap, cleanErrorResult} from "./atomHelpers";


export const profileAtomFamily = Atom.family((user_address?: string) =>
  Atom.make((get) => {
    if (!user_address) return Result.success(Option.none());
    const profileResult = get(AuthSocialClient.query("profiles", "getProfileByAddress", {
      path: { user_address }
    }));
    const profileOption = Result.matchWithError(profileResult, {
      onInitial: (initial) => Result.initial(initial.waiting),
      onError: (error) => {
        if (error._tag === 'NotFound') return Result.success(Option.none());
        return Result.failure(Cause.die(error)); // No other errors will be possible. Defect to keep type clean without throwing
      },
      onSuccess: (success) => Result.success(Option.some(success.value)),
      onDefect: (defect) =>  Result.failure(Cause.die(defect)),
    });
    return profileOption;
  })
);

export const foldersAtomFamily = Atom.family((user_address?: string) =>
  Atom.make((get) => {
    if (!user_address) return Result.success([]);
    const profile = get(profileAtomFamily(user_address));
    let playlists = flatMap(profile, (x) => {
      return Option.match(x, {
        onSome: (profile) => {
          const user_id = profile.user_id;
          return get(AuthSocialClient.query("playlists", "getPlaylistsByUserIdPreview", {
            path: { user_id }
          })).pipe(cleanErrorResult);
        },
        onNone: () => Result.success([]),
      });
    });
    return playlists;
  })
);
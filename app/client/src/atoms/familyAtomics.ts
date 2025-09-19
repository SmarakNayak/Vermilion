import { Result, Atom } from "@effect-atom/atom-react";
import { AuthSocialClient } from "../api/EffectApi";
import { Option, Cause } from "effect";
import { flatMap, cleanErrorResult} from "./atomHelpers";

// profiles
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

export const profileFromIdAtomFamily = Atom.family((user_id?: string) =>
  Atom.make((get) => {
    if (!user_id) return Result.failure(Cause.die("No user ID provided"));
    const profileResult = get(AuthSocialClient.query("profiles", "getProfileById", {
      path: { user_id }
    })).pipe(cleanErrorResult);
    return profileResult;
  })
);

// bookmarks
export const foldersAtomFamily = Atom.family((user_address?: string) =>
  Atom.make((get) => {
    if (!user_address) return Result.success([]);
    const profile = get(profileAtomFamily(user_address));
    let playlists = flatMap(profile, (x) => {
      return Option.match(x, {
        onSome: (profile) => {
          const user_id = profile.user_id;
          return get(AuthSocialClient.query("playlists", "getPlaylistsByUserIdPreview", {
            path: { user_id },
            reactivityKeys: ['userFolders']
          })).pipe(cleanErrorResult);
        },
        onNone: () => Result.success([]),
      });
    });
    return playlists;
  })
);

export const folderAtomFamily = Atom.family((playlist_id?: string) =>
  Atom.make((get) => {
    if (!playlist_id) return Result.failure(Cause.die("No playlist ID provided"));
    const folder = get(AuthSocialClient.query("playlists", 'getPlaylist', {
      path: { playlist_id },
      reactivityKeys: [playlist_id]
    })).pipe(cleanErrorResult);
    return folder;
  })
);

export const folderInscriptionsAtomFamily = Atom.family((playlist_id?: string) =>
  Atom.make((get) => {
    if (!playlist_id) return Result.success([]);
    const inscriptions = get(AuthSocialClient.query("playlists", 'getPlaylistInscriptions', {
      path: { playlist_id },
      reactivityKeys: [playlist_id]
    })).pipe(cleanErrorResult);
    return inscriptions;
  })
);



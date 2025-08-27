import { useAtomValue, Result, Atom } from "@effect-atom/atom-react";
import useStore from "../store/zustand";
import { AuthSocialClient } from "../api/EffectApi";
import { ProfileView } from "../../../shared/types/effectProfile";
import { NotFound } from "../../../shared/api/apiErrors";
import type { HttpClientError } from "@effect/platform/HttpClientError";
import type { ParseResult } from "effect";
import { useMemo } from "react";
import { Option } from "effect";

type ProfileError = NotFound | HttpClientError | ParseResult.ParseError;

type AuthState =
  | { state: 'not-signed-in' }
  | { state: 'signed-in-no-profile'; wallet: any }
  | { state: 'signed-in-loading-profile'; wallet: any }
  | { state: 'signed-in-with-profile'; wallet: any; profile: typeof ProfileView.json.Type }
  | { state: 'signed-in-profile-error'; wallet: any; error: ProfileError | null; errorMessage: string };

export const userProfileAtomFam = Atom.family((user_address?: string) =>
  Atom.make((get) => {
    if (!user_address) return Result.success(Option.none());
    const profileResult = get(AuthSocialClient.query("profiles", "getProfileByAddress", {
      path: { user_address }
    })).pipe(
      Result.map(Option.some), // map result to result of option
      (result) => Result.builder(result)
        .onErrorTag('NotFound', () => Result.success(Option.none())) // if 404, return none
        .orElse(() => result) // else return unchanged result
    )
    return profileResult;
  }).pipe(Atom.keepAlive)
);

export const useAuth = (): AuthState => {
  const wallet = useStore(state => state.wallet);
  const isSignedIn = useStore(state => Boolean(state.wallet));
  const walletAddress = useStore(state => state.wallet?.ordinalsAddress);
  
  const userProfileAtom = userProfileAtomFam(walletAddress);
  const userProfile= useAtomValue(userProfileAtom);
  
  // we useMemo because returning a unmemoized object causes infinite renders in useEffects that depend on auth = useAuth()
  return useMemo(() => {
    if (!isSignedIn) {  
      return { state: 'not-signed-in' };  
    } else {
      switch (userProfile._tag) {  
        case 'Initial': return { state: 'signed-in-loading-profile', wallet };  
        case 'Success': {
          if (Option.isSome(userProfile.value)) {
            return { state: 'signed-in-with-profile', wallet, profile: userProfile.value.value };
          } else {
            return { state: 'signed-in-no-profile', wallet };
          }
        }
        case 'Failure': {  
          switch (userProfile.cause._tag) {
            case 'Fail': return { state: 'signed-in-profile-error', wallet, error: userProfile.cause.error, errorMessage: "Profile fetch failed for an unknown reason. Please try again." };
            default: return { state: 'signed-in-profile-error', wallet, error: null, errorMessage: 'Profile fetch failed for an unknown reason. Please try again.' };  
          }
        }
      }
    }
  }, [isSignedIn, userProfile._tag]);

};
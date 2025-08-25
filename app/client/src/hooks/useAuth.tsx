import { useAtomValue, Result } from "@effect-atom/atom-react";
import useStore from "../store/zustand";
import { AuthSocialClient } from "../api/EffectApi";
import { ProfileView } from "../../../shared/types/effectProfile";
import { NotFound } from "../../../shared/api/apiErrors";
import type { HttpClientError } from "@effect/platform/HttpClientError";
import type { ParseResult } from "effect";

type ProfileError = NotFound | HttpClientError | ParseResult.ParseError;
type AuthState =
  | { isSignedIn: false; wallet: undefined; hasProfile: false; userProfile: undefined; profileErrorMessage: null }
  | { isSignedIn: true; wallet: any; hasProfile: boolean; userProfile: Result.Result<typeof ProfileView.json.Type, ProfileError>; profileErrorMessage: string | null };

export const useAuth = (): AuthState => {
  const wallet = useStore(state => state.wallet);
  const isSignedIn = useStore(state => Boolean(state.wallet));
  
  const userProfileAtom = AuthSocialClient.query("profiles", "getProfileByAddress", {
    path: { user_address: wallet?.ordinalsAddress },
  });
  const userProfile= useAtomValue(userProfileAtom);
  const hasProfile = useAtomValue(userProfileAtom, (result) => {
    return result._tag === 'Success';
  });
  const profileErrorMessage = useAtomValue(userProfileAtom, (result) => {
    if (result._tag === 'Failure' && result.cause._tag === 'Fail') {
      //Not found is not a user facing error in this context - it just means no profile exists (which can be checked with hasProfile)
      return result.cause.error._tag === 'NotFound' ? null : result.cause.error.message;
    }
    if (result._tag === 'Failure') {
      return 'Failed to load user profile. Please refresh and try again.'
    }
    return null;
  });

  if (!isSignedIn) {
    return { 
      isSignedIn: false,
      wallet: undefined,
      hasProfile: false,
      userProfile: undefined,
      profileErrorMessage: null
     };
  }

  return { 
    isSignedIn, 
    wallet,
    hasProfile, 
    userProfile,
    profileErrorMessage
  };
};
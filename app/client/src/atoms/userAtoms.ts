import { Result, Atom } from "@effect-atom/atom-react";
import useStore from "../store/zustand";
import { AuthSocialClient } from "../api/EffectApi";
import { Option, Cause } from "effect";
import { cleanErrorResult } from "./atomHelpers";

export const userAddressAtom = Atom.make((get) => {  
  // Get initial value  
  const initialAddress: string | undefined = useStore.getState().wallet?.ordinalsAddress;
  const initialAddressOption = Option.fromNullable(initialAddress);

  // Set up subscription to store changes  
  const unsubscribe = useStore.subscribe((state) => {
    const newAddress = state.wallet?.ordinalsAddress;
    const newAddressOption = Option.fromNullable(newAddress);
    get.setSelf(newAddressOption);
  });

  // Clean up subscription when atom is disposed
  get.addFinalizer(() => unsubscribe());

  return initialAddressOption;  
}).pipe(Atom.keepAlive);

export const userProfileAtom = Atom.make((get) => {  
  const userAddressOption = get(userAddressAtom);
  if (Option.isNone(userAddressOption)) {
    return Result.success(Option.none());
  }
  const user_address = userAddressOption.value;
  const profile = get(AuthSocialClient.query("profiles", "getProfileByAddress", {
    path: { user_address }
  })).pipe(cleanErrorResult);
  const profileOption = Result.matchWithError(profile, {
    onInitial: (initial) => Result.initial(initial.waiting),
    onError: (error) => {
      if (error._tag === 'NotFound') return Result.success(Option.none());
      return Result.failure(Cause.die(error)); // No other errors will be possible. Defect to keep type clean without throwing
    },
    onSuccess: (success) => Result.success(Option.some(success.value)),
    onDefect: (defect) =>  Result.failure(Cause.die(defect)),
  });
  return profileOption;
}).pipe(Atom.keepAlive);
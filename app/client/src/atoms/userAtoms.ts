import { Result, Atom } from "@effect-atom/atom-react";
import useStore from "../store/zustand";
import { AuthSocialClient } from "../api/EffectApi";
import { Option } from "effect";

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
  const profileResult = get(AuthSocialClient.query("profiles", "getProfileByAddress", {
    path: { user_address }
  })).pipe(
    Result.map(Option.some), // map result to result of option
    (result) => Result.builder(result)
      .onErrorTag('NotFound', () => Result.success(Option.none())) // if 404, return none
      .orElse(() => result) // else return unchanged result
  )
  return profileResult;
}).pipe(Atom.keepAlive);
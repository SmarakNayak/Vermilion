import { Result } from "@effect-atom/atom-react";
import { Option } from "effect";

/**
 * Applies a function to the successful value of a `Result`, returning a new `Result`.
 * If the input is a failure or initial, propagates the state and error.
 *
 * @typeParam A - The type of the input success value.
 * @typeParam B - The type of the output success value.
 * @typeParam E1 - The type of the input error.
 * @typeParam E2 - The type of the output error.
 * @param result - The input `Result`.
 * @param f - The function to apply to the success value.
 * @returns A new `Result` with the mapped value or propagated error/initial state.
 */
export const flatMap = <A, B, E1, E2>(  
  result: Result.Result<A, E1>,  
  f: (value: A) => Result.Result<B, E2>  
): Result.Result<B, E1 | E2> => {  
  return Result.match(result, {  
    onInitial: (initial) => Result.initial<B, E1 | E2>(initial.waiting),  
    onFailure: (failure) => Result.failure<E1 | E2, B>(failure.cause, {  
      previousSuccess: Option.none(),  
      waiting: failure.waiting  
    }),  
    onSuccess: (success) => f(success.value)  
  });  
};

/**
 * Applies a pipable function to the successful value of a `Result`, returning a new `Result`.
 * If the input is a failure or initial, propagates the state and error.
 *
 * @typeParam A - The type of the input success value.
 * @typeParam B - The type of the output success value.
 * @typeParam E1 - The type of the input error.
 * @typeParam E2 - The type of the output error.
 * @param result - The input `Result`.
 * @param f - The function to apply to the success value.
 * @returns A new `Result` with the mapped value or propagated error/initial state.
 */
export const flatMapP = <A, B, E2>(  
  f: (value: A) => Result.Result<B, E2>  
) => <E1>(result: Result.Result<A, E1>): Result.Result<B, E1 | E2> => {  
  return Result.match(result, {  
    onInitial: (initial) => Result.initial<B, E1 | E2>(initial.waiting),  
    onFailure: (failure) => Result.failure<E1 | E2, B>(failure.cause, {  
      previousSuccess: Option.none(),  
      waiting: failure.waiting  
    }),  
    onSuccess: (success) => f(success.value)  
  });  
};
import { Atom, Result } from "@effect-atom/atom-react";
import { Cause, Option, Exit } from "effect";
import { type HttpClientError, isHttpClientError } from "@effect/platform/HttpClientError";
import { ParseResult } from "effect";

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
 * Cleans the error channel of a `Result` by removing
 * `HttpClientError` and `ParseError` types from the error union.
 *
 * If the error is an `HttpClientError` or a `ParseError`, it is converted to a defect
 * using `Cause.die`, effectively treating it as an unrecoverable error.
 * All other errors and states are propagated as-is.
 *
 * @typeParam A - The type of the success value.
 * @typeParam E - The type of the remaining error after cleaning.
 * @param result - The input `Result` with possible extra error types.
 * @returns A `Result` with only the cleaned error type.
 */
export const cleanErrorResult = <A, E>(
  result: Result.Result<A, E>
): Result.Result<A, Exclude<E, HttpClientError | ParseResult.ParseError>> => {
  return Result.matchWithError(result, {
    onInitial: (initial) => initial as Result.Result<A, Exclude<E, HttpClientError | ParseResult.ParseError>>,
    onError: (error, failure) => {
      if (isHttpClientError(error) || ParseResult.isParseError(error)) {
        return Result.failure(Cause.die(error));
      }
      return failure as Result.Result<A, Exclude<E, HttpClientError | ParseResult.ParseError>>;
    },
    onSuccess: (success) => success as Result.Result<A, Exclude<E, HttpClientError | ParseResult.ParseError>>,
    onDefect: (defect, failure) => failure as Result.Result<A, Exclude<E, HttpClientError | ParseResult.ParseError>>,
  });
};

/**  
 * Cleans the error channel of an `Exit` by removing  
 * `HttpClientError` and `ParseError` types from the error union.  
 *  
 * If the error is an `HttpClientError` or a `ParseError`, it is converted to a defect  
 * using `Cause.die`, effectively treating it as an unrecoverable error.  
 * All other errors and states are propagated as-is.  
 *  
 * @typeParam A - The type of the success value.  
 * @typeParam E - The type of the remaining error after cleaning.  
 * @param exit - The input `Exit` with possible extra error types.  
 * @returns An `Exit` with only the cleaned error type.  
 */  
export const cleanErrorExit = <T extends Exit.Exit<any, any>>(
  exit: T
): T extends Exit.Exit<infer A, infer E> 
  ? Exit.Exit<A, Exclude<E, HttpClientError | ParseResult.ParseError>>
  : never => {
  if (Exit.isSuccess(exit)) {
    return exit as any;
  }
  const cleanedCause = Cause.flatMap((exit as any).cause, (error: any) => {
    if (isHttpClientError(error) || ParseResult.isParseError(error)) {
      return Cause.die(error);
    }
    return Cause.fail(error);
  });
  return Exit.failCause(cleanedCause) as any;
};
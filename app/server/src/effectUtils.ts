import { Effect } from "effect";

export const withErrorContext = <E extends Error>(
  context: string
) =>
  <A, R>(effect: Effect.Effect<A, E, R>) =>
    effect.pipe(
      Effect.mapError((error) => {
        const newError = Object.create(Object.getPrototypeOf(error));
        Object.assign(newError, error, {
          message: `${context}: ${error.message}`,
        });
        return newError as E;
      })
    );
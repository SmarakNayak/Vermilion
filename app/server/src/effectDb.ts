import { PgClient } from "@effect/sql-pg";
import { Effect, Layer, Redacted } from "effect";
import { ConfigService } from "./config";

class EffectPostgres extends Effect.Service<EffectPostgres>()("EffectPostgres", {
  effect: Effect.gen(function* () {
    const sql = yield* PgClient.PgClient;
    return {
      query: (strings: TemplateStringsArray, ...values: any[]) => sql(strings, ...values),
      getClient: () => sql
    };
  })
}) {};

let configLayer = ConfigService.Default;
let dbLayer = Effect.gen(function* () {
  const config = yield* ConfigService;
  return PgClient.layer({
    host: config.db_host,
    port: 5432,
    database: config.db_name,
    username: config.db_user,
    password: Redacted.make(config.db_password),
  });
}).pipe(
  Layer.unwrapEffect
);
let dbWrapperLayer = EffectPostgres.Default;
let mainLayer = dbWrapperLayer.pipe(
  Layer.provide(dbLayer),
  Layer.provide(configLayer)
);

let program = Effect.gen(function* () {
  const db = yield* EffectPostgres;
  const result = yield* db.query`SELECT * FROM social.profiles`;
  yield* Effect.log(`Query result: ${JSON.stringify(result)}`);
  return result;
}).pipe(
  Effect.provide(mainLayer),
  Effect.catchAll((error) => Effect.logError(`Database error: ${error}`)),
  Effect.runPromise
);
import { parse } from "yaml";
import { PgClient } from "@effect/sql-pg";
import { Effect, pipe, Redacted } from "effect";

const configFile = Bun.file(`${process.env.HOME}/ord.yaml`);
const config = parse(await configFile.text());

const EffectDb = PgClient.layer({
  host: config.db_host,
  port: 5432,
  database: config.db_name,
  username: config.db_user,
  password: Redacted.make(config.db_password),
})

const program = (param: string) => Effect.gen(function* () {
  yield* Effect.log("Starting program with param: " + param);
  const sql = yield* PgClient.PgClient;
  yield* Effect.log("SQL Client initialized");
  const result = yield* sql`SELECT * FROM social.profiles WHERE username = ${param}`;
  yield* Effect.log("Query executed, result: " + JSON.stringify(result));
  return result;
});

pipe(
  program("test"),
  Effect.provide(EffectDb),
  Effect.runPromise
).then(result => {
  console.log("Program completed successfully:", result);
}).catch(error => {
  console.error("Program failed with error:", error);
});
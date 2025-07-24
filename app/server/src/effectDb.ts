
import { PgClient } from "@effect/sql-pg";
import { withErrorContext } from "./effectUtils";
import { Effect, Layer, Redacted } from "effect";
import { ConfigService } from "./config";

class SocialDbService extends Effect.Service<SocialDbService>()("EffectPostgres", {
  effect: Effect.gen(function* () {
    const sql = yield* PgClient.PgClient;
    return {
      query: (strings: TemplateStringsArray, ...values: any[]) => sql(strings, ...values),
      getClient: () => sql,
      setupDatabase: () => Effect.gen(function* () {
        yield* sql`CREATE SCHEMA IF NOT EXISTS social`.pipe(
          withErrorContext("Error creating social schema")
        );
        yield* sql`CREATE TABLE IF NOT EXISTS social.playlist_info (
          playlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          playlist_name TEXT NOT NULL,
          playlist_inscription_icon varchar(80),
          playlist_description TEXT,
          playlist_created_at TIMESTAMPTZ DEFAULT NOW(),
          playlist_updated_at TIMESTAMPTZ DEFAULT NOW()
        )`.pipe(
          Effect.tapError((error) => Effect.logError(`Error creating playlist_info table: ${error}`))
        );
        yield* sql`CREATE TABLE IF NOT EXISTS social.playlist_inscriptions (
          playlist_id UUID NOT NULL,
          inscription_id varchar(80) NOT NULL,
          playlist_position INT NOT NULL DEFAULT 0,
          added_at TIMESTAMPTZ DEFAULT NOW(),
          PRIMARY KEY (playlist_id, inscription_id),
          FOREIGN KEY (playlist_id) REFERENCES social.playlist_info(playlist_id) ON DELETE CASCADE,
          UNIQUE (playlist_id, playlist_position)
        )`.pipe(
          Effect.tapError((error) => Effect.logError(`Error creating playlist_inscriptions table: ${error}`))
        );
      }),
      createPlaylist: null,
      updatePlaylist: null,
      deletePlaylist: null,
      insertPlaylistInscriptions: null,
      updatePlaylistInscriptions: null,
      deletePlaylistInscriptions: null,
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
let dbWrapperLayer = SocialDbService.Default;
let mainLayer = dbWrapperLayer.pipe(
  Layer.provide(dbLayer),
  Layer.provide(configLayer)
);

let program = Effect.gen(function* () {
  const db = yield* SocialDbService;
  let creationResult = yield* db.setupDatabase();
  yield* Effect.log(`Database setup result: ${JSON.stringify(creationResult)}`);
  const result = yield* db.query`SELECT * FROM social.profiles`;
  yield* Effect.log(`Query result: ${JSON.stringify(result)}`);
  return result;
}).pipe(
  Effect.provide(mainLayer),
  Effect.catchAll((error) => Effect.logError(`Database error: ${error}`)),
  Effect.runPromise
);
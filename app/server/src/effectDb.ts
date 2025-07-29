
import { PgClient } from "@effect/sql-pg";
import { withErrorContext } from "./effectUtils";
import { Effect, Layer, Redacted } from "effect";
import { ConfigService } from "./config";
import { NewPlaylistInfo, UpdatePlaylistInfo, InsertPlaylistInscriptions, UpdatePlaylistInscriptions } from "./types/playlist";

interface UserContext {
  userId: string;
  userAddress: string;
}

class SocialDbService extends Effect.Service<SocialDbService>()("EffectPostgres", {
  effect: Effect.gen(function* () {
    const sql = yield* PgClient.PgClient;
    
    const withUserContext = <A, E, R>(userContext: UserContext) => (query: Effect.Effect<A, E, R>) =>
      sql.withTransaction(Effect.gen(function* () {
        yield* sql`SELECT set_config('app.current_user_id', ${userContext.userId}, true)`;
        yield* sql`SELECT set_config('app.current_user_address', ${userContext.userAddress}, true)`;
        return yield* query;
      }));
    
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
          withErrorContext(`Error creating playlist_info table`)
        );
        yield* sql`
          ALTER TABLE social.playlist_info ENABLE ROW LEVEL SECURITY;
          DROP POLICY IF EXISTS playlist_info_policy_insert ON social.playlist_info;
          CREATE POLICY playlist_info_policy_insert ON social.playlist_info
            FOR INSERT
            WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);
          DROP POLICY IF EXISTS playlist_info_policy_update ON social.playlist_info;
          CREATE POLICY playlist_info_policy_update ON social.playlist_info
            FOR UPDATE
            USING (user_id = current_setting('app.current_user_id')::uuid);
          DROP POLICY IF EXISTS playlist_info_policy_delete ON social.playlist_info;
          CREATE POLICY playlist_info_policy_delete ON social.playlist_info
            FOR DELETE
            USING (user_id = current_setting('app.current_user_id')::uuid);
        `.pipe(
          withErrorContext(`Error setting up playlist_info RLS policies`)
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
          withErrorContext(`Error creating playlist_inscriptions table`)
        );
        yield* sql`
          ALTER TABLE social.playlist_inscriptions ENABLE ROW LEVEL SECURITY;
          DROP POLICY IF EXISTS playlist_inscriptions_policy_insert ON social.playlist_inscriptions;
          CREATE POLICY playlist_inscriptions_policy_insert ON social.playlist_inscriptions
            FOR INSERT
            WITH CHECK (playlist_id IN (SELECT playlist_id FROM social.playlist_info WHERE user_id = current_setting('app.current_user_id')::uuid));
          DROP POLICY IF EXISTS playlist_inscriptions_policy_update ON social.playlist_inscriptions;
          CREATE POLICY playlist_inscriptions_policy_update ON social.playlist_inscriptions
            FOR UPDATE
            USING (playlist_id IN (SELECT playlist_id FROM social.playlist_info WHERE user_id = current_setting('app.current_user_id')::uuid));
          DROP POLICY IF EXISTS playlist_inscriptions_policy_delete ON social.playlist_inscriptions;
          CREATE POLICY playlist_inscriptions_policy_delete ON social.playlist_inscriptions
            FOR DELETE
            USING (playlist_id IN (SELECT playlist_id FROM social.playlist_info WHERE user_id = current_setting('app.current_user_id')::uuid));
        `.pipe(
          withErrorContext('Error setting up playlist_inscriptions RLS policies')
        );
        yield* sql`
          CREATE OR REPLACE FUNCTION get_next_playlist_position(p_playlist_id UUID)
          RETURNS INTEGER AS $$
          BEGIN
            RETURN COALESCE(
              (SELECT MAX(playlist_position) + 1 
               FROM social.playlist_inscriptions 
               WHERE playlist_id = p_playlist_id), 
              0
            );
          END;
          $$ LANGUAGE plpgsql;
        `.pipe(
          withErrorContext("Error creating get_next_playlist_position function")
        );
      }),
      withUserContext: withUserContext,
      createPlaylist: (newPlaylist: NewPlaylistInfo, userContext: UserContext) => Effect.gen(function* () {
        let playlist_id = yield* sql`INSERT INTO social.playlist_info ${sql.insert(newPlaylist)} RETURNING playlist_id`.pipe(
          withUserContext(userContext),
          withErrorContext("Error creating new playlist")
        );
        return playlist_id;
      }),
      updatePlaylist: (updatePlaylist: UpdatePlaylistInfo, userContext: UserContext) => Effect.gen(function* () {
        const result = yield* sql`
          UPDATE social.playlist_info 
          SET ${sql.update(updatePlaylist)} 
          WHERE playlist_id = ${updatePlaylist.playlist_id} AND user_id = ${userContext.userId}
        `.pipe(
          withUserContext(userContext),
          withErrorContext("Error updating playlist"),
        );
        return result;
      }),
      deletePlaylist: (playlistId: string, userContext: UserContext) => Effect.gen(function* () {
        const result = yield* sql`
          DELETE FROM social.playlist_info 
          WHERE playlist_id = ${playlistId} AND user_id = ${userContext.userId}
        `.pipe(
          withUserContext(userContext),
          withErrorContext("Error deleting playlist")
        );
        return result;
      }),
      insertPlaylistInscriptions: (insertPlaylistInscriptions: InsertPlaylistInscriptions, userContext: UserContext) => Effect.gen(function* () {
        const inscriptionsWithFunctions = insertPlaylistInscriptions.map(inscription => ({
          playlist_id: inscription.playlist_id,
          inscription_id: inscription.inscription_id,
          playlist_position: sql`get_next_playlist_position(${inscription.playlist_id})`
        }));
        
        const result = yield* sql`
          INSERT INTO social.playlist_inscriptions ${sql.insert(inscriptionsWithFunctions)}
          RETURNING *
        `.pipe(
          withUserContext(userContext),
          withErrorContext("Error inserting playlist inscriptions")
        );
        return result;
      }),
      updatePlaylistInscriptions: (playlistId: string, updatePlaylistInscriptions: UpdatePlaylistInscriptions, userContext: UserContext) => Effect.gen(function* () {
        let inscriptionsToInsert = updatePlaylistInscriptions.map((inscription, index) => ({
          playlist_id: inscription.playlist_id,
          inscription_id: inscription.inscription_id,
          playlist_position: 'playlist_position' in inscription ? inscription.playlist_position : index
        }));
        const result = yield* Effect.gen(function* () {
          // Delete all existing inscriptions for this playlist
          yield* sql`
            DELETE FROM social.playlist_inscriptions 
            WHERE playlist_id = ${playlistId}
          `;
          // Insert the new inscriptions
          const insertResult = yield* sql`
            INSERT INTO social.playlist_inscriptions ${sql.insert(inscriptionsToInsert)}
            RETURNING *
          `;
          return insertResult;
        }).pipe(
          withUserContext(userContext),
          withErrorContext("Error updating playlist inscriptions")
        );
        return result;
      }),
      deletePlaylistInscriptions: (playlistId: string, inscriptionIds: string[], userContext: UserContext) => Effect.gen(function* () {
        const result = yield* sql`
          DELETE FROM social.playlist_inscriptions 
          WHERE playlist_id = ${playlistId} AND inscription_id IN (${sql.array(inscriptionIds)})
        `.pipe(
          withUserContext(userContext),
          withErrorContext("Error deleting playlist inscriptions")
        );
        return result;
      })
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
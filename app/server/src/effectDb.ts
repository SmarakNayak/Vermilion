
import { PgClient } from "@effect/sql-pg";
import { withErrorContext } from "./effectUtils";
import { Effect, Layer, Redacted, Logger, LogLevel, Array, Option, Schema, Data } from "effect";
import { ConfigService } from "./config";
import { NewPlaylistInfo, UpdatePlaylistInfo, InsertPlaylistInscriptions, UpdatePlaylistInscriptions } from "./types/playlist";

interface AuthorisedUserContext {
  //userId: string;
  userAddress: string;
}

class InternalDatabaseError extends Data.TaggedError("InternalDatabaseError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export class SocialDbService extends Effect.Service<SocialDbService>()("EffectPostgres", {
  effect: Effect.gen(function* () {
    const sql = yield* PgClient.PgClient;

    const getUserIdFromAddress = (userAddress: string) => Effect.gen(function* () {
      const result = yield* sql`SELECT user_id FROM social.profiles_view WHERE user_addresses @> ARRAY[${userAddress}::character varying]`;
      const firstRow = Array.head(result);
      const userId = yield* Option.match(firstRow, {
        onNone: () => Effect.succeed(Option.none<string>()),
        onSome: (row) => Effect.gen(function* () {
          const validatedRow = yield* Schema.decodeUnknown(Schema.Struct({
            user_id: Schema.UUID
          }))(row);
          return Option.some(validatedRow.user_id);
        })
      });
      return userId;
    }).pipe(
      Effect.mapError((error) =>
        new InternalDatabaseError({ message: `Failed to get user ID from address: ${error.message}`, cause: error })
      )
    );

    const withUserContext = <A, E, R>(userContext: AuthorisedUserContext) => (query: Effect.Effect<A, E, R>) =>
      sql.withTransaction(Effect.gen(function* () {
        yield* sql`SELECT set_config('app.current_user_address', ${userContext.userAddress}, true)`;
        let userId = yield* getUserIdFromAddress(userContext.userAddress);
        if (Option.isSome(userId)) {
          yield* sql`SELECT set_config('app.current_user_id', ${userId.value}, true)`;
        } else {
          yield* Effect.log(`No user found for address: ${userContext.userAddress}`);
        }
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
        yield* sql`ALTER TABLE social.playlist_info ENABLE ROW LEVEL SECURITY;
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
        yield* sql`ALTER TABLE social.playlist_inscriptions ENABLE ROW LEVEL SECURITY;
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
        yield* sql`CREATE OR REPLACE FUNCTION get_next_playlist_position(p_playlist_id UUID)
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
      getUserIdFromAddress: getUserIdFromAddress,
      withUserContext: withUserContext,
      createPlaylist: (newPlaylist: NewPlaylistInfo, userContext: AuthorisedUserContext) => Effect.gen(function* () {
        let row = yield* sql`INSERT INTO social.playlist_info ${sql.insert(newPlaylist)} RETURNING playlist_id`.pipe(
          withUserContext(userContext),
          withErrorContext("Error creating new playlist")
        );
        let parsedRow = yield* Schema.decodeUnknown(Schema.Array(Schema.Struct({ playlist_id: Schema.String })))(row).pipe(
          withErrorContext("Error parsing playlist row")
        );
        let firstRow = Array.head(parsedRow);
        return yield* firstRow;
      }).pipe(
        Effect.mapError((error) =>
          new InternalDatabaseError({ message: `Failed to create playlist: ${error.message}`, cause: error })
        )
      ),
      updatePlaylist: (updatePlaylist: UpdatePlaylistInfo, userContext: AuthorisedUserContext) => Effect.gen(function* () {
        const result = yield* sql`
          UPDATE social.playlist_info 
          SET ${sql.update(updatePlaylist)} 
          WHERE playlist_id = ${updatePlaylist.playlist_id}
        `.pipe(
          withUserContext(userContext),
          withErrorContext("Error updating playlist"),
        );
        return result;
      }),
      deletePlaylist: (playlistId: string, userContext: AuthorisedUserContext) => Effect.gen(function* () {
        const result = yield* sql`
          DELETE FROM social.playlist_info 
          WHERE playlist_id = ${playlistId}
        `.pipe(
          withUserContext(userContext),
          withErrorContext("Error deleting playlist")
        );
        return result;
      }),
      insertPlaylistInscriptions: (insertPlaylistInscriptions: InsertPlaylistInscriptions, userContext: AuthorisedUserContext) => Effect.gen(function* () {
        const result = Effect.gen(function* () {
          yield* sql`CREATE TEMP TABLE temp_playlist_inscriptions ON COMMIT DROP AS TABLE social.playlist_inscriptions WITH NO DATA`;
          yield* sql`INSERT INTO temp_playlist_inscriptions ${sql.insert(insertPlaylistInscriptions)}`;
          return yield* sql`
            INSERT INTO social.playlist_inscriptions (playlist_id, inscription_id, playlist_position)
            SELECT 
              playlist_id,
              inscription_id,
              get_next_playlist_position(playlist_id)
            FROM temp_playlist_inscriptions
            RETURNING *
          `
        }).pipe(
          withUserContext(userContext),
          withErrorContext("Error inserting playlist inscriptions"),
        );
        return yield* result;
      }),
      updatePlaylistInscriptions: (playlistId: string, updatePlaylistInscriptions: UpdatePlaylistInscriptions, userContext: AuthorisedUserContext) => Effect.gen(function* () {
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
      deletePlaylistInscriptions: (playlistId: string, inscriptionIds: string[], userContext: AuthorisedUserContext) => Effect.gen(function* () {
        const result = yield* sql`
          DELETE FROM social.playlist_inscriptions 
          WHERE playlist_id = ${playlistId} AND inscription_id IN ${sql.in(inscriptionIds)}
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
export const PostgresLive = Effect.gen(function* () {
  const config = yield* ConfigService;
  return PgClient.layer({
    host: config.db_host,
    port: 5432,
    database: config.db_name,
    username: config.db_user,
    password: Redacted.make(config.db_password),
    debug: (connection, query, params, paramTypes) => {
      console.log("Database connection:", connection);
      console.log("SQL Query:", query);
      console.log("Parameters:", params);
      console.log("Parameter Types:", paramTypes);
    }
  });
}).pipe(
  Layer.unwrapEffect
);
let dbWrapperLayer = SocialDbService.Default;
let mainLayer = dbWrapperLayer.pipe(
  Layer.provide(PostgresLive),
  Layer.provide(configLayer),
  Layer.provide(Logger.pretty)
);

// let program = Effect.gen(function* () {
//   const db = yield* SocialDbService;
//   let creationResult = yield* db.setupDatabase();
//   yield* Effect.log(`Database setup result: ${JSON.stringify(creationResult)}`);
//   const result = yield* db.query`SELECT * FROM social.profiles`;
//   yield* Effect.log(`Query result: ${JSON.stringify(result)}`);
//   return result;
// }).pipe(
//   Effect.provide(mainLayer),
//   Effect.catchAll((error) => Effect.logError(`Database error: ${error}`)),
//   Effect.runPromise
// );


let program2 = Effect.gen(function* () {
  const db = yield* SocialDbService;
  
  // Setup database first
  let creationResult = yield* db.setupDatabase();
  yield* Effect.log(`Database setup result: ${JSON.stringify(creationResult)}`);

  // Test user context
  const userContext = {
    userId: "550e8400-e29b-41d4-a716-446655440000", // Example UUID
    userAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
  };

  // Test 1: Create a new playlist
  yield* Effect.log("=== Testing createPlaylist ===");
  const newPlaylist = {
    user_id: userContext.userId, // ✅ Add this - required by NewPlaylistInfo schema
    playlist_name: "My Test Playlist",
    playlist_description: "A test playlist for development",
    playlist_inscription_icon: "icon123"
  };
  
  const createdPlaylist = yield* db.createPlaylist(newPlaylist, userContext);
  const playlistId = createdPlaylist.playlist_id;

  yield* Effect.log(`Created playlist: ${JSON.stringify(createdPlaylist)}, ID: ${playlistId}`);

  // Test 2: Insert playlist inscriptions
  yield* Effect.log("=== Testing insertPlaylistInscriptions ===");
  const inscriptionsToInsert = [
    { playlist_id: playlistId, inscription_id: "inscription_001" },
    { playlist_id: playlistId, inscription_id: "inscription_002" },
    { playlist_id: playlistId, inscription_id: "inscription_003" }
  ];
  
  const insertedInscriptions = yield* db.insertPlaylistInscriptions(inscriptionsToInsert, userContext);
  yield* Effect.log(`Inserted inscriptions: ${JSON.stringify(insertedInscriptions)}`);

  // Test 3: Update playlist info
  yield* Effect.log("=== Testing updatePlaylist ===");
  const playlistUpdate = {
    playlist_id: playlistId,
    user_id: userContext.userId, // ✅ Add this - required by UpdatePlaylistInfo schema
    playlist_name: "Updated Test Playlist",
    playlist_description: "Updated description"
  };
  
  const updatedPlaylist = yield* db.updatePlaylist(playlistUpdate, userContext);
  yield* Effect.log(`Updated playlist: ${JSON.stringify(updatedPlaylist)}`);

  // Test 4: Update playlist inscriptions (with positions)
  yield* Effect.log("=== Testing updatePlaylistInscriptions (with positions) ===");
  const inscriptionsWithPositions = [
    { playlist_id: playlistId, inscription_id: "inscription_004", playlist_position: 0 },
    { playlist_id: playlistId, inscription_id: "inscription_005", playlist_position: 1 },
    { playlist_id: playlistId, inscription_id: "inscription_001", playlist_position: 2 }
  ];
  
  const updatedInscriptionsWithPos = yield* db.updatePlaylistInscriptions(playlistId, inscriptionsWithPositions, userContext);
  yield* Effect.log(`Updated inscriptions (with positions): ${JSON.stringify(updatedInscriptionsWithPos)}`);

  // Test 5: Update playlist inscriptions (without positions - should auto-generate)
  yield* Effect.log("=== Testing updatePlaylistInscriptions (without positions) ===");
  const inscriptionsWithoutPositions = [
    { playlist_id: playlistId, inscription_id: "inscription_006" },
    { playlist_id: playlistId, inscription_id: "inscription_007" },
    { playlist_id: playlistId, inscription_id: "inscription_008" }
  ];
  
  const updatedInscriptionsWithoutPos = yield* db.updatePlaylistInscriptions(playlistId, inscriptionsWithoutPositions, userContext);
  yield* Effect.log(`Updated inscriptions (without positions): ${JSON.stringify(updatedInscriptionsWithoutPos)}`);

  // Test 6: Delete specific playlist inscriptions
  yield* Effect.log("=== Testing deletePlaylistInscriptions ===");
  const inscriptionIdsToDelete = ["inscription_006", "inscription_007"];
  
  const deletedInscriptions = yield* db.deletePlaylistInscriptions(playlistId, inscriptionIdsToDelete, userContext);
  yield* Effect.log(`Deleted inscriptions: ${JSON.stringify(deletedInscriptions)}`);

  // Test 7: Query remaining inscriptions to verify deletions
  yield* Effect.log("=== Checking remaining inscriptions ===");
  const remainingInscriptions = yield* db.query`
    SELECT * FROM social.playlist_inscriptions 
    WHERE playlist_id = ${playlistId} 
    ORDER BY playlist_position
  `;
  yield* Effect.log(`Remaining inscriptions: ${JSON.stringify(remainingInscriptions)}`);

  // Test 8: Query playlist info
  yield* Effect.log("=== Checking playlist info ===");
  const playlistInfo = yield* db.query`
    SELECT * FROM social.playlist_info 
    WHERE playlist_id = ${playlistId}
  `;
  yield* Effect.log(`Playlist info: ${JSON.stringify(playlistInfo)}`);

  // Test 9: Delete the entire playlist (should cascade delete inscriptions)
  yield* Effect.log("=== Testing deletePlaylist ===");
  const deletedPlaylist = yield* db.deletePlaylist(playlistId, userContext);
  yield* Effect.log(`Deleted playlist: ${JSON.stringify(deletedPlaylist)}`);

  // Test 10: Verify playlist and inscriptions are gone
  yield* Effect.log("=== Verifying cleanup ===");
  const finalPlaylistCheck = yield* db.query`
    SELECT * FROM social.playlist_info 
    WHERE playlist_id = ${playlistId}
  `;
  const finalInscriptionsCheck = yield* db.query`
    SELECT * FROM social.playlist_inscriptions 
    WHERE playlist_id = ${playlistId}
  `;
  
  yield* Effect.log(`Final playlist check (should be empty): ${JSON.stringify(finalPlaylistCheck)}`);
  yield* Effect.log(`Final inscriptions check (should be empty): ${JSON.stringify(finalInscriptionsCheck)}`);

  yield* Effect.log("=== All playlist tests completed successfully! ===");
  
  return {
    message: "All playlist methods tested successfully",
    playlistId: playlistId,
    testsCompleted: 10
  };
}).pipe(
  Effect.provide(mainLayer),
  Effect.catchTag("SqlError", (error) => Effect.logError(`SQL Error: ${error.message} - ${error.cause}`)),
  Effect.catchAll((error) => Effect.logError(`Database error: ${error}`)),
  Logger.withMinimumLogLevel(LogLevel.Debug),
  Effect.runPromise
);
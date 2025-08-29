
import { PgClient } from "@effect/sql-pg";
import { SqlSchema } from "@effect/sql";
import { withErrorContext } from "./effectUtils";
import { Effect, Layer, Redacted, Array, Option, Schema, identity } from "effect";
import { ConfigService } from "./config";
import { PlaylistTable, InsertPlaylistInscriptions, UpdatePlaylistInscriptions, PlaylistInscriptionsSchema } from "../../shared/types/playlist";
import { AuthenticatedUserContext } from "../../shared/api/authMiddleware";
import { ProfileTable, ProfileView } from "../../shared/types/effectProfile";
import { DatabaseNotFoundError, mapPostgresError, mapPostgresInsertError, mapPostgresUpdateError } from "./effectDbErrors";

export class SocialDbService extends Effect.Service<SocialDbService>()("EffectPostgres", {
  effect: Effect.gen(function* () {
    const sql = yield* PgClient.PgClient;

    const getUserIdFromAddress = (userAddress: string) => Effect.gen(function* () {
      const result = yield* sql`SELECT user_id FROM social.profiles_view WHERE user_addresses @> ARRAY[${userAddress}::character varying]`;
      const parsedResult = yield* Schema.decodeUnknown(Schema.Array(Schema.Struct({ user_id: Schema.UUID })))(result).pipe(
        withErrorContext("Error parsing user ID from address")
      );
      const firstRow = Array.head(parsedResult);
      const userId = Option.map(firstRow, row => row.user_id);
      return userId;
    }).pipe(
      withErrorContext("Error getting user ID from address"),
      Effect.catchAll((error) => Effect.die(error))
    );

    const withUserContext = <A, E, R>() => (query: Effect.Effect<A, E, R>) =>
      sql.withTransaction(Effect.gen(function* () {
        const userContext = yield* AuthenticatedUserContext;
        yield* sql`SELECT set_config('app.authorized_user_address', ${userContext.userAddress}, true)`;
        let userId = yield* getUserIdFromAddress(userContext.userAddress);
        if (Option.isSome(userId)) {
          yield* sql`SELECT set_config('app.authorized_user_id', ${userId.value}, true)`;
        } else {
          yield* Effect.logDebug(`No user found for address: ${userContext.userAddress}`);
          yield* sql`SELECT set_config('app.authorized_user_id', '00000000-0000-0000-0000-000000000000', true)`;
        }
        return yield* query;
      }));
    
    return {
      sql,
      setupDatabase: () => Effect.gen(function* () {
        yield* sql`CREATE SCHEMA IF NOT EXISTS social`.pipe(
          withErrorContext("Error creating social schema")
        );
        
        // Profile tables
        yield* sql`CREATE TABLE IF NOT EXISTS social.profiles (
          user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_handle VARCHAR(17) NOT NULL UNIQUE,
          user_name VARCHAR(30) NOT NULL,
          user_picture VARCHAR(80),
          user_bio VARCHAR(280),
          user_twitter VARCHAR(15),
          user_discord VARCHAR(37),
          user_website TEXT,
          user_created_at TIMESTAMPTZ DEFAULT NOW(),
          user_updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT valid_handle CHECK (user_handle ~ '^[a-zA-Z0-9_]{2,17}$')
        )`.pipe(
          withErrorContext("Error creating profiles table")
        );
        yield* sql`CREATE UNIQUE INDEX IF NOT EXISTS unique_handle_case_insensitive ON social.profiles (LOWER(user_handle))`.pipe(
          withErrorContext("Error creating unique handle index")
        );
        yield* sql`ALTER TABLE social.profiles ENABLE ROW LEVEL SECURITY;
          ALTER TABLE social.profiles FORCE ROW LEVEL SECURITY;
          DROP POLICY IF EXISTS profiles_policy_select ON social.profiles;
          CREATE POLICY profiles_policy_select ON social.profiles
            FOR SELECT
            USING (true);
          DROP POLICY IF EXISTS profiles_policy_insert ON social.profiles;
          CREATE POLICY profiles_policy_insert ON social.profiles
            FOR INSERT
            WITH CHECK (true);
          DROP POLICY IF EXISTS profiles_policy_update ON social.profiles;
          CREATE POLICY profiles_policy_update ON social.profiles
            FOR UPDATE
            USING (user_id = current_setting('app.authorized_user_id')::uuid)
            WITH CHECK (user_id = current_setting('app.authorized_user_id')::uuid);
          DROP POLICY IF EXISTS profiles_policy_delete ON social.profiles;
          CREATE POLICY profiles_policy_delete ON social.profiles
            FOR DELETE
            USING (user_id = current_setting('app.authorized_user_id')::uuid);
        `.pipe(
          withErrorContext("Error setting up profiles RLS policies")
        );
        // separate table for profile addresses because you can't ensure distinctness in an array column
        yield* sql`CREATE TABLE IF NOT EXISTS social.profile_addresses (
          address VARCHAR(64) PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES social.profiles(user_id) ON DELETE CASCADE
        )`.pipe(
          withErrorContext("Error creating profile_addresses table")
        );
        yield* sql`ALTER TABLE social.profile_addresses ENABLE ROW LEVEL SECURITY;
          ALTER TABLE social.profile_addresses FORCE ROW LEVEL SECURITY;
          DROP POLICY IF EXISTS profile_addresses_policy_select ON social.profile_addresses;
          CREATE POLICY profile_addresses_policy_select ON social.profile_addresses
            FOR SELECT
            USING (true);
          DROP POLICY IF EXISTS profile_addresses_policy_insert ON social.profile_addresses;
          CREATE POLICY profile_addresses_policy_insert ON social.profile_addresses
            FOR INSERT
            WITH CHECK (user_id = current_setting('app.authorized_user_id')::uuid and address = current_setting('app.authorized_user_address'));
          DROP POLICY IF EXISTS profile_addresses_policy_delete ON social.profile_addresses;
          CREATE POLICY profile_addresses_policy_delete ON social.profile_addresses
            FOR DELETE
            USING (user_id = current_setting('app.authorized_user_id')::uuid);
        `.pipe(
          withErrorContext("Error setting up profile_addresses RLS policies")
        );
        yield* sql`CREATE OR REPLACE VIEW social.profiles_view AS
        SELECT 
            p.*,
            COALESCE(
              (SELECT array_agg(pa.address) 
                FROM social.profile_addresses pa 
                WHERE pa.user_id = p.user_id
              ),
              ARRAY[]::VARCHAR(64)[]
            ) AS user_addresses
        FROM social.profiles p`.pipe(
          withErrorContext("Error creating profiles_view")
        );

        // Playlist tables
        yield* sql`CREATE TABLE IF NOT EXISTS social.playlist_info (
          playlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          playlist_name TEXT NOT NULL,
          playlist_inscription_icon varchar(80),
          playlist_description TEXT,
          playlist_created_at TIMESTAMPTZ DEFAULT NOW(),
          playlist_updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, playlist_name)
        )`.pipe(
          withErrorContext(`Error creating playlist_info table`)
        );
        yield* sql`ALTER TABLE social.playlist_info ENABLE ROW LEVEL SECURITY;
          ALTER TABLE social.playlist_info FORCE ROW LEVEL SECURITY;
          DROP POLICY IF EXISTS playlist_info_policy_insert ON social.playlist_info;
          CREATE POLICY playlist_info_policy_insert ON social.playlist_info
            FOR INSERT
            WITH CHECK (user_id = current_setting('app.authorized_user_id')::uuid);
          DROP POLICY IF EXISTS playlist_info_policy_update ON social.playlist_info;
          CREATE POLICY playlist_info_policy_update ON social.playlist_info
            FOR UPDATE
            USING (user_id = current_setting('app.authorized_user_id')::uuid);
          DROP POLICY IF EXISTS playlist_info_policy_delete ON social.playlist_info;
          CREATE POLICY playlist_info_policy_delete ON social.playlist_info
            FOR DELETE
            USING (user_id = current_setting('app.authorized_user_id')::uuid);
          DROP POLICY IF EXISTS playlist_info_policy_select ON social.playlist_info;
          CREATE POLICY playlist_info_policy_select ON social.playlist_info
            FOR SELECT
            USING (true);
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
          ALTER TABLE social.playlist_inscriptions FORCE ROW LEVEL SECURITY;
          DROP POLICY IF EXISTS playlist_inscriptions_policy_insert ON social.playlist_inscriptions;
          CREATE POLICY playlist_inscriptions_policy_insert ON social.playlist_inscriptions
            FOR INSERT
            WITH CHECK (playlist_id IN (SELECT playlist_id FROM social.playlist_info WHERE user_id = current_setting('app.authorized_user_id')::uuid));
          DROP POLICY IF EXISTS playlist_inscriptions_policy_update ON social.playlist_inscriptions;
          CREATE POLICY playlist_inscriptions_policy_update ON social.playlist_inscriptions
            FOR UPDATE
            USING (playlist_id IN (SELECT playlist_id FROM social.playlist_info WHERE user_id = current_setting('app.authorized_user_id')::uuid));
          DROP POLICY IF EXISTS playlist_inscriptions_policy_delete ON social.playlist_inscriptions;
          CREATE POLICY playlist_inscriptions_policy_delete ON social.playlist_inscriptions
            FOR DELETE
            USING (playlist_id IN (SELECT playlist_id FROM social.playlist_info WHERE user_id = current_setting('app.authorized_user_id')::uuid));
          DROP POLICY IF EXISTS playlist_inscriptions_policy_select ON social.playlist_inscriptions;
          CREATE POLICY playlist_inscriptions_policy_select ON social.playlist_inscriptions
            FOR SELECT
            USING (true);
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

      // Profile methods using SQL resolvers inside Effect.gen
      createProfile: (profileInsert: Schema.Schema.Type<typeof ProfileTable.insert>, address: string) => Effect.gen(function* () {
        const insertProfileResolver = SqlSchema.single({
          Request: ProfileTable.insert,
          Result: Schema.Struct({
            user_id: Schema.UUID
          }),
          execute: (profile) => 
            sql`Insert INTO social.profiles ${sql.insert(profile)} RETURNING user_id`
        });
        const insertAddressResolver = SqlSchema.void({
          Request: Schema.Struct({
            address: Schema.String,
            userId: Schema.UUID
          }),
          // Result: Schema.Struct({
          //   address: Schema.String,
          //   user_id: Schema.UUID
          // }),
          execute: ({ address, userId }) => 
            sql`INSERT INTO social.profile_addresses (address, user_id) VALUES (${address}, ${userId}) returning *`
        });
        const selectProfileResolver = SqlSchema.single({
          Request: Schema.UUID,
          Result: ProfileView.select,
          execute: (userId) => sql`SELECT * FROM social.profiles_view WHERE user_id = ${userId}`
        });
        return yield* Effect.gen(function* () {
          const insert = yield* insertProfileResolver(profileInsert);
          yield* sql`SELECT set_config('app.authorized_user_id', ${insert.user_id}, true)`;
          yield* insertAddressResolver({ address, userId: insert.user_id });
          const profileView = yield* selectProfileResolver(insert.user_id);
          return profileView;
        }).pipe(
          withUserContext()
        );
      }).pipe(
        Effect.catchTags({
          "NoSuchElementException" : (error) => Effect.die(error),
          "ParseError" : (error) => Effect.die(error),
          "SqlError" : mapPostgresInsertError
        })
      ),

      updateProfile: (profileUpdate: Schema.Schema.Type<typeof ProfileTable.update>) => Effect.gen(function* () {
        const updateProfileResolver = SqlSchema.single({
          Request: ProfileTable.update,
          Result: ProfileTable.select,
          execute: (profile) => Effect.gen(function* () {
            const { user_id, ...fieldsToUpdate } = profile;
            return yield* sql`UPDATE social.profiles SET ${sql.update(fieldsToUpdate)} WHERE user_id = ${profile.user_id}::uuid returning *;`;
          })
        });
        const getProfileResolver = SqlSchema.single({
          Request: Schema.UUID,
          Result: ProfileView.select,
          execute: (userId) => sql`SELECT * FROM social.profiles_view WHERE user_id = ${userId}`
        });
        return yield* Effect.gen(function* () {
          yield* updateProfileResolver(profileUpdate);
          const profileView = yield* getProfileResolver(profileUpdate.user_id);
          return profileView;
        }).pipe(
          withUserContext()
        );
      }).pipe(
        Effect.catchTags({
          "NoSuchElementException": (_error) => Effect.fail(DatabaseNotFoundError.fromNoSuchElementException("profile", "update")),
          "ParseError": (error) => Effect.die(error),
          "SqlError": mapPostgresUpdateError,
        }),
      ),

      deleteProfile: (userId: string) => Effect.gen(function* () {
        let deleteResolver = SqlSchema.single({
          Request: Schema.UUID,
          Result: Schema.Struct({
            user_id: Schema.UUID
          }),
          execute: (userId) => sql`DELETE FROM social.profiles WHERE user_id = ${userId} returning user_id`
        });
        return yield* deleteResolver(userId).pipe(
          withUserContext()
        );
      }).pipe(
        Effect.catchTags({
          "NoSuchElementException": (_error) => Effect.fail(DatabaseNotFoundError.fromNoSuchElementException("profile", "delete")),
          "ParseError": (error) => Effect.die(error),
          "SqlError": (error) => Effect.die(error),
        }),
      ),

      getProfileById: (userId: string) => Effect.gen(function* () {
        const getResolver = SqlSchema.single({
          Request: Schema.UUID,
          Result: ProfileView.select,
          execute: (userId) => sql`SELECT * FROM social.profiles_view WHERE user_id = ${userId}`
        });
        return yield* getResolver(userId);
      }).pipe(
        Effect.catchTags({
          "ParseError": (e) => Effect.die(e),
          "SqlError": (e) => Effect.die(e),
          "NoSuchElementException": (_e) => Effect.fail(DatabaseNotFoundError.fromNoSuchElementException("profile", "get"))
        })
      ),

      getProfileByHandle: (handle: string) => Effect.gen(function* () {
        const getResolver = SqlSchema.single({
          Request: Schema.String,
          Result: ProfileView.select,
          execute: (handle) => sql`SELECT * FROM social.profiles_view WHERE user_handle = ${handle}`
        });
        return yield* getResolver(handle);
      }).pipe(
      Effect.catchTags({
          "ParseError": (e) => Effect.die(e),
          "SqlError": (e) => Effect.die(e),
          "NoSuchElementException": (_e) => Effect.fail(DatabaseNotFoundError.fromNoSuchElementException("profile", "get"))
        })
      ),

      getProfileByAddress: (address: string) => Effect.gen(function* () {
        const getResolver = SqlSchema.single({
          Request: Schema.String,
          Result: ProfileView.select,
          execute: (address) => sql`SELECT * FROM social.profiles_view WHERE user_addresses @> ARRAY[${address}::character varying]`
        });
        return yield* getResolver(address);
      }).pipe(
      Effect.catchTags({
          "ParseError": (e) => Effect.die(e),
          "SqlError": (e) => Effect.die(e),
          "NoSuchElementException": (_e) => Effect.fail(DatabaseNotFoundError.fromNoSuchElementException("profile", "get"))
        })
      ),

      // Playlist methods
      createPlaylist: (newPlaylist: Schema.Schema.Type<typeof PlaylistTable.insert>) => Effect.gen(function* () {
        const insertPlaylistResolver = SqlSchema.single({
          Request: PlaylistTable.insert,
          Result: PlaylistTable.select,
          execute: (profile) => 
            sql`Insert INTO social.playlist_info ${sql.insert(profile)} RETURNING *`
        });
        return yield* insertPlaylistResolver(newPlaylist).pipe(
          withUserContext()
        );
      }).pipe(
        Effect.catchTags({
          "NoSuchElementException":(error) => Effect.die(error),
          "ParseError": (error) => Effect.die(error),
          "SqlError": mapPostgresInsertError,
        }),
      ),
      updatePlaylist: (updatePlaylist: Schema.Schema.Type<typeof PlaylistTable.update>) => Effect.gen(function* () {
        const updatePlaylistResolver = SqlSchema.single({
          Request: PlaylistTable.update,
          Result: PlaylistTable.select,
          execute: (playlist) => Effect.gen(function* () {
            const { playlist_id, ...fieldsToUpdate } = playlist;
            return yield* sql`UPDATE social.playlist_info SET ${sql.update(fieldsToUpdate)} WHERE playlist_id = ${playlist.playlist_id} returning *;`;
          })
        });
        return yield* updatePlaylistResolver(updatePlaylist).pipe(
          withUserContext()
        );
      }).pipe(
        Effect.catchTags({
          "NoSuchElementException": (_error) => Effect.fail(DatabaseNotFoundError.fromNoSuchElementException("playlist", "update")),
          "ParseError": (error) => Effect.die(error),
          "SqlError": mapPostgresError({
            handleDuplicateKey: true,
            handleInvalidRow: true,
            handleSecurity: false
          }),
        }),
      ),
      deletePlaylist: (playlistId: string) => Effect.gen(function* () {
        const deleteResolver = SqlSchema.single({
          Request: Schema.UUID,
          Result: Schema.Struct({
            playlist_id: Schema.UUID
          }),
          execute: (playlistId) => sql`DELETE FROM social.playlist_info WHERE playlist_id = ${playlistId} returning playlist_id`
        });
        return yield* deleteResolver(playlistId).pipe(
          withUserContext()
        );
      }).pipe(
        Effect.catchTags({
          "NoSuchElementException": (_error) => Effect.fail(DatabaseNotFoundError.fromNoSuchElementException("playlist", "delete")),
          "ParseError": (error) => Effect.die(error),
          "SqlError": (error) => Effect.die(error),
        }),
      ),
      getPlaylist: (playlistId: string) => Effect.gen(function* () {
        const getResolver = SqlSchema.single({
          Request: Schema.UUID,
          Result: PlaylistTable.select,
          execute: (playlistId) => sql`SELECT * FROM social.playlist_info WHERE playlist_id = ${playlistId}`
        });
        return yield* getResolver(playlistId);
      }).pipe(
        Effect.catchTags({
          "ParseError": (e) => Effect.die(e),
          "SqlError": (e) => Effect.die(e),
          "NoSuchElementException": (_e) => Effect.fail(DatabaseNotFoundError.fromNoSuchElementException("playlist", "get"))
        })
      ),
      getPlaylistsByUserId: (userId: string) => Effect.gen(function* () {
        const result = yield* sql`SELECT * FROM social.playlist_info WHERE user_id = ${userId} ORDER BY playlist_created_at DESC`;
        return yield* Schema.decodeUnknown(Schema.Array(PlaylistTable.select))(result);
      }).pipe(
        Effect.catchTags({
          "ParseError": (e) => Effect.die(e),
          "SqlError": (e) => Effect.die(e),
        })
      ),
      insertPlaylistInscriptions: (insertPlaylistInscriptions: InsertPlaylistInscriptions) => Effect.gen(function* () {
        yield* sql`CREATE TEMP TABLE temp_playlist_inscriptions ON COMMIT DROP AS TABLE social.playlist_inscriptions WITH NO DATA`;
        yield* sql`INSERT INTO temp_playlist_inscriptions ${sql.insert(insertPlaylistInscriptions)}`;
        const insertResult = yield* sql`
          INSERT INTO social.playlist_inscriptions (playlist_id, inscription_id, playlist_position)
          SELECT 
            playlist_id,
            inscription_id,
            get_next_playlist_position(playlist_id)
          FROM temp_playlist_inscriptions
          RETURNING *
        `
        return yield* Schema.decodeUnknown(PlaylistInscriptionsSchema)(insertResult);
      }).pipe(
        withUserContext(),
        Effect.catchTags({
          "ParseError": (error) => Effect.die(error),
          "SqlError": mapPostgresInsertError,
        })
      ),
      updatePlaylistInscriptions: (playlistId: string, updatePlaylistInscriptions: UpdatePlaylistInscriptions) => Effect.gen(function* () {
        let inscriptionsToInsert = updatePlaylistInscriptions.map((inscription, index) => ({
          playlist_id: inscription.playlist_id,
          inscription_id: inscription.inscription_id,
          playlist_position: 'playlist_position' in inscription ? inscription.playlist_position : index
        }));
        // Delete all existing inscriptions for this playlist
        yield* sql`DELETE FROM social.playlist_inscriptions WHERE playlist_id = ${playlistId}`;
        // Insert the new inscriptions
        const insertResult = yield* sql`
          INSERT INTO social.playlist_inscriptions ${sql.insert(inscriptionsToInsert)} RETURNING *
        `;
        const parsedResult = yield* Schema.decodeUnknown(PlaylistInscriptionsSchema)(insertResult);
        return parsedResult;
      }).pipe(
        withUserContext(),
        Effect.catchTags({
          "ParseError": (error) => Effect.die(error),
          "SqlError": mapPostgresInsertError,
        })
      ),
      deletePlaylistInscriptions: (playlistId: string, inscriptionIds: readonly string[]) => Effect.gen(function* () {
        const deleteResolver = SqlSchema.findAll({
          Request: Schema.Array(Schema.String),
          Result: Schema.Struct({
            playlist_id: Schema.UUID,
            inscription_id: Schema.String
          }),
          execute: (inscriptionIds) => sql`
            DELETE FROM social.playlist_inscriptions
            WHERE playlist_id = ${playlistId} AND inscription_id IN ${sql.in(inscriptionIds)}
            RETURNING *
          `
        });
        const result = yield* deleteResolver(inscriptionIds).pipe(
          withUserContext()
        );
        if (result.length === 0) {
          return yield* Effect.fail(DatabaseNotFoundError.manuallyCreate(
            "The inscriptions in this playlist could not be deleted. You may not have permission or they may have already been removed.", 
            "playlist_inscriptions", 
            "delete"
          ));
        }
        return result;
      }).pipe(
        Effect.catchTags({
          "ParseError": (error) => Effect.die(error),
          "SqlError": (error) => Effect.die(error),
        })
      ),
      getPlaylistInscriptions: (playlistId: string) => Effect.gen(function* () {
        let result = yield* sql`SELECT * FROM social.playlist_inscriptions WHERE playlist_id = ${playlistId} ORDER BY playlist_position`
        const parsedResult = yield* Schema.decodeUnknown(PlaylistInscriptionsSchema)(result);
        return parsedResult
      }).pipe(
        Effect.catchTags({
          "ParseError": (e) => Effect.die(e),
          "SqlError": (e) => Effect.die(e),
        })
      )
    };
  })
}) {};

export const PostgresLive = Effect.gen(function* () {
  const config = yield* ConfigService;
  return PgClient.layer({
    host: config.db_host,
    port: 5432,
    database: config.db_name,
    username: config.db_user,
    password: Redacted.make(config.db_password),
    // - 114: JSON (return as string instead of parsed object)
    // - 1082: DATE
    // - 1114: TIMESTAMP WITHOUT TIME ZONE
    // - 1184: TIMESTAMP WITH TIME ZONE
    // - 3802: JSONB (return as string instead of parsed object)
    types: {
      114: {
        to: 25,
        from: [114],
        parse: identity,
        serialize: identity,
      },
      1082: {
        to: 25,
        from: [1082],
        parse: identity,
        serialize: identity,
      },
      1114: {
        to: 25,
        from: [1114],
        parse: identity,
        serialize: identity,
      },
      1184: {
        to: 25,
        from: [1184],
        parse: identity,
        serialize: identity,
      },
      3802: {
        to: 25,
        from: [3802],
        parse: identity,
        serialize: identity,
      },
    },
    onnotice(_notice) {},
  });
}).pipe(
  Layer.unwrapEffect
);

export const PostgresTest = Effect.gen(function* () {
  const config = yield* ConfigService;
  return PgClient.layer({
    host: config.db_host,
    port: 5432,
    database: config.db_name + "_test",
    username: config.db_user,
    password: Redacted.make(config.db_password),
    types: {
      114: {
        to: 25,
        from: [114],
        parse: identity,
        serialize: identity,
      },
      1082: {
        to: 25,
        from: [1082],
        parse: identity,
        serialize: identity,
      },
      1114: {
        to: 25,
        from: [1114],
        parse: identity,
        serialize: identity,
      },
      1184: {
        to: 25,
        from: [1184],
        parse: identity,
        serialize: identity,
      },
      3802: {
        to: 25,
        from: [3802],
        parse: identity,
        serialize: identity,
      },
    },
    onnotice(_notice) {},
    // debug: (_connection, query, params, _paramTypes) => {
    //   console.log("SQL Query:", query);
    //   console.log("Parameters:", params);
    // }
  });
}).pipe(
  Layer.unwrapEffect
);

export const DatabaseSetupLive = Layer.effectDiscard(
  Effect.gen(function* () {
    const db = yield* SocialDbService;
    yield* db.setupDatabase();
  })
);
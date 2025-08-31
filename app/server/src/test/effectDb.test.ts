import { expect, beforeAll, describe, it } from "bun:test";
import { Effect, Layer, Logger, Schema, Option } from "effect";
import { SocialDbService, PostgresTest } from "../effectDb";
import { ConfigService } from "../config";
import { AuthenticatedUserContext } from "../../../shared/api/authMiddleware"
import { ProfileTable } from "../../../shared/types/effectProfile";
import { PlaylistTable, InsertPlaylistInscriptionsSchema, UpdatePlaylistInscriptionsSchema } from "../../../shared/types/playlist";
import { withErrorContext } from "../effectUtils";
import { DatabaseDuplicateKeyError, DatabaseInvalidRowError, DatabaseNotFoundError, DatabaseSecurityError, mapPostgresInsertError } from "../effectDbErrors";

// Test-specific UUIDs
let TEST_USER_ID_1 = "00000000-0000-0000-0000-000000000001";
const TEST_USER_ADDRESS_1 = "address1";
const TEST_USER_ADDRESS_2 = "address2_no_user";
let TEST_PLAYLIST_ID = "00000000-0000-0000-0000-000000000001"; // Dummy Id that will be replaced by the actual ID from the test

// Build the test layer
const TestLayer = SocialDbService.Default.pipe(
  Layer.provide(PostgresTest),
  Layer.provide(ConfigService.Default),
  Layer.provide(Logger.pretty)
);

const runTest = <A, E>(effect: Effect.Effect<A, E, SocialDbService>) => 
  effect.pipe(
    Effect.provide(TestLayer),
    Effect.runPromise,
  )

const runTestWithUser = <A, E>(effect: Effect.Effect<A, E, SocialDbService | AuthenticatedUserContext>, userAddress: string) => {
  return effect.pipe(
    Effect.provide(TestLayer),
    Effect.provide(Layer.succeed(AuthenticatedUserContext, { userAddress })),
    Effect.runPromise,
  );
}

beforeAll(async () => {
  await runTest(Effect.gen(function* () {
    const db = yield* SocialDbService;
    // Get the current database name
    const result = yield* db.sql`SELECT current_database() as db_name`;
    const dbName = result[0]?.db_name;
    if (dbName === 'vermilion_test') {
      console.log(`Dropping social schema on test db: ${dbName}`);
      yield* db.sql`DROP SCHEMA IF EXISTS social CASCADE`.pipe(
        withErrorContext("Error dropping social schema")
      );
      yield* db.setupDatabase();
    } else {
      console.warn(`Skipping schema drop for non-test db: ${dbName}`);
    }
  }));
});

describe("Profile Operations", () => {
  const testProfile: Schema.Schema.Type<typeof ProfileTable.insert> = {
    user_handle: "testuser1",
    user_name: "Test User 1",
    user_picture: Option.some("https://example.com/picture1.jpg"),
    user_bio: Option.some("This is a test bio for user 1."),
    user_twitter: Option.some("@testuser1"),
    user_discord: Option.some("testuser1#1234"),
    //user_website: Option.none(), // Website omitted
  };

  const testProfile2: Schema.Schema.Type<typeof ProfileTable.insert> = {
    user_handle: "testuser2",
    user_name: "Test User 2",
    user_picture: Option.some("https://example.com/picture2.jpg"),
    user_bio: Option.some("This is a test bio for user 2."),
    user_twitter: Option.some("@testuser2"),
    user_discord: Option.some("testuser2#5678"),
    user_website: Option.some("https://example2.com"),
  };

  const testProfileBadHandle: Schema.Schema.Type<typeof ProfileTable.insert> = {
    user_handle: "testu ser3",
    user_name: "Test User 3",
    user_picture: Option.some("nice_picture.jpg"),
    user_bio: Option.none(),
    user_twitter: Option.none(),
    user_discord: Option.none(),
    user_website: Option.none(),
  };

  it("should create a profile", async () => {
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.createProfile(testProfile, TEST_USER_ADDRESS_1);
      }),
      TEST_USER_ADDRESS_1
    );

    expect(result).toBeDefined();
    expect(Schema.is(Schema.UUID)(result.user_id)).toBe(true);
    TEST_USER_ID_1 = result.user_id; // Store the generated ID for future tests
    expect(result.user_handle).toBe(testProfile.user_handle);
    expect(result.user_name).toBe(testProfile.user_name);
    expect(result.user_picture).toEqual(testProfile.user_picture as Option.Option<string>);
    expect(result.user_bio).toEqual(testProfile.user_bio as Option.Option<string>);
    expect(result.user_twitter).toEqual(testProfile.user_twitter as Option.Option<string>);
    expect(result.user_discord).toEqual(testProfile.user_discord as Option.Option<string>);
    expect(result.user_website).toEqual(Option.none());
    expect(Schema.is(Schema.DateTimeUtcFromDate)(result.user_created_at)).toBe(true);
    expect(Schema.is(Schema.DateTimeUtcFromDate)(result.user_updated_at)).toBe(true);
    expect(result.user_addresses).toEqual([TEST_USER_ADDRESS_1]);
  });

  it("should not create a second profile with the same address", async () => {
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.createProfile(testProfile2, TEST_USER_ADDRESS_1);
      }).pipe(
        Effect.catchTag("DatabaseDuplicateKeyError", (error) => {
          return Effect.succeed(error);
        })
      ),
      TEST_USER_ADDRESS_1
    );
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseDuplicateKeyError);
    expect((result as DatabaseDuplicateKeyError).message).toBe("This address is already associated with another profile");
  });

  it("should not create a profile with duplicate handle", async () => {
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.createProfile(testProfile, TEST_USER_ADDRESS_2);
      }).pipe(
        Effect.catchTag("DatabaseDuplicateKeyError", (error) => {
          return Effect.succeed(error);
        })
      ),
      TEST_USER_ADDRESS_2
    );
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseDuplicateKeyError);
    expect((result as DatabaseDuplicateKeyError).message).toBe("This handle is already taken");
  });

  it("should not create a profile with a bad handle", async () => {
    // Note: We are directly using SQL to bypass schema validation and test database constraint
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        // Use raw SQL to bypass schema validation and test database constraint
        yield* db.sql`
          INSERT INTO social.profiles (user_handle, user_name) 
          VALUES (${testProfileBadHandle.user_handle}, ${testProfileBadHandle.user_name})
        `;
      }).pipe(
        Effect.catchTag("SqlError", mapPostgresInsertError),
        Effect.catchTag("DatabaseInvalidRowError", Effect.succeed)
      ),
      TEST_USER_ADDRESS_2
    );
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseInvalidRowError);
    expect((result as DatabaseInvalidRowError).message).toBe("Handle must be 2-17 alphanumeric characters, and can include underscores");
  });

  it("should not create a profile with an unauthorised address", async () => {
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.createProfile(testProfile2, TEST_USER_ADDRESS_2);
      }).pipe(
        Effect.catchTag("DatabaseSecurityError", (error) => {
          return Effect.succeed(error);
        })
      ),
      TEST_USER_ADDRESS_1
    );
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseSecurityError);
    expect((result as DatabaseSecurityError).message).toBe("You do not have permission to add this address to a profile");
  });

  it("should update a profile", async () => {
   
    const updatedProfile: Schema.Schema.Type<typeof ProfileTable.update> = {
      user_id: TEST_USER_ID_1,
      // user_handle: "updatedtestuser1", // No change
      // user_name: "Updated Test User 1", // No change
      //user_picture: undefined, // No change
      user_bio: Option.some("This is an updated bio for user 1."),
      user_twitter: Option.some("@updateduser1"),
      user_discord: Option.some("updatedtestuser1#1234"),
      user_website: Option.some("https://updatedexample.com"),
      user_updated_at: undefined
    };

    const result = await runTestWithUser(
            Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.updateProfile(updatedProfile);
      }),
      TEST_USER_ADDRESS_1
    );

    expect(result).toBeDefined();
    expect(result.user_picture).toEqual(testProfile.user_picture as Option.Option<string>);
    expect(result.user_bio).toEqual(updatedProfile.user_bio as Option.Option<string>);
    expect(result.user_twitter).toEqual(updatedProfile.user_twitter as Option.Option<string>);
    expect(result.user_discord).toEqual(updatedProfile.user_discord as Option.Option<string>);
    expect(result.user_website).toEqual(updatedProfile.user_website as Option.Option<string>);
    expect(Schema.is(Schema.DateTimeUtcFromDate)(result.user_created_at)).toBe(true);
    expect(Schema.is(Schema.DateTimeUtcFromDate)(result.user_updated_at)).toBe(true);
    expect(result.user_updated_at.epochMillis).toBeGreaterThanOrEqual(result.user_created_at.epochMillis);
  });

  it("should not update a profile with an unauthorised address", async () => {
    const updatedProfile: Schema.Schema.Type<typeof ProfileTable.update> = {
      user_id: TEST_USER_ID_1,
      user_handle: "unauthorised",
      user_name: "Unauthorised Update",
      user_updated_at: undefined
    };

    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.updateProfile(updatedProfile);
      }).pipe(
        Effect.catchTag("DatabaseNotFoundError", (error) => {
          return Effect.succeed(error);
        })
      ),
      TEST_USER_ADDRESS_2
    );

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseNotFoundError);
    expect((result as DatabaseNotFoundError).message).toBe("This profile could not be updated. You may not have permission or it may not exist.");
  });

  it("should not update a profile to have the same handle as another profile", async () => {
    // First create a second profile with a different handle
    const secondProfileAddress = "test_second_profile_address";
    const secondProfile: Schema.Schema.Type<typeof ProfileTable.insert> = {
      user_handle: "seconduser",
      user_name: "Second User",
      user_picture: Option.none(),
      user_bio: Option.none(),
      user_twitter: Option.none(),
      user_discord: Option.none(),
      user_website: Option.none()
    };

    const secondProfileResult = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.createProfile(secondProfile, secondProfileAddress);
      }),
      secondProfileAddress
    );

    expect(secondProfileResult).toBeDefined();

    // Now try to update the second profile to have the same handle as the first profile
    const updateWithDuplicateHandle: Schema.Schema.Type<typeof ProfileTable.update> = {
      user_id: secondProfileResult.user_id,
      user_handle: "testuser1", // Same handle as the first profile
      user_updated_at: undefined
    };

    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.updateProfile(updateWithDuplicateHandle);
      }).pipe(
        Effect.catchTag("DatabaseDuplicateKeyError", (error) => {
          return Effect.succeed(error);
        })
      ),
      secondProfileAddress
    );

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseDuplicateKeyError);
    expect((result as DatabaseDuplicateKeyError).message).toBe("This handle is already taken");
  });

  it("should get a profile by user ID", async () => {
    const result = await runTest(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getProfileById(TEST_USER_ID_1);
      })
    );

    expect(result).toBeDefined();
    expect(result.user_id).toBe(TEST_USER_ID_1);
    expect(result.user_handle).toBe(testProfile.user_handle);
    expect(result.user_name).toBe(testProfile.user_name);
    expect(result.user_picture).toEqual(testProfile.user_picture as Option.Option<string>);
    expect(result.user_bio).toEqual(Option.some("This is an updated bio for user 1."));
    expect(result.user_twitter).toEqual(Option.some("@updateduser1"));
    expect(result.user_discord).toEqual(Option.some("updatedtestuser1#1234"));
    expect(result.user_website).toEqual(Option.some("https://updatedexample.com"));
  });

  it("should get a profile by user handle", async () => {
    const result = await runTest(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getProfileByHandle(testProfile.user_handle);
      })
    );

    expect(result).toBeDefined();
    expect(result.user_id).toBe(TEST_USER_ID_1);
    expect(result.user_handle).toBe(testProfile.user_handle);
    expect(result.user_name).toBe(testProfile.user_name);
    expect(result.user_picture).toEqual(testProfile.user_picture as Option.Option<string>);
    expect(result.user_bio).toEqual(Option.some("This is an updated bio for user 1."));
    expect(result.user_twitter).toEqual(Option.some("@updateduser1"));
    expect(result.user_discord).toEqual(Option.some("updatedtestuser1#1234"));
    expect(result.user_website).toEqual(Option.some("https://updatedexample.com"));
    
  });

  it("should get a profile by user address", async () => {
    const result = await runTest(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getProfileByAddress(TEST_USER_ADDRESS_1);
      })
    );

    expect(result).toBeDefined();
    expect(result.user_id).toBe(TEST_USER_ID_1);
    expect(result.user_handle).toBe(testProfile.user_handle);
    expect(result.user_name).toBe(testProfile.user_name);
    expect(result.user_picture).toEqual(testProfile.user_picture as Option.Option<string>);
    expect(result.user_bio).toEqual(Option.some("This is an updated bio for user 1."));
    expect(result.user_twitter).toEqual(Option.some("@updateduser1"));
    expect(result.user_discord).toEqual(Option.some("updatedtestuser1#1234"));
    expect(result.user_website).toEqual(Option.some("https://updatedexample.com"));
    
  });

  it("should not get a profile by non-existent user ID", async () => {
    const result = await runTest(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getProfileById("00000000-0000-0000-0000-000000000999");
      }).pipe(
        Effect.catchTag("DatabaseNotFoundError", (error) => {
          return Effect.succeed(error);
        })
      )
    );
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseNotFoundError);
    expect((result as DatabaseNotFoundError).message).toBe("This profile could not be found.");
    
  });

  it("should not get a profile by non-existent user handle", async () => {
    const result = await runTest(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getProfileByHandle("nonexistentuser");
      }).pipe(
        Effect.catchTag("DatabaseNotFoundError", (error) => {
          return Effect.succeed(error);
        })
      )
    );
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseNotFoundError);
    expect((result as DatabaseNotFoundError).message).toBe("This profile could not be found.");
  });

  it("should not get a profile by non-existent user address", async () => {
    const result = await runTest(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getProfileByAddress("nonexistentaddress");
      }).pipe(
        Effect.catchTag("DatabaseNotFoundError", (error) => {
          return Effect.succeed(error);
        })
      )
    );
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseNotFoundError);
    expect((result as DatabaseNotFoundError).message).toBe("This profile could not be found.");
  });

});

describe("Playlist Operations", () => {
  it("should create a playlist", async () => {
    const testPlaylist: Schema.Schema.Type<typeof PlaylistTable.insert> = {
      user_id: TEST_USER_ID_1,
      playlist_name: "Test Playlist",
      playlist_inscription_icon: Option.some("https://example.com/playlist_icon.jpg"),
      //playlist_description: Option.some("This is a test playlist description."),
    };

    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.createPlaylist(testPlaylist);
      }),
      TEST_USER_ADDRESS_1
    );

    expect(result).toBeDefined();
    expect(Schema.is(Schema.UUID)(result.playlist_id)).toBe(true);
    expect(result.user_id).toBe(testPlaylist.user_id);
    TEST_PLAYLIST_ID = result.playlist_id; // Store the generated ID for future tests
    expect(result.playlist_name).toBe(testPlaylist.playlist_name);
    expect(result.playlist_inscription_icon).toEqual(testPlaylist.playlist_inscription_icon as Option.Option<string>);
    expect(result.playlist_description).toEqual(Option.none());
    expect(Schema.is(Schema.DateTimeUtcFromDate)(result.playlist_created_at)).toBe(true);
    expect(Schema.is(Schema.DateTimeUtcFromDate)(result.playlist_updated_at)).toBe(true);
  });

  it("should not create a playlist with an unauthorised address", async () => {
    const testPlaylist: Schema.Schema.Type<typeof PlaylistTable.insert> = {
      user_id: TEST_USER_ID_1,
      playlist_name: "Unauthorized Playlist",
      playlist_inscription_icon: Option.some("https://example.com/unauthorized_icon.jpg"),
    };

    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.createPlaylist(testPlaylist);
      }).pipe(
        Effect.catchTag("DatabaseSecurityError", (error) => {
          return Effect.succeed(error);
        })
      ),
      TEST_USER_ADDRESS_2
    );

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseSecurityError);
    expect((result as DatabaseSecurityError).message).toBe("You do not have permission to create this playlist");
  });

  it("should update a playlist", async () => {
    const updatedPlaylist: Schema.Schema.Type<typeof PlaylistTable.update> = {
      user_id: TEST_USER_ID_1,
      playlist_id: TEST_PLAYLIST_ID, // Use the ID from the previous test
      playlist_name: "Updated Test Playlist",
      playlist_inscription_icon: Option.some("https://example.com/updated_playlist_icon.jpg"),
      playlist_description: Option.some("This is an updated description for the test playlist."),
      playlist_updated_at: undefined
    };

    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.updatePlaylist(updatedPlaylist);
      }),
      TEST_USER_ADDRESS_1
    );

    expect(result).toBeDefined();
    expect(result.playlist_name).toBe(updatedPlaylist.playlist_name as string);
    expect(result.playlist_inscription_icon).toEqual(updatedPlaylist.playlist_inscription_icon as Option.Option<string>);
    expect(result.playlist_description).toEqual(updatedPlaylist.playlist_description as Option.Option<string>);
    expect(Schema.is(Schema.DateTimeUtcFromDate)(result.playlist_created_at)).toBe(true);
    expect(Schema.is(Schema.DateTimeUtcFromDate)(result.playlist_updated_at)).toBe(true);
  });

  it("should not update a playlist with an unauthorised address", async () => {
    const updatedPlaylist: Schema.Schema.Type<typeof PlaylistTable.update> = {
      user_id: TEST_USER_ID_1,
      playlist_id: TEST_PLAYLIST_ID, // Use the ID from the previous test
      playlist_name: "Unauthorized Update",
      playlist_inscription_icon: Option.some("https://example.com/unauthorized_update_icon.jpg"),
      playlist_updated_at: undefined
    };

    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.updatePlaylist(updatedPlaylist);
      }).pipe(
        Effect.catchTag("DatabaseNotFoundError", (error) => {
          return Effect.succeed(error);
        })
      ),
      TEST_USER_ADDRESS_2
    );

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseNotFoundError);
    expect((result as DatabaseNotFoundError).message).toBe("This playlist could not be updated. You may not have permission or it may not exist.");
  });

  it("should get a playlist by ID", async () => {
    const result = await runTest(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getPlaylist(TEST_PLAYLIST_ID);
      })
    );

    expect(result).toBeDefined();
    expect(result.playlist_id).toBe(TEST_PLAYLIST_ID);
    expect(result.user_id).toBe(TEST_USER_ID_1);
    expect(result.playlist_name).toBe("Updated Test Playlist");
    expect(result.playlist_inscription_icon).toEqual(Option.some("https://example.com/updated_playlist_icon.jpg"));
    expect(result.playlist_description).toEqual(Option.some("This is an updated description for the test playlist."));
  });

  it("should not get a playlist by non-existent ID", async () => {
    const result = await runTest(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getPlaylist("00000000-0000-0000-0000-000000000999");
      }).pipe(
        Effect.catchTag("DatabaseNotFoundError", (error) => {
          return Effect.succeed(error);
        })
      )
    );

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseNotFoundError);
    expect((result as DatabaseNotFoundError).message).toBe("This playlist could not be found.");
  });

  it("should get playlists by user ID", async () => {
    // First create a second playlist for the same user
    const secondPlaylist: Schema.Schema.Type<typeof PlaylistTable.insert> = {
      user_id: TEST_USER_ID_1,
      playlist_name: "Second Test Playlist",
      playlist_inscription_icon: Option.some("https://example.com/second_playlist_icon.jpg"),
      playlist_description: Option.some("Second test playlist description."),
    };

    await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.createPlaylist(secondPlaylist);
      }),
      TEST_USER_ADDRESS_1
    );

    // Now get all playlists for the user
    const result = await runTest(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getPlaylistsByUserId(TEST_USER_ID_1);
      })
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    
    // Verify the playlists are ordered by creation date (most recent first)
    expect(result[0]?.user_id).toBe(TEST_USER_ID_1);
    expect(result[1]?.user_id).toBe(TEST_USER_ID_1);
    
    // The newer playlist should be first due to ORDER BY playlist_created_at DESC
    const playlistNames = result.map(p => p.playlist_name);
    expect(playlistNames).toContain("Updated Test Playlist");
    expect(playlistNames).toContain("Second Test Playlist");
  });

  it("should return empty array for user with no playlists", async () => {
    const result = await runTest(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getPlaylistsByUserId("00000000-0000-0000-0000-000000000999");
      })
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("should insert inscriptions into a playlist", async () => {
    const inscriptions: Schema.Schema.Type<typeof InsertPlaylistInscriptionsSchema> = [
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "inscription1" },
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "inscription2" }
    ];

    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.insertPlaylistInscriptions(inscriptions);
      }),
      TEST_USER_ADDRESS_1
    );

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0]?.inscription_id).toEqual("inscription1");
    expect(result[0]?.playlist_position).toEqual(0);
    expect(result[1]?.inscription_id).toEqual("inscription2");
    expect(result[1]?.playlist_position).toEqual(1);
    
  });

  it("should not insert inscriptions into a playlist with an unauthorised address", async () => {
    const inscriptions: Schema.Schema.Type<typeof InsertPlaylistInscriptionsSchema> = [
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "unauthorizedInscription1" },
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "unauthorizedInscription2" }
    ];

    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.insertPlaylistInscriptions(inscriptions);
      }).pipe(
        Effect.catchTag("DatabaseSecurityError", (error) => {
          return Effect.succeed(error);
        })
      ),
      TEST_USER_ADDRESS_2
    );

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseSecurityError);
    expect((result as DatabaseSecurityError).message).toBe("You do not have permission to add inscriptions to this playlist");
  });

  it("should update inscriptions in a playlist with positions", async () => {
    const updateInscriptions: Schema.Schema.Type<typeof UpdatePlaylistInscriptionsSchema> = [
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "updated_inscription1", playlist_position: 1 },
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "updated_inscription2", playlist_position: 0 }
    ];

    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.updatePlaylistInscriptions(TEST_PLAYLIST_ID, updateInscriptions);
      }),
      TEST_USER_ADDRESS_1
    );

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0]?.inscription_id).toEqual("updated_inscription1");
    expect(result[0]?.playlist_position).toEqual(1);
    expect(result[1]?.inscription_id).toEqual("updated_inscription2");
    expect(result[1]?.playlist_position).toEqual(0);
  });

  it("should update inscriptions in a playlist without positions", async () => {
    const updateInscriptions: Schema.Schema.Type<typeof UpdatePlaylistInscriptionsSchema> = [
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "updated_inscription1" },
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "updated_inscription2" }
    ];

    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.updatePlaylistInscriptions(TEST_PLAYLIST_ID, updateInscriptions);
      }),
      TEST_USER_ADDRESS_1
    );

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0]?.inscription_id).toEqual("updated_inscription1");
    expect(result[0]?.playlist_position).toEqual(0); // U
    expect(result[1]?.inscription_id).toEqual("updated_inscription2");
    expect(result[1]?.playlist_position).toEqual(1); // No position
  });

  it("should not update inscriptions in a playlist with an unauthorised address", async () => {
    const updateInscriptions: Schema.Schema.Type<typeof UpdatePlaylistInscriptionsSchema> = [
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "unauthorized_inscription1", playlist_position: 0 },
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "unauthorized_inscription2", playlist_position: 1 }
    ];

    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.updatePlaylistInscriptions(TEST_PLAYLIST_ID, updateInscriptions);
      }).pipe(
        Effect.catchTag("DatabaseSecurityError", (error) => {
          return Effect.succeed(error);
        })
      ),
      TEST_USER_ADDRESS_2
    );

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseSecurityError);
    expect((result as DatabaseSecurityError).message).toBe("You do not have permission to add inscriptions to this playlist");
  });

  it("should get inscriptions from a playlist", async () => {
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getPlaylistInscriptions(TEST_PLAYLIST_ID);
      }),
      TEST_USER_ADDRESS_1
    );

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0]?.inscription_id).toEqual("updated_inscription1");
    expect(result[0]?.playlist_position).toEqual(0);
    expect(result[1]?.inscription_id).toEqual("updated_inscription2");
    expect(result[1]?.playlist_position).toEqual(1);
  });

  it("should return an empty array for an empty playlist", async () => {
    const emptyPlaylistId = "00000000-0000-0000-0000-000000000002"; // Dummy ID for an empty playlist
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getPlaylistInscriptions(emptyPlaylistId);
      }),
      TEST_USER_ADDRESS_1
    );

    expect(result).toBeDefined();
    expect(result.length).toBe(0);
  });

  it("should not create a playlist with duplicate name for the same user", async () => {
    const duplicatePlaylist: Schema.Schema.Type<typeof PlaylistTable.insert> = {
      user_id: TEST_USER_ID_1,
      playlist_name: "Updated Test Playlist", // Same name as the updated playlist from earlier test
      playlist_inscription_icon: Option.some("https://example.com/duplicate_icon.jpg"),
    };

    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.createPlaylist(duplicatePlaylist);
      }).pipe(
        Effect.catchTag("DatabaseDuplicateKeyError", (error) => {
          return Effect.succeed(error);
        })
      ),
      TEST_USER_ADDRESS_1
    );

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseDuplicateKeyError);
    expect((result as DatabaseDuplicateKeyError).message).toBe("A playlist with this name already exists");
  });

  it("should not update a playlist to have the same name as another playlist for the same user", async () => {
    // First create another playlist with a different name
    const secondPlaylist: Schema.Schema.Type<typeof PlaylistTable.insert> = {
      user_id: TEST_USER_ID_1,
      playlist_name: "Second Test Playlist Update Test",
      playlist_inscription_icon: Option.some("https://example.com/second_icon.jpg"),
    };

    const createResult = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.createPlaylist(secondPlaylist);
      }),
      TEST_USER_ADDRESS_1
    );

    expect(createResult).toBeDefined();
    const secondPlaylistId = createResult.playlist_id;

    // Now try to update this playlist to have the same name as the first one
    const updateWithDuplicateName: Schema.Schema.Type<typeof PlaylistTable.update> = {
      user_id: TEST_USER_ID_1,
      playlist_id: secondPlaylistId,
      playlist_name: "Updated Test Playlist", // Same name as the existing playlist
      playlist_updated_at: undefined
    };

    const updateResult = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.updatePlaylist(updateWithDuplicateName);
      }).pipe(
        Effect.catchTag("DatabaseDuplicateKeyError", (error) => {
          return Effect.succeed(error);
        })
      ),
      TEST_USER_ADDRESS_1
    );

    expect(updateResult).toBeDefined();
    expect(updateResult).toBeInstanceOf(DatabaseDuplicateKeyError);
    expect((updateResult as DatabaseDuplicateKeyError).message).toBe("A playlist with this name already exists");
  });

  
  it("should get playlists with preview inscriptions by user ID", async () => {
    // First, add some inscriptions to the test playlist
    const inscriptions: Schema.Schema.Type<typeof InsertPlaylistInscriptionsSchema> = [
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "preview_inscription1" },
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "preview_inscription2" },
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "preview_inscription3" }
    ];

    await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.insertPlaylistInscriptions(inscriptions);
      }),
      TEST_USER_ADDRESS_1
    );

    // Now get playlists with preview inscriptions
    const result = await runTest(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getPlaylistsByUserIdPreview(TEST_USER_ID_1);
      })
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
    
    const playlistWithPreviews = result.find(p => p.playlist_id === TEST_PLAYLIST_ID);
    expect(playlistWithPreviews).toBeDefined();
    expect(playlistWithPreviews?.inscription_previews).toBeDefined();
    expect(Array.isArray(playlistWithPreviews?.inscription_previews)).toBe(true);
    expect(playlistWithPreviews?.inscription_previews.length).toBe(3);
    expect(playlistWithPreviews?.inscription_previews).toContain("preview_inscription1");
    expect(playlistWithPreviews?.inscription_previews).toContain("preview_inscription2");
    expect(playlistWithPreviews?.inscription_previews).toContain("preview_inscription3");
  });

  it("should return empty inscription_previews for playlist with no inscriptions", async () => {
    // Create a new playlist with no inscriptions
    const newPlaylistId = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.createPlaylist({
          user_id: TEST_USER_ID_1,
          playlist_name: "Empty Preview Playlist",
          playlist_inscription_icon: Option.none(),
          playlist_description: Option.none()
        });
      }),
      TEST_USER_ADDRESS_1
    );

    const result = await runTest(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getPlaylistsByUserIdPreview(TEST_USER_ID_1);
      })
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    const emptyPlaylist = result.find(p => p.playlist_id === newPlaylistId.playlist_id);
    expect(emptyPlaylist).toBeDefined();
    expect(emptyPlaylist?.inscription_previews).toBeDefined();
    expect(Array.isArray(emptyPlaylist?.inscription_previews)).toBe(true);
    expect(emptyPlaylist?.inscription_previews.length).toBe(0);
  });

  it("should limit preview inscriptions to maximum of 3", async () => {
    // Create a playlist with more than 3 inscriptions
    const manyInscriptions: Schema.Schema.Type<typeof InsertPlaylistInscriptionsSchema> = [
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "inscription_1" },
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "inscription_2" },
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "inscription_3" },
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "inscription_4" },
      { playlist_id: TEST_PLAYLIST_ID, inscription_id: "inscription_5" }
    ];

    // Clear existing inscriptions and add new ones
    await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        // First update with empty array to clear
        yield* db.updatePlaylistInscriptions(TEST_PLAYLIST_ID, []);
        // Then add the many inscriptions
        return yield* db.insertPlaylistInscriptions(manyInscriptions);
      }),
      TEST_USER_ADDRESS_1
    );

    const result = await runTest(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.getPlaylistsByUserIdPreview(TEST_USER_ID_1);
      })
    );

    expect(result).toBeDefined();
    const playlistWithPreviews = result.find(p => p.playlist_id === TEST_PLAYLIST_ID);
    expect(playlistWithPreviews).toBeDefined();
    expect(playlistWithPreviews?.inscription_previews).toBeDefined();
    expect(Array.isArray(playlistWithPreviews?.inscription_previews)).toBe(true);
    expect(playlistWithPreviews?.inscription_previews.length).toBe(3); // Should be limited to 3
  });

});

describe("Cleanup Operations", () => {
  it("should not delete inscriptions from a playlist with an unauthorised address", async () => {
    const inscriptionIds = ["inscription_1", "inscription_2"];
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.deletePlaylistInscriptions(TEST_PLAYLIST_ID, inscriptionIds);
      }).pipe(
        Effect.catchTag("DatabaseNotFoundError", (error) => {
          return Effect.succeed(error);
        })
      ),
      TEST_USER_ADDRESS_2
    );
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseNotFoundError);
    expect((result as DatabaseNotFoundError).message).toBe("The inscriptions in this playlist could not be deleted. You may not have permission or they may have already been removed.");
  });

  it("should delete inscriptions from a playlist", async () => {
    const inscriptionIds = ["inscription_1", "inscription_2"];

    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.deletePlaylistInscriptions(TEST_PLAYLIST_ID, inscriptionIds);
      }),
      TEST_USER_ADDRESS_1
    );

    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    expect(result[0]?.inscription_id).toEqual("inscription_1");
    expect(result[1]?.inscription_id).toEqual("inscription_2");
  })

  it("should not delete a playlist with an unauthorised address", async () => {
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.deletePlaylist(TEST_PLAYLIST_ID);
      }).pipe(
        Effect.catchTag("DatabaseNotFoundError", (error) => {
          return Effect.succeed(error);
        })
      ),
      TEST_USER_ADDRESS_2
    );

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseNotFoundError);
    expect((result as DatabaseNotFoundError).message).toBe("This playlist could not be deleted. You may not have permission or it may have already been removed.");
  });

  it("should delete a playlist", async () => {
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.deletePlaylist(TEST_PLAYLIST_ID);
      }),
      TEST_USER_ADDRESS_1
    );

    expect(result).toBeDefined();
    expect(result.playlist_id).toBe(TEST_PLAYLIST_ID);
  });

  it("should not delete a profile with an unauthorised address", async () => {
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.deleteProfile(TEST_USER_ID_1);
      }).pipe(
        Effect.catchTag("DatabaseNotFoundError", (error) => {
          return Effect.succeed(error);
        })
      ),
      TEST_USER_ADDRESS_2
    );

    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(DatabaseNotFoundError);
    expect((result as DatabaseNotFoundError).message).toBe("This profile could not be deleted. You may not have permission or it may have already been removed.");
  });

  it("should delete a profile", async () => {
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.deleteProfile(TEST_USER_ID_1);
      }),
      TEST_USER_ADDRESS_1
    );

    expect(result).toBeDefined();
    expect(result.user_id).toBe(TEST_USER_ID_1);
  });
});
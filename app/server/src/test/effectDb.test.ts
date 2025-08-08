import { test, expect, beforeAll, afterEach, describe, it, afterAll } from "bun:test";
import { Effect, Layer, Logger, Schema, Option } from "effect";
import { SocialDbService, PostgresTest } from "../effectDb";
import { ConfigService } from "../config";
import { AuthenticatedUserContext } from "../effectServer/authMiddleware"
import { Profile } from "../types/effectProfile";
import { withErrorContext } from "../effectUtils";
import { DatabaseDuplicateKeyError, DatabaseInvalidRowError, DatabaseSecurityError } from "../effectDbErrors";

// Test-specific UUIDs
let TEST_USER_ID_1 = "00000000-0000-0000-0000-000000000001";
const TEST_USER_ID_2 = "00000000-0000-0000-0000-000000000002";
const TEST_USER_ID_3 = "00000000-0000-0000-0000-000000000003";
const TEST_USER_ADDRESS_1 = "address1";
const TEST_USER_ADDRESS_2 = "bc1qtest123456789user2";
const TEST_USER_ADDRESS_3 = "bc1qtest123456789user3";

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
  const testProfile: Schema.Schema.Type<typeof Profile.insert> = {
    user_handle: "testuser1",
    user_name: "Test User 1",
    user_picture: Option.some("https://example.com/picture1.jpg"),
    user_bio: Option.some("This is a test bio for user 1."),
    user_twitter: Option.some("@testuser1"),
    user_discord: Option.some("testuser1#1234"),
    user_website: Option.some("https://example.com"),
  };

  const testProfile2: Schema.Schema.Type<typeof Profile.insert> = {
    user_handle: "testuser2",
    user_name: "Test User 2",
    user_picture: Option.some("https://example.com/picture2.jpg"),
    user_bio: Option.some("This is a test bio for user 2."),
    user_twitter: Option.some("@testuser2"),
    user_discord: Option.some("testuser2#5678"),
    user_website: Option.some("https://example2.com"),
  };

  const testProfileBadHandle: Schema.Schema.Type<typeof Profile.insert> = {
    user_handle: "testu ser3",
    user_name: "Test User 3",
    user_picture: Option.none(),
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
    expect(result.user_picture).toEqual(testProfile.user_picture);
    expect(result.user_bio).toEqual(testProfile.user_bio);
    expect(result.user_twitter).toEqual(testProfile.user_twitter);
    expect(result.user_discord).toEqual(testProfile.user_discord);
    expect(result.user_website).toEqual(testProfile.user_website);
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
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.createProfile(testProfileBadHandle, TEST_USER_ADDRESS_2);
      }).pipe(
        Effect.catchTag("DatabaseInvalidRowError", (error) => {
          return Effect.succeed(error);
        })
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
    const updatedProfile: Schema.Schema.Type<typeof Profile.update> = {
      user_id: TEST_USER_ID_1,
      user_handle: "updatedtestuser1",
      user_name: "Updated Test User 1",
      user_picture: Option.some("https://example.com/updated_picture1.jpg"),
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
    expect(result.user_handle).toBe(updatedProfile.user_handle);
    expect(result.user_name).toBe(updatedProfile.user_name);
    expect(result.user_picture).toEqual(updatedProfile.user_picture);
    expect(result.user_bio).toEqual(updatedProfile.user_bio);
    expect(result.user_twitter).toEqual(updatedProfile.user_twitter);
    expect(result.user_discord).toEqual(updatedProfile.user_discord);
    expect(result.user_website).toEqual(updatedProfile.user_website);
  });

});
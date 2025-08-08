import { test, expect, beforeAll, afterEach, describe, it } from "bun:test";
import { Effect, Layer, Logger, Schema, Option } from "effect";
import { SocialDbService, PostgresTest } from "../effectDb";
import { ConfigService } from "../config";
import { AuthenticatedUserContext } from "../effectServer/authMiddleware"
import { Profile } from "../types/effectProfile";

// Test-specific UUIDs
const TEST_USER_ID_1 = "00000000-0000-0000-0000-000000000001";
const TEST_USER_ID_2 = "00000000-0000-0000-0000-000000000002";
const TEST_USER_ID_3 = "00000000-0000-0000-0000-000000000003";
const TEST_USER_ADDRESS_1 = "bc1qtest123456789user1";
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
    yield* db.setupDatabase();
  }));
});

describe("Profile Operations", () => {
  const testProfile: Schema.Schema.Type<typeof Profile.insert> = {
    user_handle: "testuser3",
    user_name: "Test User 1",
    user_picture: Option.some("https://example.com/picture1.jpg"),
    user_bio: Option.some("This is a test bio for user 1."),
    user_twitter: Option.some("@testuser1"),
    user_discord: Option.some("testuser1#1234"),
    user_website: Option.some("https://example.com"),
  };

  it("should create a profile", async () => {
    const result = await runTestWithUser(
      Effect.gen(function* () {
        const db = yield* SocialDbService;
        return yield* db.createProfile(testProfile, TEST_USER_ADDRESS_3);
      }),
      TEST_USER_ADDRESS_2
    );

    expect(result).toBeDefined();
    expect(Schema.is(Schema.UUID)(result.user_id)).toBe(true);
    expect(result.user_handle).toBe(testProfile.user_handle);
    expect(result.user_name).toBe(testProfile.user_name);
    expect(result.user_picture).toEqual(testProfile.user_picture);
    expect(result.user_bio).toEqual(testProfile.user_bio);
    expect(result.user_twitter).toEqual(testProfile.user_twitter);
    expect(result.user_discord).toEqual(testProfile.user_discord);
    expect(result.user_website).toEqual(testProfile.user_website);
  });
});
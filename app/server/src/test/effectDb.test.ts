import { test, expect, beforeAll, afterEach } from "bun:test";
import { Effect, Layer, Logger } from "effect";
import { SocialDbService, PostgresTest } from "../effectDb";
import { ConfigService } from "../config";
import { AuthenticatedUserContext } from "../effectServer/authMiddleware"

// Test-specific UUIDs
const TEST_USER_ID_1 = "00000000-0000-0000-0000-000000000001";
const TEST_USER_ID_2 = "00000000-0000-0000-0000-000000000002";
const TEST_USER_ADDRESS_1 = "bc1qtest123456789user1";
const TEST_USER_ADDRESS_2 = "bc1qtest123456789user2";

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

const runTestWithUser = <A, E>(effect: Effect.Effect<A, SocialDbService>, userAddress: string) => 
  effect.pipe(
    Effect.provide(TestLayer.pipe(
      Layer.provide(Layer.succeed(AuthenticatedUserContext, { userAddress })),
    )),
    Effect.runPromise,
  );

beforeAll(async () => {
  await runTest(Effect.gen(function* () {
    const db = yield* SocialDbService;
    yield* db.setupDatabase();
  }));
});
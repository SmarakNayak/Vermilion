import { expect, it, beforeAll } from "bun:test";
import { Effect, Layer, Option } from "effect";
import { HttpApiClient, FetchHttpClient, HttpClient, HttpClientRequest } from '@effect/platform';
import { EffectServerApi, ServerTest } from "../effectServer/effectServer";
import { PostgresTest, SocialDbService } from "../effectDb";
import { ConfigService } from "../config";
import { Unauthorized } from "../effectServer/authMiddleware";
import { ParseError } from "effect/ParseResult";

let dbLayer = SocialDbService.Default.pipe(
  Layer.provide(PostgresTest),
  Layer.provide(ConfigService.Default)
);
Layer.launch(ServerTest).pipe(
  Effect.runFork
);

beforeAll(async () => {
  let clearTestDb = Effect.gen(function* () {
    const db = yield* SocialDbService;
    // Get the current database name
    const result = yield* db.sql`SELECT current_database() as db_name`;
    const dbName = result[0]?.db_name;
    if (dbName === 'vermilion_test') {
      console.log(`Dropping social schema on test db: ${dbName}`);
      yield* db.sql`DROP SCHEMA IF EXISTS social CASCADE`;
      yield* db.setupDatabase();
    } else {
      console.warn(`Skipping schema drop for non-test db: ${dbName}`);
    }
  });
  await Effect.runPromise(clearTestDb.pipe(
    Effect.provide(dbLayer)
  ));
});

// Client without authentication (for testing auth failures)
const unauthenticatedClientEffect = HttpApiClient.make(EffectServerApi, {
  baseUrl: "http://localhost:1083"
});

// Helper function to create an authenticated client
const makeAuthenticatedClient = (bearerToken: string) => 
  HttpApiClient.make(EffectServerApi, {
    baseUrl: "http://localhost:1083",
    transformClient: (client) => client.pipe(
      HttpClient.mapRequest((req) => 
        HttpClientRequest.setHeader(req, "Authorization", `Bearer ${bearerToken}`)
      )
    )
  });

const runTest = <A, E>(effect: Effect.Effect<A, E, HttpClient.HttpClient>) => 
  effect.pipe(
    Effect.provide(FetchHttpClient.layer),
    Effect.runPromise,
  );

it("should fail to create profile without authentication", async () => {
  const result = await runTest(Effect.gen(function* () {
    const apiClient = yield* unauthenticatedClientEffect;
    return yield* apiClient.profiles.createProfile({
      payload: {
        user_handle: "test",
        user_name: "Test User",
        user_picture: Option.none(),
        user_bio: Option.none(),
        user_twitter: Option.none(),
        user_discord: Option.none(),
        user_website: Option.none(),
        user_addresses: ["test_address"]
      }
    }).pipe(
      Effect.catchTag("Unauthorized", (error) => {
        return Effect.succeed(error);
      })
    );
  }));
  
  expect(result).toBeDefined();
  expect(result).toBeInstanceOf(Unauthorized);
  expect((result as Unauthorized).message).toContain("No Bearer token provided");
});

it("should create profile with valid authentication", async () => {
  const testAddress = "test_user_address_123";
  const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
  
  const response = await runTest(Effect.gen(function* () {
    const apiClient = yield* authenticatedClientEffect;
    return yield* apiClient.profiles.createProfile({
      payload: {
        user_handle: "testuser",
        user_name: "Test User",
        user_picture: Option.none(),
        user_bio: Option.some("Test bio"),
        user_twitter: Option.none(),
        user_discord: Option.none(),
        user_website: Option.none(),
        user_addresses: [testAddress]
      }
    });
  }));
  
  expect(response).toBeDefined();
  expect(response.user_handle).toBe("testuser");
  expect(response.user_name).toBe("Test User");
  expect(response.user_addresses).toEqual([testAddress]);
});

it("should fail to create profile with invalid payload", async () => {
  const testAddress = "test_user_address_456";
  const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
  
  const result = await runTest(Effect.gen(function* () {
    const apiClient = yield* authenticatedClientEffect;
    return yield* apiClient.profiles.createProfile({
      payload: {
        user_handle: "", // Invalid: empty handle
        user_name: "Test User",
        user_picture: Option.none(),
        user_bio: Option.none(),
        user_twitter: Option.none(),
        user_discord: Option.none(),
        user_website: Option.none(),
        user_addresses: [testAddress]
      }
    }).pipe(
      Effect.catchTag("ParseError", (error) => {
        return Effect.succeed(error);
      })
    );
  }));
  
  expect(result).toBeDefined();
  expect(result).toBeInstanceOf(ParseError);
  expect((result as ParseError).message).toContain("user_handle");
});

it("should update profile with valid authentication", async () => {
  const testAddress = "test_user_address_update";
  const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
  
  // First create a profile
  const createResponse = await runTest(Effect.gen(function* () {
    const apiClient = yield* authenticatedClientEffect;
    return yield* apiClient.profiles.createProfile({
      payload: {
        user_handle: "updateuser",
        user_name: "Update User",
        user_picture: Option.none(),
        user_bio: Option.some("Original bio"),
        user_twitter: Option.none(),
        user_discord: Option.none(),
        user_website: Option.none(),
        user_addresses: [testAddress]
      }
    });
  }));
  
  // Then update the profile
  const updateResponse = await runTest(Effect.gen(function* () {
    const apiClient = yield* authenticatedClientEffect;
    return yield* apiClient.profiles.updateProfile({
      urlParams: { user_id: createResponse.user_id },
      payload: {
        user_bio: Option.some("Updated bio"),
        user_website: Option.some("https://example.com")
      }
    });
  }));
  
  expect(updateResponse).toBeDefined();
  expect(updateResponse.user_id).toBe(createResponse.user_id);
  expect(updateResponse.user_bio).toEqual(Option.some("Updated bio"));
  expect(updateResponse.user_website).toEqual(Option.some("https://example.com"));
});

it("should fail to update profile without authentication", async () => {
  const result = await runTest(Effect.gen(function* () {
    const apiClient = yield* unauthenticatedClientEffect;
    return yield* apiClient.profiles.updateProfile({
      urlParams: { user_id: "00000000-0000-0000-0000-000000000001" },
      payload: {
        user_bio: Option.some("Unauthorized update")
      }
    }).pipe(
      Effect.catchTag("Unauthorized", (error) => {
        return Effect.succeed(error);
      })
    );
  }));
  
  expect(result).toBeDefined();
  expect(result).toBeInstanceOf(Unauthorized);
  expect((result as Unauthorized).message).toContain("No Bearer token provided");
});
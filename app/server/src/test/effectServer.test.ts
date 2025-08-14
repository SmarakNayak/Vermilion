import { expect, it, beforeAll } from "bun:test";
import { Effect, Layer, Option } from "effect";
import { HttpApiClient, FetchHttpClient, HttpClient, HttpClientRequest } from '@effect/platform';
import { EffectServerApi, ServerTest } from "../effectServer/effectServer";
import { PostgresTest, SocialDbService } from "../effectDb";
import { ConfigService } from "../config";
import { Unauthorized } from "../effectServer/authMiddleware";
import { ParseError } from "effect/ParseResult";
import { NotFound } from "../effectServer/apiErrors";

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

it("should delete profile with valid authentication", async () => {
  const testAddress = "test_user_address_delete";
  const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
  
  // First create a profile
  const createResponse = await runTest(Effect.gen(function* () {
    const apiClient = yield* authenticatedClientEffect;
    return yield* apiClient.profiles.createProfile({
      payload: {
        user_handle: "deleteuser",
        user_name: "Delete User",
        user_picture: Option.none(),
        user_bio: Option.none(),
        user_twitter: Option.none(),
        user_discord: Option.none(),
        user_website: Option.none(),
        user_addresses: [testAddress]
      }
    });
  }));
  
  // Then delete the profile
  const deleteResponse = await runTest(Effect.gen(function* () {
    const apiClient = yield* authenticatedClientEffect;
    return yield* apiClient.profiles.deleteProfile({
      urlParams: { user_id: createResponse.user_id }
    });
  }));
  expect(deleteResponse).toBeDefined();
  expect(deleteResponse).toBe(`Profile ${createResponse.user_id} deleted successfully`);
});

it("should fail to delete profile without authentication", async () => {
  const result = await runTest(Effect.gen(function* () {
    const apiClient = yield* unauthenticatedClientEffect;
    return yield* apiClient.profiles.deleteProfile({
      urlParams: { user_id: "00000000-0000-0000-0000-000000000001" }
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

it("should get profile by ID", async () => {
  const testAddress = "test_user_address_get_by_id";
  const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
  
  // First create a profile
  const createResponse = await runTest(Effect.gen(function* () {
    const apiClient = yield* authenticatedClientEffect;
    return yield* apiClient.profiles.createProfile({
      payload: {
        user_handle: "getbyiduser",
        user_name: "Get By ID User",
        user_picture: Option.some("https://example.com/pic.jpg"),
        user_bio: Option.some("Test bio"),
        user_twitter: Option.none(),
        user_discord: Option.none(),
        user_website: Option.none(),
        user_addresses: [testAddress]
      }
    });
  }));
  
  // Then get the profile by ID
  const getResponse = await runTest(Effect.gen(function* () {
    const apiClient = yield* unauthenticatedClientEffect; // No auth required for GET
    return yield* apiClient.profiles.getProfileById({
      urlParams: { user_id: createResponse.user_id }
    });
  }));
  
  expect(getResponse).toBeDefined();
  expect(getResponse.user_id).toBe(createResponse.user_id);
  expect(getResponse.user_handle).toBe("getbyiduser");
  expect(getResponse.user_name).toBe("Get By ID User");
});

it("should fail to get profile by non-existent ID", async () => {
  const result = await runTest(Effect.gen(function* () {
    const apiClient = yield* unauthenticatedClientEffect;
    return yield* apiClient.profiles.getProfileById({
      urlParams: { user_id: "00000000-0000-0000-0000-000000000999" }
    }).pipe(
      Effect.catchTag("NotFound", (error) => {
        return Effect.succeed(error);
      })
    );
  }));
  
  expect(result).toBeDefined();
  expect(result).toBeInstanceOf(NotFound);
});

it("should get profile by address", async () => {
  const testAddress = "test_user_address_get_by_address";
  const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
  
  // First create a profile
  await runTest(Effect.gen(function* () {
    const apiClient = yield* authenticatedClientEffect;
    return yield* apiClient.profiles.createProfile({
      payload: {
        user_handle: "getbyaddressuser",
        user_name: "Get By Address User",
        user_picture: Option.none(),
        user_bio: Option.none(),
        user_twitter: Option.none(),
        user_discord: Option.none(),
        user_website: Option.none(),
        user_addresses: [testAddress]
      }
    });
  }));
  
  // Then get the profile by address
  const getResponse = await runTest(Effect.gen(function* () {
    const apiClient = yield* unauthenticatedClientEffect; // No auth required for GET
    return yield* apiClient.profiles.getProfileByAddress({
      urlParams: { user_address: testAddress }
    });
  }));
  
  expect(getResponse).toBeDefined();
  expect(getResponse.user_handle).toBe("getbyaddressuser");
  expect(getResponse.user_addresses).toContain(testAddress);
});

it("should get profile by handle", async () => {
  const testAddress = "test_user_address_get_by_handle";
  const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
  
  // First create a profile
  await runTest(Effect.gen(function* () {
    const apiClient = yield* authenticatedClientEffect;
    return yield* apiClient.profiles.createProfile({
      payload: {
        user_handle: "getbyhandleuser",
        user_name: "Get By Handle User",
        user_picture: Option.none(),
        user_bio: Option.none(),
        user_twitter: Option.none(),
        user_discord: Option.none(),
        user_website: Option.none(),
        user_addresses: [testAddress]
      }
    });
  }));
  
  // Then get the profile by handle
  const getResponse = await runTest(Effect.gen(function* () {
    const apiClient = yield* unauthenticatedClientEffect; // No auth required for GET
    return yield* apiClient.profiles.getProfileByHandle({
      urlParams: { user_handle: "getbyhandleuser" }
    });
  }));
  
  expect(getResponse).toBeDefined();
  expect(getResponse.user_handle).toBe("getbyhandleuser");
  expect(getResponse.user_addresses).toContain(testAddress);
});

it("should create playlist with valid authentication", async () => {
  const testAddress = "test_user_address_playlist";
  const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
  
  // First create a profile
  const profileResponse = await runTest(Effect.gen(function* () {
    const apiClient = yield* authenticatedClientEffect;
    return yield* apiClient.profiles.createProfile({
      payload: {
        user_handle: "playlistuser",
        user_name: "Playlist User",
        user_picture: Option.none(),
        user_bio: Option.none(),
        user_twitter: Option.none(),
        user_discord: Option.none(),
        user_website: Option.none(),
        user_addresses: [testAddress]
      }
    });
  }));
  
  // Then create a playlist
  const playlistResponse = await runTest(Effect.gen(function* () {
    const apiClient = yield* authenticatedClientEffect;
    return yield* apiClient.playlists.createPlaylist({
      payload: {
        user_id: profileResponse.user_id,
        playlist_name: "Test Playlist",
        playlist_inscription_icon: Option.some("icon_inscription_id"),
        playlist_description: Option.some("Test playlist description")
      }
    });
  }));
  
  expect(playlistResponse).toBeDefined();
  expect(playlistResponse.playlist_id).toBeDefined();
});

it("should fail to create playlist without authentication", async () => {
  const result = await runTest(Effect.gen(function* () {
    const apiClient = yield* unauthenticatedClientEffect;
    return yield* apiClient.playlists.createPlaylist({
      payload: {
        user_id: "00000000-0000-0000-0000-000000000001",
        playlist_name: "Unauthorized Playlist",
        playlist_inscription_icon: Option.none(),
        playlist_description: Option.none()
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

it("should get playlist by ID", async () => {
  const testAddress = "test_user_address_get_playlist";
  const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
  
  // First create a profile and playlist
  const profileResponse = await runTest(Effect.gen(function* () {
    const apiClient = yield* authenticatedClientEffect;
    return yield* apiClient.profiles.createProfile({
      payload: {
        user_handle: "getplaylistuser",
        user_name: "Get Playlist User",
        user_picture: Option.none(),
        user_bio: Option.none(),
        user_twitter: Option.none(),
        user_discord: Option.none(),
        user_website: Option.none(),
        user_addresses: [testAddress]
      }
    });
  }));
  
  const playlistResponse = await runTest(Effect.gen(function* () {
    const apiClient = yield* authenticatedClientEffect;
    return yield* apiClient.playlists.createPlaylist({
      payload: {
        user_id: profileResponse.user_id,
        playlist_name: "Get Test Playlist",
        playlist_inscription_icon: Option.none(),
        playlist_description: Option.some("Description for get test")
      }
    });
  }));
  
  // Then get the playlist
  const getResponse = await runTest(Effect.gen(function* () {
    const apiClient = yield* unauthenticatedClientEffect; // No auth required for GET
    return yield* apiClient.playlists.getPlaylist({
      urlParams: { playlist_id: playlistResponse.playlist_id }
    });
  }));
  
  expect(getResponse).toBeDefined();
  expect(getResponse.playlist_id).toBe(playlistResponse.playlist_id);
  expect(getResponse.playlist_name).toBe("Get Test Playlist");
});
import { expect, it, beforeAll, describe } from "bun:test";
import { Effect, Layer, Option } from "effect";
import { HttpApiClient, FetchHttpClient, HttpClient, HttpClientRequest } from '@effect/platform';
import { EffectServerApi, ServerTest } from "../effectServer/effectServer";
import { PostgresTest, SocialDbService } from "../effectDb";
import { ConfigService } from "../config";
import { Unauthorized } from "../effectServer/authMiddleware";
import { ParseError } from "effect/ParseResult";
import { NotFound, Issue, Conflict, Forbidden } from "../effectServer/apiErrors";

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

describe("Profile Endpoints", () => {
  describe("Create Tests", () => {
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

    it("should fail to create profile with duplicate handle", async () => {
      const userAddress1 = "test_conflict_user1";
      const userAddress2 = "test_conflict_user2";
      const authenticatedClient1 = makeAuthenticatedClient(userAddress1);
      const authenticatedClient2 = makeAuthenticatedClient(userAddress2);
      
      // Create first profile
      await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClient1;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "conflictuser",
            user_name: "Conflict User 1",
            user_picture: Option.none(),
            user_bio: Option.none(),
            user_twitter: Option.none(),
            user_discord: Option.none(),
            user_website: Option.none(),
            user_addresses: [userAddress1]
          }
        });
      }));
      
      // Try to create second profile with same handle (should fail)
      const result = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClient2;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "conflictuser", // Same handle
            user_name: "Conflict User 2",
            user_picture: Option.none(),
            user_bio: Option.none(),
            user_twitter: Option.none(),
            user_discord: Option.none(),
            user_website: Option.none(),
            user_addresses: [userAddress2]
          }
        }).pipe(
          Effect.catchTag("Conflict", (error) => {
            return Effect.succeed(error);
          })
        );
      }));
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Conflict);
    });

    it("should fail to create second profile with same address", async () => {
      const userAddress = "test_same_address";
      const authenticatedClient = makeAuthenticatedClient(userAddress);
      
      // Create first profile
      await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClient;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "firstuser",
            user_name: "First User",
            user_picture: Option.none(),
            user_bio: Option.none(),
            user_twitter: Option.none(),
            user_discord: Option.none(),
            user_website: Option.none(),
            user_addresses: [userAddress]
          }
        });
      }));
      
      // Try to create second profile with same address (should fail)
      const result = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClient;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "seconduser",
            user_name: "Second User",
            user_picture: Option.none(),
            user_bio: Option.none(),
            user_twitter: Option.none(),
            user_discord: Option.none(),
            user_website: Option.none(),
            user_addresses: [userAddress] // Same address
          }
        }).pipe(
          Effect.catchTag("Conflict", (error) => {
            return Effect.succeed(error);
          })
        );
      }));
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Conflict);
    });

    it("should fail to create profile with invalid handle length", async () => {
      const testAddress = "test_invalid_handle";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      const result = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "a", // Too short (minimum 2 chars)
            user_name: "Invalid User",
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
    });

    it("should fail to create profile with handle too long", async () => {
      const testAddress = "test_long_handle";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      const result = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "thishandleistoolongtobevalid", // Too long (max 17 chars)
            user_name: "Invalid User",
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
    });
  });

  describe("Update Tests", () => {
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

    it("should fail to update another user's profile", async () => {
      const userAddress1 = "test_user_1_auth";
      const userAddress2 = "test_user_2_auth";
      const authenticatedClient1 = makeAuthenticatedClient(userAddress1);
      const authenticatedClient2 = makeAuthenticatedClient(userAddress2);
      
      // Create profile with user 1
      const profileResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClient1;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "authuser1",
            user_name: "Auth User 1",
            user_picture: Option.none(),
            user_bio: Option.none(),
            user_twitter: Option.none(),
            user_discord: Option.none(),
            user_website: Option.none(),
            user_addresses: [userAddress1]
          }
        });
      }));
      
      // Try to update with user 2 (should fail)
      const result = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClient2;
        return yield* apiClient.profiles.updateProfile({
          urlParams: { user_id: profileResponse.user_id },
          payload: {
            user_bio: Option.some("Unauthorized update")
          }
        }).pipe(
          Effect.catchTag("NotFound", (error) => {
            return Effect.succeed(error);
          })
        );
      }));
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(NotFound);
    });
  });

  describe("Delete Tests", () => {
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

    it("should fail to delete non-existent profile", async () => {
      const testAddress = "test_delete_nonexistent";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      const result = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.profiles.deleteProfile({
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
  });

  describe("Get Tests", () => {
    it("should get profile by ID", async () => {
      const testAddress = "test_user_address_get_by_id";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      // First create a profile
      const createResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "getbyid",
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
      expect(getResponse.user_handle).toBe("getbyid");
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
            user_handle: "getbyaddr",
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
      expect(getResponse.user_handle).toBe("getbyaddr");
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
            user_handle: "getbyhandle",
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
          urlParams: { user_handle: "getbyhandle" }
        });
      }));
      
      expect(getResponse).toBeDefined();
      expect(getResponse.user_handle).toBe("getbyhandle");
      expect(getResponse.user_addresses).toContain(testAddress);
    });
  });
});

describe("Playlist Endpoints", () => {
  describe("Create Tests", () => {
    it("should create playlist with valid authentication", async () => {
      const testAddress = "test_user_address_playlist";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      // First create a profile
      const profileResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "playlist",
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

    it("should fail to create playlist for another user", async () => {
      const userAddress1 = "test_playlist_user1";
      const userAddress2 = "test_playlist_user2";
      const authenticatedClient1 = makeAuthenticatedClient(userAddress1);
      const authenticatedClient2 = makeAuthenticatedClient(userAddress2);
      
      // Create profile with user 1
      const profileResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClient1;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "pluser1",
            user_name: "Playlist User 1",
            user_picture: Option.none(),
            user_bio: Option.none(),
            user_twitter: Option.none(),
            user_discord: Option.none(),
            user_website: Option.none(),
            user_addresses: [userAddress1]
          }
        });
      }));
      
      // Try to create playlist for user 1's profile using user 2's auth (should fail)
      const result = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClient2;
        return yield* apiClient.playlists.createPlaylist({
          payload: {
            user_id: profileResponse.user_id,
            playlist_name: "Unauthorized Playlist",
            playlist_inscription_icon: Option.none(),
            playlist_description: Option.none()
          }
        }).pipe(
          Effect.catchTag("Forbidden", (error) => {
            return Effect.succeed(error);
          })
        );
      }));
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Forbidden);
    });

    it("should fail to create playlist with invalid UUID", async () => {
      const testAddress = "test_invalid_uuid";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      const result = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.playlists.createPlaylist({
          payload: {
            user_id: "invalid-uuid-format", // Invalid UUID
            playlist_name: "Test Playlist",
            playlist_inscription_icon: Option.none(),
            playlist_description: Option.none()
          }
        }).pipe(
          Effect.catchTag("ParseError", (error) => {
            return Effect.succeed(error);
          })
        );
      }));
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(ParseError);
    });
  });

  describe("Update Tests", () => {
    it("should update playlist with valid authentication", async () => {
      const testAddress = "test_user_address_update_playlist";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      // First create a profile and playlist
      const profileResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "updatepl",
            user_name: "Update Playlist User",
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
            playlist_name: "Original Playlist Name",
            playlist_inscription_icon: Option.none(),
            playlist_description: Option.some("Original description")
          }
        });
      }));
      
      // Then update the playlist
      const updateResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.playlists.updatePlaylist({
          urlParams: { playlist_id: playlistResponse.playlist_id },
          payload: {
            user_id: profileResponse.user_id,
            playlist_name: "Updated Playlist Name",
            playlist_description: Option.some("Updated description")
          }
        });
      }));
      
      expect(updateResponse).toBeDefined();
      expect(updateResponse.playlist_id).toBe(playlistResponse.playlist_id);
      expect(updateResponse.playlist_name).toBe("Updated Playlist Name");
      expect(updateResponse.playlist_description).toEqual(Option.some("Updated description"));
    });

    it("should fail to update playlist without authentication", async () => {
      const result = await runTest(Effect.gen(function* () {
        const apiClient = yield* unauthenticatedClientEffect;
        return yield* apiClient.playlists.updatePlaylist({
          urlParams: { playlist_id: "00000000-0000-0000-0000-000000000001" },
          payload: {
            user_id: "00000000-0000-0000-0000-000000000010",
            playlist_name: "Unauthorized Update"
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

    it("should fail to update non-existent profile", async () => {
      const testAddress = "test_nonexistent_profile";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      const result = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.profiles.updateProfile({
          urlParams: { user_id: "00000000-0000-0000-0000-000000000999" },
          payload: {
            user_bio: Option.some("Updated bio")
          }
        }).pipe(
          Effect.catchTag("NotFound", (error) => {
            return Effect.succeed(error);
          })
        );
      }));
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(NotFound);
    });
  });

  describe("Delete Tests", () => {
    it("should delete playlist with valid authentication", async () => {
      const testAddress = "test_user_address_delete_playlist";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      // First create a profile and playlist
      const profileResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "deletepl",
            user_name: "Delete Playlist User",
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
            playlist_name: "Playlist To Delete",
            playlist_inscription_icon: Option.none(),
            playlist_description: Option.none()
          }
        });
      }));
      
      // Then delete the playlist
      const deleteResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.playlists.deletePlaylist({
          urlParams: { playlist_id: playlistResponse.playlist_id }
        });
      }));
      
      expect(deleteResponse).toBeDefined();
      expect(deleteResponse).toBe(`Playlist ${playlistResponse.playlist_id} deleted successfully`);
    });

    it("should fail to delete playlist without authentication", async () => {
      const result = await runTest(Effect.gen(function* () {
        const apiClient = yield* unauthenticatedClientEffect;
        return yield* apiClient.playlists.deletePlaylist({
          urlParams: { playlist_id: "00000000-0000-0000-0000-000000000001" }
        }).pipe(
          Effect.catchTag("Unauthorized", (error) => {
            return Effect.succeed(error);
          })
        );
      }));
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Unauthorized);
    });
  });

  describe("Get Tests", () => {
    it("should get playlist by ID", async () => {
      const testAddress = "test_user_address_get_playlist";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      // First create a profile and playlist
      const profileResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "getpl",
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

    it("should fail to get non-existent playlist", async () => {
      const result = await runTest(Effect.gen(function* () {
        const apiClient = yield* unauthenticatedClientEffect;
        return yield* apiClient.playlists.getPlaylist({
          urlParams: { playlist_id: "00000000-0000-0000-0000-000000000999" }
        }).pipe(
          Effect.catchTag("NotFound", (error) => {
            return Effect.succeed(error);
          })
        );
      }));
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(NotFound);
    });
  });
});

describe("Playlist Inscriptions Endpoints", () => {
  describe("Insert Tests", () => {
    it("should insert playlist inscriptions with valid authentication", async () => {
      const testAddress = "test_user_address_insert_inscriptions";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      // First create a profile and playlist
      const profileResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "inscript",
            user_name: "Inscriptions User",
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
            playlist_name: "Inscriptions Playlist",
            playlist_inscription_icon: Option.none(),
            playlist_description: Option.none()
          }
        });
      }));
      
      // Insert inscriptions
      const insertResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.playlists.insertPlaylistInscriptions({
          payload: [
            { playlist_id: playlistResponse.playlist_id, inscription_id: "inscription_1" },
            { playlist_id: playlistResponse.playlist_id, inscription_id: "inscription_2" }
          ]
        });
      }));
      
      expect(insertResponse).toBeDefined();
      expect(insertResponse.length).toBe(2);
      expect(insertResponse[0]?.inscription_id).toBe("inscription_1");
      expect(insertResponse[1]?.inscription_id).toBe("inscription_2");
    });

    it("should fail to insert playlist inscriptions without authentication", async () => {
      const result = await runTest(Effect.gen(function* () {
        const apiClient = yield* unauthenticatedClientEffect;
        return yield* apiClient.playlists.insertPlaylistInscriptions({
          payload: [
            { playlist_id: "00000000-0000-0000-0000-000000000001", inscription_id: "test" }
          ]
        }).pipe(
          Effect.catchTag("Unauthorized", (error) => {
            return Effect.succeed(error);
          })
        );
      }));
      
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Unauthorized);
    });
  });

  describe("Update Tests", () => {
    it("should update playlist inscriptions with valid authentication", async () => {
      const testAddress = "test_user_address_update_inscriptions";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      // First create a profile and playlist
      const profileResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "updateinsc",
            user_name: "Update Inscriptions User",
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
            playlist_name: "Update Inscriptions Playlist",
            playlist_inscription_icon: Option.none(),
            playlist_description: Option.none()
          }
        });
      }));
      
      // Insert initial inscriptions
      await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.playlists.insertPlaylistInscriptions({
          payload: [
            { playlist_id: playlistResponse.playlist_id, inscription_id: "inscription_1" },
            { playlist_id: playlistResponse.playlist_id, inscription_id: "inscription_2" }
          ]
        });
      }));
      
      // Update inscriptions
      const updateResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.playlists.updatePlaylistInscriptions({
          urlParams: { playlist_id: playlistResponse.playlist_id },
          payload: [
            { inscription_id: "updated_inscription_1", playlist_id: playlistResponse.playlist_id },
            { inscription_id: "updated_inscription_2", playlist_id: playlistResponse.playlist_id }
          ]
        });
      }));
      
      expect(updateResponse).toBeDefined();
      expect(updateResponse.length).toBe(2);
      expect(updateResponse[0]?.inscription_id).toBe("updated_inscription_1");
      expect(updateResponse[1]?.inscription_id).toBe("updated_inscription_2");
    });
  });

  describe("Delete Tests", () => {
    it("should delete playlist inscriptions with valid authentication", async () => {
      const testAddress = "test_user_address_delete_inscriptions";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      // First create a profile and playlist
      const profileResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "deleteinsc",
            user_name: "Delete Inscriptions User",
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
            playlist_name: "Delete Inscriptions Playlist",
            playlist_inscription_icon: Option.none(),
            playlist_description: Option.none()
          }
        });
      }));
      
      // Insert inscriptions
      await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.playlists.insertPlaylistInscriptions({
          payload: [
            { playlist_id: playlistResponse.playlist_id, inscription_id: "delete_inscription_1" },
            { playlist_id: playlistResponse.playlist_id, inscription_id: "delete_inscription_2" }
          ]
        });
      }));
      
      // Delete inscriptions
      const deleteResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.playlists.deletePlaylistInscriptions({
          urlParams: { playlist_id: playlistResponse.playlist_id },
          payload: ["delete_inscription_1", "delete_inscription_2"]
        });
      }));
      
      expect(deleteResponse).toBeDefined();
      expect(deleteResponse).toBe(`2 inscriptions deleted successfully from playlist ${playlistResponse.playlist_id}`);
    });
  });

  describe("Get Tests", () => {
    it("should get playlist inscriptions", async () => {
      const testAddress = "test_user_address_get_inscriptions";
      const authenticatedClientEffect = makeAuthenticatedClient(testAddress);
      
      // First create a profile and playlist
      const profileResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.profiles.createProfile({
          payload: {
            user_handle: "getinsc",
            user_name: "Get Inscriptions User",
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
            playlist_name: "Get Inscriptions Playlist",
            playlist_inscription_icon: Option.none(),
            playlist_description: Option.none()
          }
        });
      }));
      
      // Insert inscriptions
      await runTest(Effect.gen(function* () {
        const apiClient = yield* authenticatedClientEffect;
        return yield* apiClient.playlists.insertPlaylistInscriptions({
          payload: [
            { playlist_id: playlistResponse.playlist_id, inscription_id: "get_inscription_1" },
            { playlist_id: playlistResponse.playlist_id, inscription_id: "get_inscription_2" }
          ]
        });
      }));
      
      // Get inscriptions
      const getResponse = await runTest(Effect.gen(function* () {
        const apiClient = yield* unauthenticatedClientEffect; // No auth required for GET
        return yield* apiClient.playlists.getPlaylistInscriptions({
          urlParams: { playlist_id: playlistResponse.playlist_id }
        });
      }));
      
      expect(getResponse).toBeDefined();
      expect(getResponse.length).toBe(2);
      expect(getResponse[0]?.inscription_id).toBe("get_inscription_1");
      expect(getResponse[1]?.inscription_id).toBe("get_inscription_2");
    });
  });
});

it("should test home endpoint", async () => {
  const response = await runTest(Effect.gen(function* () {
    const apiClient = yield* unauthenticatedClientEffect;
    return yield* apiClient.playlists.home({});
  }));
  
  expect(response).toBeDefined();
  expect(typeof response).toBe("string");
  expect(response).toContain("Bitcoin");
});
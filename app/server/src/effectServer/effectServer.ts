import { HttpServer, HttpServerRequest, HttpApiBuilder, HttpApiSwagger, HttpMiddleware } from "@effect/platform"
import { BunHttpServer } from "@effect/platform-bun"
import { Effect, Layer, Logger } from "effect"
import { PlaylistTable, InsertPlaylistInscriptionsSchema, UpdatePlaylistInscriptionsSchema } from "../../../shared/types/playlist"
import { SocialDbService, PostgresLive, PostgresTest, DatabaseSetupLive } from "../effectDb"
import { ConfigService } from "../config"
import { AuthenticatedUserContext} from "../../../shared/api/authMiddleware"
import { AuthenticationLive, AuthenticationTest } from "./authLayers";
import { JwtService } from "./jwtService"
import { Conflict, Forbidden, Issue, NotFound } from "../../../shared/api/apiErrors"
import { ProfileTable } from "../../../shared/types/effectProfile"
import { EffectServerApi } from "../../../shared/api/effectServerApi"

//2. Implement the Api
const PlaylistsGroup = HttpApiBuilder.group(EffectServerApi, "playlists", (handlers) =>
  handlers.handle("home", homeHandler)
    .handle("createPlaylist", createPlaylistHandler)
    .handle("updatePlaylist", updatePlaylistHandler)
    .handle("deletePlaylist", deletePlaylistHandler)
    .handle("getPlaylist", getPlaylistHandler)
    .handle("insertPlaylistInscriptions", insertPlaylistInscriptionsHandler)
    .handle("updatePlaylistInscriptions", updatePlaylistInscriptionsHandler)
    .handle("deletePlaylistInscriptions", deletePlaylistInscriptionsHandler)
    .handle("getPlaylistInscriptions", getPlaylistInscriptionsHandler)
)
const ProfileGroup = HttpApiBuilder.group(EffectServerApi, "profiles", (handlers) =>
  handlers
    .handle("createProfile", createProfileHandler)
    .handle("updateProfile", updateProfileHandler)
    .handle("deleteProfile", deleteProfileHandler)
    .handle("getProfileById", getProfileByIdHandler)
    .handle("getProfileByAddress", getProfileByAddressHandler)
    .handle("getProfileByHandle", getProfileByHandleHandler)
)
export const EffectServerLive = Layer.merge(
  PlaylistsGroup,
  ProfileGroup,
)



const homeHandler = (_req: {readonly request: HttpServerRequest.HttpServerRequest}) => Effect.gen(function* () {
  return "If Bitcoin is to change the culture of money, it needs to be cool. Ordinals was the missing piece. The path to $1m is preordained";
})

const createPlaylistHandler = (req: { 
  readonly request: HttpServerRequest.HttpServerRequest, 
  readonly payload: typeof PlaylistTable.jsonCreate.Type
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  let insertedPlaylist = yield* db.createPlaylist(req.payload);
  return insertedPlaylist;
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to create playlist", error)),
  Effect.catchTags({
    "DatabaseDuplicateKeyError": (error) => new Conflict({message: error.message}),
    "DatabaseInvalidRowError": (error) => new Issue({message: error.message}),
    "DatabaseSecurityError": (error) => new Forbidden({message: error.message}),
  })
);

const updatePlaylistHandler = (req: {
  readonly path: { readonly playlist_id: string },
  readonly request: HttpServerRequest.HttpServerRequest, 
  readonly payload: typeof PlaylistTable.jsonUpdate.Type
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  const dbUpdate: typeof PlaylistTable.update.Type = {
    playlist_id: req.path.playlist_id,
    playlist_updated_at: undefined, // This is handled by effectSchema
    ...req.payload
  };
  let updatedPlaylist = yield* db.updatePlaylist(dbUpdate);
  return updatedPlaylist;
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to update playlist", error)),
  Effect.catchTags({
    "DatabaseInvalidRowError": (error) => new Issue({message: error.message}),
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);

const deletePlaylistHandler = (req: {
  readonly path: { readonly playlist_id: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  const deleted = yield* db.deletePlaylist(req.path.playlist_id);
  return `Playlist ${deleted.playlist_id} deleted successfully`;
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to delete playlist", error)),
  Effect.catchTags({
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);

const getPlaylistHandler = (req: {
  readonly path: { readonly playlist_id: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  return yield* db.getPlaylist(req.path.playlist_id);
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to get playlist", error)),
  Effect.catchTags({
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);

const insertPlaylistInscriptionsHandler = (req: {
  readonly request: HttpServerRequest.HttpServerRequest,
  readonly payload: typeof InsertPlaylistInscriptionsSchema.Type
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  let insertedInscriptions = yield* db.insertPlaylistInscriptions(req.payload);
  return insertedInscriptions;
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to insert playlist inscriptions", error)),
  Effect.catchTags({
    "DatabaseDuplicateKeyError": (error) => new Conflict({message: error.message}),
    "DatabaseInvalidRowError": (error) => new Issue({message: error.message}),
    "DatabaseSecurityError": (error) => new Forbidden({message: error.message}),
  })
);

const updatePlaylistInscriptionsHandler = (req: {
  readonly path: { readonly playlist_id: string },
  readonly request: HttpServerRequest.HttpServerRequest, 
  readonly payload: typeof UpdatePlaylistInscriptionsSchema.Type
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  let updatedInscriptions = yield* db.updatePlaylistInscriptions(req.path.playlist_id, req.payload);
  return updatedInscriptions;
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to update playlist", error)),
  Effect.catchTags({
    "DatabaseDuplicateKeyError": (error) => new Conflict({message: error.message}),
    "DatabaseInvalidRowError": (error) => new Issue({message: error.message}),
    "DatabaseSecurityError": (error) => new Forbidden({message: error.message}),
  })
);

const deletePlaylistInscriptionsHandler = (req: {
  readonly path: { readonly playlist_id: string },
  readonly request: HttpServerRequest.HttpServerRequest,
  readonly payload: readonly string[]
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  const deleted = yield* db.deletePlaylistInscriptions(req.path.playlist_id, req.payload);
  return `${deleted.length} inscriptions deleted successfully from playlist ${req.path.playlist_id}`;
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to delete playlist inscriptions", error)),
  Effect.catchTags({
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);

const getPlaylistInscriptionsHandler = (req: {
  readonly path: { readonly playlist_id: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  return yield* db.getPlaylistInscriptions(req.path.playlist_id);
});

const createProfileHandler = (req: {
  readonly request: HttpServerRequest.HttpServerRequest,
  readonly payload: typeof ProfileTable.jsonCreate.Type
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  let userContext = yield* AuthenticatedUserContext;
  let insertedProfile = yield* db.createProfile(req.payload, userContext.userAddress);
  return insertedProfile;
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to create profile", error)),
  Effect.catchTags({
    "DatabaseDuplicateKeyError": (error) => new Conflict({message: error.message}),
    "DatabaseInvalidRowError": (error) => new Issue({message: error.message}),
    "DatabaseSecurityError": (error) => new Forbidden({message: error.message}),
  })
);

const updateProfileHandler = (req: {
  readonly path: { readonly user_id: string },
  readonly request: HttpServerRequest.HttpServerRequest,
  readonly payload: typeof ProfileTable.jsonUpdate.Type
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  const dbUpdate: typeof ProfileTable.update.Type = {
    user_id: req.path.user_id,
    user_updated_at: undefined, // This is handled by effectSchema
    ...req.payload
  };
  let updatedProfile = yield* db.updateProfile(dbUpdate);
  return updatedProfile;
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to update profile", error)),
  Effect.catchTags({
    "DatabaseInvalidRowError": (error) => new Issue({message: error.message}),
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);

const deleteProfileHandler = (req: {
  readonly path: { readonly user_id: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  const deleted = yield* db.deleteProfile(req.path.user_id);
  return `Profile ${deleted.user_id} deleted successfully`;
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to delete profile", error)),
  Effect.catchTags({
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);

const getProfileByIdHandler = (req: {
  readonly path: { readonly user_id: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  return yield* db.getProfileById(req.path.user_id);
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to get profile by ID", error)),
  Effect.catchTags({
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);

const getProfileByAddressHandler = (req: {
  readonly path: { readonly user_address: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  return yield* db.getProfileByAddress(req.path.user_address);
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to get profile by address", error)),
  Effect.catchTags({
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);

const getProfileByHandleHandler = (req: {
  readonly path: { readonly user_handle: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  return yield* db.getProfileByHandle(req.path.user_handle);
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to get profile by handle", error)),
  Effect.catchTags({
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);


// Set up the server using BunHttpServer
export const ServerLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  //server stuff
  HttpServer.withLogAddress,
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(
    BunHttpServer.layer({ port: 1083 })
  ),
  //api stuff
  Layer.provide(HttpApiBuilder.api(EffectServerApi)),
  Layer.provide(EffectServerLive),
  Layer.provide(AuthenticationLive),
  Layer.provide(JwtService.Default),
  Layer.provide(DatabaseSetupLive),
  Layer.provide(SocialDbService.Default),
  Layer.provide(PostgresLive),
  Layer.provide(ConfigService.Default),
  Layer.provide(Logger.pretty)
)

//Test layer for development
export const ServerTest = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  //server stuff
  HttpServer.withLogAddress,
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(
    BunHttpServer.layer({ port: 1083 })
  ),
  //api stuff
  Layer.provide(HttpApiBuilder.api(EffectServerApi)),
  Layer.provide(EffectServerLive),
  Layer.provide(AuthenticationTest),
  Layer.provide(JwtService.Default),
  Layer.provide(SocialDbService.Default),
  Layer.provide(PostgresTest),
  Layer.provide(ConfigService.Default),
  Layer.provide(Logger.pretty)
)


// Launch the server
//Layer.launch(ServerLive).pipe(BunRuntime.runMain)
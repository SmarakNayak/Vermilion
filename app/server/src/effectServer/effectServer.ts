import { HttpServer, HttpServerResponse, HttpServerRequest, HttpApi, HttpApiGroup, HttpApiEndpoint, HttpApiBuilder, HttpApiSwagger } from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Effect, Layer, Logger, Schema } from "effect"
import { PlaylistTable, InsertPlaylistInscriptionsSchema, PlaylistInscriptionsSchema, UpdatePlaylistInscriptionsSchema } from "../types/playlist"
import { SocialDbService, PostgresLive, PostgresTest } from "../effectDb"
import { ConfigService } from "../config"
import { AuthenticatedUserContext, Authentication, AuthenticationLive, AuthenticationTest } from "./authMiddleware"
import { JwtService } from "./jwtService"
import { Conflict, Forbidden, Issue, NotFound } from "./apiErrors"
import { ProfileTable, ProfileView } from "../types/effectProfile"

// 1. Define the Api
export const EffectServerApi = HttpApi.make("EffectServer").add(
  HttpApiGroup.make("profiles")
  .add(
    HttpApiEndpoint.post("createProfile", `/social/create_profile`)
      .middleware(Authentication)
      .setPayload(ProfileView.jsonCreate)
      .addSuccess(ProfileView.json)
      .addError(Conflict)
      .addError(Forbidden)
      .addError(Issue)
  ).add(
    HttpApiEndpoint.put("updateProfile", `/social/update_profile/:user_id`)
      .middleware(Authentication)
      .setUrlParams(Schema.Struct({ user_id: Schema.UUID }))
      .setPayload(ProfileView.jsonUpdate)
      .addSuccess(ProfileView.json)
      .addError(NotFound)
      .addError(Issue)
  ).add(
    HttpApiEndpoint.get("getProfileById", `/social/get_profile_by_id/:user_id`)
      .setUrlParams(Schema.Struct({ user_id: Schema.UUID }))
      .addSuccess(ProfileView.json)
      .addError(NotFound)
  ).add(
    HttpApiEndpoint.get("getProfileByAddress", `/social/get_profile_by_address/:user_address`)
      .setUrlParams(Schema.Struct({ user_address: Schema.String }))
      .addSuccess(ProfileView.json)
      .addError(NotFound)
  ).add(
    HttpApiEndpoint.get("getProfileByHandle", `/social/get_profile_by_handle/:user_handle`)
      .setUrlParams(Schema.Struct({ user_handle: Schema.String }))
      .addSuccess(ProfileView.json)
      .addError(NotFound)
  ).add(
    HttpApiEndpoint.del("deleteProfile", `/social/delete_profile/:user_id`)
      .middleware(Authentication)
      .setUrlParams(Schema.Struct({ user_id: Schema.UUID }))
      .addSuccess(Schema.String)
      .addError(NotFound)
  )
).add(
  HttpApiGroup.make("playlists").add(
    HttpApiEndpoint.post("createPlaylist", `/social/create_playlist`)
      .middleware(Authentication)
      .setPayload(PlaylistTable.jsonCreate)
      .addSuccess(Schema.Struct(
        {playlist_id: Schema.UUID}
      ))
      .addError(Conflict)
      .addError(Forbidden)
      .addError(Issue)
  ).add(
    HttpApiEndpoint.put("updatePlaylist", `/social/update_playlist/:playlist_id`)
      .middleware(Authentication)
      .setUrlParams(Schema.Struct({ playlist_id: Schema.UUID }))
      .setPayload(PlaylistTable.jsonUpdate)
      .addSuccess(PlaylistTable.json)
      .addError(NotFound)
      .addError(Issue)
  ).add(
    HttpApiEndpoint.del("deletePlaylist", `/social/delete_playlist/:playlist_id`)
      .middleware(Authentication)
      .setUrlParams(Schema.Struct({ playlist_id: Schema.UUID }))
      .addSuccess(Schema.String)
      .addError(NotFound)
  ).add(
    HttpApiEndpoint.get("getPlaylist", `/social/get_playlist/:playlist_id`)
      .setUrlParams(Schema.Struct({ playlist_id: Schema.UUID }))
      .addSuccess(PlaylistTable.json)
      .addError(NotFound)
  ).add(
    HttpApiEndpoint.post("insertPlaylistInscriptions", `/social/insert_playlist_inscriptions`)
      .middleware(Authentication)
      .setPayload(InsertPlaylistInscriptionsSchema)
      .addSuccess(PlaylistInscriptionsSchema)
      .addError(Conflict)
      .addError(Forbidden)
      .addError(Issue)
  ).add(
    HttpApiEndpoint.put("updatePlaylistInscriptions", `/social/update_playlist_inscriptions/:playlist_id`)
      .middleware(Authentication)
      .setUrlParams(Schema.Struct({ playlist_id: Schema.UUID }))
      .setPayload(UpdatePlaylistInscriptionsSchema)
      .addSuccess(PlaylistInscriptionsSchema)
      .addError(Conflict)
      .addError(Forbidden)
      .addError(Issue)
  ).add(
    HttpApiEndpoint.del("deletePlaylistInscriptions", `/social/delete_playlist_inscriptions/:playlist_id`)
      .middleware(Authentication)
      .setUrlParams(Schema.Struct({ playlist_id: Schema.UUID }))
      .setPayload(Schema.Array(Schema.String))
      .addSuccess(Schema.String)
      .addError(NotFound)
  ).add(
    HttpApiEndpoint.get("getPlaylistInscriptions", `/social/get_playlist_inscriptions/:playlist_id`)
      .setUrlParams(Schema.Struct({ playlist_id: Schema.UUID }))
      .addSuccess(PlaylistInscriptionsSchema)
  ).add(
    HttpApiEndpoint.get("home", `/`)
      .addSuccess(Schema.String)
  )
)



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
  readonly urlParams: { readonly playlist_id: string },
  readonly request: HttpServerRequest.HttpServerRequest, 
  readonly payload: typeof PlaylistTable.jsonUpdate.Type
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  const dbUpdate: typeof PlaylistTable.update.Type = {
    playlist_id: req.urlParams.playlist_id,
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
  readonly urlParams: { readonly playlist_id: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  const deleted = yield* db.deletePlaylist(req.urlParams.playlist_id);
  return `Playlist ${deleted.playlist_id} deleted successfully`;
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to delete playlist", error)),
  Effect.catchTags({
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);

const getPlaylistHandler = (req: {
  readonly urlParams: { readonly playlist_id: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  return yield* db.getPlaylist(req.urlParams.playlist_id);
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
  readonly urlParams: { readonly playlist_id: string },
  readonly request: HttpServerRequest.HttpServerRequest, 
  readonly payload: typeof UpdatePlaylistInscriptionsSchema.Type
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  let updatedInscriptions = yield* db.updatePlaylistInscriptions(req.urlParams.playlist_id, req.payload);
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
  readonly urlParams: { readonly playlist_id: string },
  readonly request: HttpServerRequest.HttpServerRequest,
  readonly payload: readonly string[]
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  const deleted = yield* db.deletePlaylistInscriptions(req.urlParams.playlist_id, req.payload);
  return `${deleted.length} inscriptions deleted successfully from playlist ${req.urlParams.playlist_id}`;
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to delete playlist inscriptions", error)),
  Effect.catchTags({
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);

const getPlaylistInscriptionsHandler = (req: {
  readonly urlParams: { readonly playlist_id: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  return yield* db.getPlaylistInscriptions(req.urlParams.playlist_id);
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
  readonly urlParams: { readonly user_id: string },
  readonly request: HttpServerRequest.HttpServerRequest,
  readonly payload: typeof ProfileTable.jsonUpdate.Type
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  const dbUpdate: typeof ProfileTable.update.Type = {
    user_id: req.urlParams.user_id,
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
  readonly urlParams: { readonly user_id: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  const deleted = yield* db.deleteProfile(req.urlParams.user_id);
  return `Profile ${deleted.user_id} deleted successfully`;
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to delete profile", error)),
  Effect.catchTags({
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);

const getProfileByIdHandler = (req: {
  readonly urlParams: { readonly user_id: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  return yield* db.getProfileById(req.urlParams.user_id);
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to get profile by ID", error)),
  Effect.catchTags({
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);

const getProfileByAddressHandler = (req: {
  readonly urlParams: { readonly user_address: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  return yield* db.getProfileByAddress(req.urlParams.user_address);
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to get profile by address", error)),
  Effect.catchTags({
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);

const getProfileByHandleHandler = (req: {
  readonly urlParams: { readonly user_handle: string },
  readonly request: HttpServerRequest.HttpServerRequest
}) => Effect.gen(function* () {
  let db = yield* SocialDbService;
  return yield* db.getProfileByHandle(req.urlParams.user_handle);
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to get profile by handle", error)),
  Effect.catchTags({
    "DatabaseNotFoundError": (error) => new NotFound({message: error.message}),
  })
);


// Provide the implementation for the API
const EffectServerApiLive = HttpApiBuilder.api(EffectServerApi).pipe(
  Layer.provide(EffectServerLive),
  Layer.provide(AuthenticationLive),
  Layer.provide(JwtService.Default),
  Layer.provide(SocialDbService.Default),
  Layer.provide(PostgresLive),
  Layer.provide(ConfigService.Default)
)

// Set up the server using BunHttpServer
const ServerLive = HttpApiBuilder.serve().pipe(
  HttpServer.withLogAddress,
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(EffectServerApiLive),
  Layer.provide(
    BunHttpServer.layer({ port: 1083 })
  )
)

//Test layer for development
export const ServerTest = HttpApiBuilder.serve().pipe(
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
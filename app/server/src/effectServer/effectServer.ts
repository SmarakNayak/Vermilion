import { HttpServer, HttpServerResponse, HttpServerRequest, HttpApi, HttpApiGroup, HttpApiEndpoint, HttpApiBuilder, HttpApiSwagger, HttpApiError, HttpApiSchema, OpenApi } from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Effect, Layer, Schema } from "effect"
import { PlaylistTable, InsertPlaylistInscriptionsSchema, PlaylistInscriptionsSchema, UpdatePlaylistInscriptionsSchema } from "../types/playlist"
import { SocialDbService, PostgresLive } from "../effectDb"
import { ConfigService } from "../config"
import { Authentication, AuthenticationLive, AuthenticationTest } from "./authMiddleware"
import { JwtService } from "./jwtService"
import { Conflict, Forbidden, Issue } from "./apiErrors"
import { ProfileTable, ProfileView } from "../types/effectProfile"

// 1. Define the Api
const EffectServerApi = HttpApi.make("EffectServer").add(
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
      .addError(Conflict)
      .addError(Forbidden)
      .addError(Issue)
  ).add(
    HttpApiEndpoint.del("deletePlaylist", `/social/delete_playlist/:playlist_id`)
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
  ).add(
    HttpApiEndpoint.get("home", `/`)
      .addSuccess(Schema.String)
  )
).add(
  HttpApiGroup.make("profiles").add(
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
      .addError(Conflict)
      .addError(Forbidden)
      .addError(Issue)
  ).add(
    HttpApiEndpoint.get("getProfileById", `/social/get_profile_by_id/:user_id`)
      .setUrlParams(Schema.Struct({ user_id: Schema.UUID }))
      .addSuccess(ProfileView.json)
  ).add(
    HttpApiEndpoint.get("getProfileByAddress", `/social/get_profile_by_address/:user_address`)
      .setUrlParams(Schema.Struct({ user_address: Schema.String }))
      .addSuccess(ProfileView.json)
  ).add(
    HttpApiEndpoint.get("getProfileByHandle", `/social/get_profile_by_handle/:user_handle`)
      .setUrlParams(Schema.Struct({ user_handle: Schema.String }))
      .addSuccess(ProfileView.json)
  ).add(
    HttpApiEndpoint.del("deleteProfile", `/social/delete_profile/:user_id`)
      .middleware(Authentication)
      .setUrlParams(Schema.Struct({ user_id: Schema.UUID }))
      .addSuccess(Schema.Void)
      .addError(Forbidden)
  )
)



//2. Implement the Api
const EffectServerLive = HttpApiBuilder.group(EffectServerApi, "playlists", (handlers) =>
  handlers.handle("home", homeHandler)
    .handle("createPlaylist", createPlaylistHandler)
    .handle("updatePlaylist", updatePlaylistHandler)
    .handle("deletePlaylist", (req) => Effect.gen(function* () {
    }))
    .handle("insertPlaylistInscriptions", insertPlaylistInscriptionsHandler)
    .handle("updatePlaylistInscriptions", updatePlaylistInscriptionsHandler)
    .handle("deletePlaylistInscriptions", (req) => Effect.gen(function* () {
    }))
)

const homeHandler = (req: {readonly request: HttpServerRequest.HttpServerRequest}) => Effect.gen(function* () {
  return HttpServerResponse.text(
    "If Bitcoin is to change the culture of money, it needs to be cool. Ordinals was the missing piece. The path to $1m is preordained"
  );
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
    "DatabaseDuplicateKeyError": (error) => new Conflict({message: error.message}),
    "DatabaseInvalidRowError": (error) => new Issue({message: error.message}),
    "DatabaseSecurityError": (error) => new Forbidden({message: error.message}),
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

// Provide the implementation for the API
const EffectServerApiLive = HttpApiBuilder.api(EffectServerApi).pipe(
  Layer.provide(EffectServerLive),
  Layer.provide(AuthenticationTest),
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

// Launch the server
Layer.launch(ServerLive).pipe(BunRuntime.runMain)
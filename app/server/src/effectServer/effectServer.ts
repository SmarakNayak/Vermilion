import { HttpServer, HttpServerResponse, HttpServerRequest, HttpApi, HttpApiGroup, HttpApiEndpoint, HttpApiBuilder, HttpApiSwagger } from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Effect, Layer, Schema, Logger } from "effect"
import { PlaylistTable } from "../types/playlist"
import { SocialDbService, PostgresLive } from "../effectDb"
import { ConfigService } from "../config"
import { Authentication, AuthenticationLive } from "./authMiddleware"
import { JwtService } from "./jwtService"

// 1. Define the Api
const EffectServerApi = HttpApi.make("EffectServer").add(
  HttpApiGroup.make("playlists").add(
    HttpApiEndpoint.post("createPlaylist", `/social/create_playlist`)
      .addSuccess(Schema.Struct(
        {playlist_id: Schema.UUID}
      ))
      .setPayload(PlaylistTable.jsonCreate)
      .middleware(Authentication)
  ).add(
    HttpApiEndpoint.post("updatePlaylist", `/social/update_playlist/:playlist_id`)
  ).add(
    HttpApiEndpoint.del("deletePlaylist", `/social/delete_playlist/:playlist_id`)
  ).add(
    HttpApiEndpoint.post("insertPlaylistInscriptions", `/social/insert_playlist_inscriptions`)
  ).add(
    HttpApiEndpoint.post("updatePlaylistInscriptions", `/social/update_playlist_inscriptions/:playlist_id`)
  ).add(
    HttpApiEndpoint.del("deletePlaylistInscriptions", `/social/delete_playlist_inscriptions/:playlist_id`)
  ).add(
    HttpApiEndpoint.get("home", `/`)
      .addSuccess(Schema.String)
  )
)

//2. Implement the Api
const EffectServerLive = HttpApiBuilder.group(EffectServerApi, "playlists", (handlers) =>
  handlers.handle("createPlaylist", createPlaylistHandler)
  .handle("updatePlaylist", (req) => Effect.gen(function* () {

  }))
  .handle("deletePlaylist", (req) => Effect.gen(function* () {
  }))
  .handle("insertPlaylistInscriptions", (req) => Effect.gen(function* () {
  }))
  .handle("updatePlaylistInscriptions", (req) => Effect.gen(function* () {
  }))
  .handle("deletePlaylistInscriptions", (req) => Effect.gen(function* () {
  }))
  .handle("home", homeHandler)
)

let createPlaylistHandler = (req: {readonly request: HttpServerRequest.HttpServerRequest}) =>  Effect.gen(function* () {
  let body = yield* req.request.json;
  let newPlaylistInfo = yield* Schema.decodeUnknown(PlaylistTable.jsonCreate)(body);
  let db = yield* SocialDbService;
  let insertedPlaylist = yield* db.createPlaylist(newPlaylistInfo);
  return insertedPlaylist;
}).pipe(
  Effect.tapError((error) => Effect.logError("Failed to create playlist", error)),
  Effect.catchTags({
    "RequestError": (error) => HttpServerResponse.text(`Body is not valid json - ${error.message}`, { status: 400 }),
    "ParseError": (error) => HttpServerResponse.text(`Json body is wrong shape - ${error.message}`, { status: 400 }),
    "DatabaseDuplicateKeyError": (error) => HttpServerResponse.text(`${error.message}`, { status: 409 }),
    "DatabaseInvalidRowError": (error) => HttpServerResponse.text(`${error.message}`, { status: 400 }),
    "DatabaseSecurityError": (error) => HttpServerResponse.text(`${error.message}`, { status: 403 }),
  })
);

let homeHandler = (req: {readonly request: HttpServerRequest.HttpServerRequest}) => Effect.gen(function* () {
  return HttpServerResponse.text(
    "If Bitcoin is to change the culture of money, it needs to be cool. Ordinals was the missing piece. The path to $1m is preordained"
  );
})


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
  Layer.provide(EffectServerApiLive),
  Layer.provide(
    BunHttpServer.layer({ port: 1083 })
  )
)

// Launch the server
Layer.launch(ServerLive).pipe(BunRuntime.runMain)
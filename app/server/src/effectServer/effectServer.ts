import { HttpRouter, HttpServer, HttpServerResponse, HttpServerRequest, HttpLayerRouter, HttpApi, HttpApiGroup, HttpApiEndpoint, HttpApiBuilder } from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Effect, Layer, Schema, Context } from "effect"
import { NewPlaylistInfoSchema } from "../types/playlist"
import { SocialDbService, PostgresLive } from "../effectDb"
import { ConfigService } from "../config"


// 1. Define the Api
const EffectServerApi = HttpApi.make("EffectServer").add(
  HttpApiGroup.make("playlists").add(
    HttpApiEndpoint.post("createPlaylist", `/social/create_playlist`)
      .addSuccess(Schema.Struct(
        {playlist_id: Schema.String}
      ))
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
    HttpApiEndpoint.get("test", `/social/test`)
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
  .handle("test", testHandler)
)

let createPlaylistHandler = (req: {readonly request: HttpServerRequest.HttpServerRequest}) =>  Effect.gen(function* () {
  let body = yield* req.request.json;
  let newPlaylistInfo = yield* Schema.decodeUnknown(NewPlaylistInfoSchema)(body);
  let db = yield* SocialDbService;
  let insertedPlaylist = yield* db.createPlaylist(newPlaylistInfo, {
    userAddress: "0x1234567890abcdef"
  });
  return insertedPlaylist;
}).pipe(
  Effect.catchTags({
    "InternalDatabaseError": (error) => HttpServerResponse.text(`Internal database error: ${error.message}`, { status: 500 }),
    "ParseError": (error) => HttpServerResponse.text(`Request was unable to be parsed: ${error.message}`, { status: 400 }),
    "RequestError": (error) => HttpServerResponse.text(`Request error: ${error.message}`, { status: 400 }),
  })
);

let testHandler = (req: {readonly request: HttpServerRequest.HttpServerRequest}) => Effect.gen(function* () {
  return "Test successful!";
})


// Provide the implementation for the API
const EffectServerApiLive = HttpApiBuilder.api(EffectServerApi).pipe(
  Layer.provide(EffectServerLive),
  Layer.provide(SocialDbService.Default),
  Layer.provide(PostgresLive),
  Layer.provide(ConfigService.Default)
)

// Set up the server using BunHttpServer
const ServerLive = HttpApiBuilder.serve().pipe(
  HttpServer.withLogAddress,

  Layer.provide(EffectServerApiLive),
  Layer.provide(
    BunHttpServer.layer({ port: 1083 })
  )
)

// Launch the server
Layer.launch(ServerLive).pipe(BunRuntime.runMain)



// // Set up the application server with logging
// const app = router.pipe(HttpServer.serve(), HttpServer.withLogAddress)

// // Run the application
// app.pipe(
//   Layer.provide(
//     BunHttpServer.layer({ port: 1083 })
//   ),
//   Layer.launch,
//   BunRuntime.runMain
// );
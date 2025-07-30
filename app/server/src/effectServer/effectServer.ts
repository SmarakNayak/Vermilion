import { HttpRouter, HttpServer, HttpServerResponse, HttpServerRequest, HttpLayerRouter, HttpApi, HttpApiGroup, HttpApiEndpoint, HttpApiBuilder } from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Effect, Layer, Schema, Context } from "effect"
import { NewPlaylistInfoSchema } from "../types/playlist"
import { SocialDbService } from "../effectDb"


// 1. Define the Api
const EffectServerApi = HttpApi.make("EffectServer").add(
  HttpApiGroup.make("playlists").add(
    HttpApiEndpoint.post("createPlaylist", `/social/create_playlist`)
      // .addSuccess(Schema.Struct(
      //   {playlistId: Schema.String}
      // ))
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
  )
)

//2. Implement the Api
const EffectServerLive = HttpApiBuilder.group(EffectServerApi, "playlists", (handlers) =>
  handlers.handle("createPlaylist", (req) => Effect.gen(function* () {
    // let body = yield* req.request.json;
    // let newPlaylist = yield* Schema.decodeUnknown(NewPlaylistInfoSchema)(body);

  }))
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
)

let testEffect = (req: {readonly request: HttpServerRequest.HttpServerRequest}) =>  Effect.gen(function* () {
  let body = yield* req.request.json;
  let decodedBody = yield* Schema.decodeUnknown(NewPlaylistInfoSchema)(body);
  let db = yield* SocialDbService;
  let insertedPlaylist = yield* db.createPlaylist(decodedBody, {
    userAddress: "0x1234567890abcdef"
  });
}).pipe(
  Effect.catchTags({
    "InternalDatabaseError": (error) => HttpServerResponse.text(`Internal database error: ${error.message}`, { status: 500 }),
    "ParseError": (error) => HttpServerResponse.text(`Request was unable to be parsed: ${error.message}`, { status: 400 }),
    "RequestError": (error) => HttpServerResponse.text(`Request error: ${error.message}`, { status: 400 }),
    "SqlError": (error) => HttpServerResponse.text(`SQL error: ${error.message}`, { status: 500 }),
  })
);

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
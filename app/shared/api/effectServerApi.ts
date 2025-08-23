import { Schema } from "effect";
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Authentication } from "./authMiddleware";
import { Conflict, Forbidden, Issue, NotFound } from "./apiErrors";
import { ProfileView } from "../types/effectProfile";
import { PlaylistTable, UpdatePlaylistInscriptionsSchema, InsertPlaylistInscriptionsSchema, PlaylistInscriptionsSchema } from "../types/playlist";

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
      .setPath(Schema.Struct({ user_id: Schema.UUID }))
      .setPayload(ProfileView.jsonUpdate)
      .addSuccess(ProfileView.json)
      .addError(NotFound)
      .addError(Issue)
  ).add(
    HttpApiEndpoint.get("getProfileById", `/social/get_profile_by_id/:user_id`)
      .setPath(Schema.Struct({ user_id: Schema.UUID }))
      .addSuccess(ProfileView.json)
      .addError(NotFound)
  ).add(
    HttpApiEndpoint.get("getProfileByAddress", `/social/get_profile_by_address/:user_address`)
      .setPath(Schema.Struct({ user_address: Schema.String }))
      .addSuccess(ProfileView.json)
      .addError(NotFound)
  ).add(
    HttpApiEndpoint.get("getProfileByHandle", `/social/get_profile_by_handle/:user_handle`)
      .setPath(Schema.Struct({ user_handle: Schema.String }))
      .addSuccess(ProfileView.json)
      .addError(NotFound)
  ).add(
    HttpApiEndpoint.del("deleteProfile", `/social/delete_profile/:user_id`)
      .middleware(Authentication)
      .setPath(Schema.Struct({ user_id: Schema.UUID }))
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
      .setPath(Schema.Struct({ playlist_id: Schema.UUID }))
      .setPayload(PlaylistTable.jsonUpdate)
      .addSuccess(PlaylistTable.json)
      .addError(NotFound)
      .addError(Issue)
  ).add(
    HttpApiEndpoint.del("deletePlaylist", `/social/delete_playlist/:playlist_id`)
      .middleware(Authentication)
      .setPath(Schema.Struct({ playlist_id: Schema.UUID }))
      .addSuccess(Schema.String)
      .addError(NotFound)
  ).add(
    HttpApiEndpoint.get("getPlaylist", `/social/get_playlist/:playlist_id`)
      .setPath(Schema.Struct({ playlist_id: Schema.UUID }))
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
      .setPath(Schema.Struct({ playlist_id: Schema.UUID }))
      .setPayload(UpdatePlaylistInscriptionsSchema)
      .addSuccess(PlaylistInscriptionsSchema)
      .addError(Conflict)
      .addError(Forbidden)
      .addError(Issue)
  ).add(
    HttpApiEndpoint.del("deletePlaylistInscriptions", `/social/delete_playlist_inscriptions/:playlist_id`)
      .middleware(Authentication)
      .setPath(Schema.Struct({ playlist_id: Schema.UUID }))
      .setPayload(Schema.Array(Schema.String))
      .addSuccess(Schema.String)
      .addError(NotFound)
  ).add(
    HttpApiEndpoint.get("getPlaylistInscriptions", `/social/get_playlist_inscriptions/:playlist_id`)
      .setPath(Schema.Struct({ playlist_id: Schema.UUID }))
      .addSuccess(PlaylistInscriptionsSchema)
  ).add(
    HttpApiEndpoint.get("home", `/`)
      .addSuccess(Schema.String)
  )
)

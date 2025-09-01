import { Schema } from "effect";
import { Model } from "@effect/sql";
import { FieldOptionOmittable, FieldUpdateOmittable } from "./omittable";

// Using sql.Model.Class to define the PlaylistInfo tables
export class PlaylistTable extends Model.Class<PlaylistTable>("PlaylistTable")({
  playlist_id: Model.Generated(Schema.UUID),
  user_id: Schema.UUID,
  playlist_name: FieldUpdateOmittable(Schema.String.pipe(
    Schema.minLength(1,{message: () => "Name cannot be empty" }),
    Schema.maxLength(100, { message: () => "Name must be 100 characters or less" })
  )),
  playlist_inscription_icon: FieldOptionOmittable(Schema.String),
  playlist_description: FieldOptionOmittable(Schema.String.pipe(
    Schema.maxLength(280, { message: () => "Description must be 280 characters or less" })
  )),
  playlist_created_at: Model.Field({
    select: Schema.DateTimeUtc,
    json: Schema.DateTimeUtc,
  }),
  playlist_updated_at: Model.Field({
    select: Schema.DateTimeUtc,
    update: Model.DateTimeWithNow,
    json: Schema.DateTimeUtc,
  }),
}) {};

// Using raw schemas for PlaylistInscriptions Schemas due to complicated array types
export const PlaylistInscriptionsSchema = Schema.Array(
  Schema.Struct({
    playlist_id: Schema.UUID,
    inscription_id: Schema.String,
    playlist_position: Schema.Number,
    added_at: Schema.DateTimeUtc,
  })
);
export type PlaylistInscriptions = Schema.Schema.Type<typeof PlaylistInscriptionsSchema>;

export const InsertPlaylistInscriptionsSchema = Schema.Array(
  Schema.Struct({
    playlist_id: Schema.UUID,
    inscription_id: Schema.String
  })
);
export type InsertPlaylistInscriptions = Schema.Schema.Type<typeof InsertPlaylistInscriptionsSchema>;

const UpdatePlaylistInscriptionsWithPositionsSchema = Schema.Array(
  Schema.Struct({
    playlist_id: Schema.UUID,
    inscription_id: Schema.String,
    playlist_position: Schema.Number, // Required
  })
);
const UpdatePlaylistInscriptionsWithoutPositionsSchema = Schema.Array(
  Schema.Struct({
    playlist_id: Schema.UUID,
    inscription_id: Schema.String,
    // No playlist_position at all
  })
);
export const UpdatePlaylistInscriptionsSchema = Schema.Union(
  UpdatePlaylistInscriptionsWithPositionsSchema,
  UpdatePlaylistInscriptionsWithoutPositionsSchema
);
export type UpdatePlaylistInscriptions = Schema.Schema.Type<typeof UpdatePlaylistInscriptionsSchema>;


// Join types
export const PlaylistPreviewSchema = Schema.extend(
  PlaylistTable.select,
  Schema.Struct({
    inscription_previews: Schema.Array(Schema.String),
    count: Schema.Number,
  })
);
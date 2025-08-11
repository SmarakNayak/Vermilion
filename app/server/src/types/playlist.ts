import { Schema } from "effect";
import { Model } from "@effect/sql";
import { FieldOptionOmittable, FieldUpdateOmittable } from "./omittable";

// Using sql.Model.Class to define the PlaylistInfo tables
export class PlaylistTable extends Model.Class<PlaylistTable>("PlaylistTable")({
  playlist_id: Model.Generated(Schema.UUID),
  user_id: Schema.UUID,
  playlist_name: FieldUpdateOmittable(Schema.String),
  playlist_inscription_icon: FieldOptionOmittable(Schema.String),
  playlist_description: FieldOptionOmittable(Schema.String),
  playlist_created_at: Model.Field({
    select: Schema.DateTimeUtcFromDate,
    json: Schema.DateTimeUtcFromDate,
  }),
  playlist_updated_at: Model.Field({
    select: Schema.DateTimeUtcFromDate,
    update: Model.DateTimeFromDateWithNow,
    json: Schema.DateTimeUtcFromDate,
  }),
}) {};

// Using raw schemas for PlaylistInscriptions Schemas due to complicated array types
export const PlaylistInscriptionsSchema = Schema.Array(
  Schema.Struct({
    playlist_id: Schema.UUID,
    inscription_id: Schema.String,
    playlist_position: Schema.Number,
    added_at: Schema.DateTimeUtcFromDate,
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
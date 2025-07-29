import { Schema } from "effect";


// PlaylistInfo Schemas
export const PlaylistInfoSchema = Schema.Struct({
  playlist_id: Schema.UUID,
  user_id: Schema.UUID,
  playlist_name: Schema.String,
  playlist_inscription_icon: Schema.NullOr(Schema.String),
  playlist_description: Schema.NullOr(Schema.String),
  playlist_created_at: Schema.DateTimeUtc,
  playlist_updated_at: Schema.DateTimeUtc,
});
export type PlaylistInfo = Schema.Schema.Type<typeof PlaylistInfoSchema>;

export const NewPlaylistInfoSchema = Schema.Struct({
  user_id: Schema.UUID,
  playlist_name: Schema.String,
  playlist_inscription_icon: Schema.NullOr(Schema.String),
  playlist_description: Schema.NullOr(Schema.String),
});
export type NewPlaylistInfo = Schema.Schema.Type<typeof NewPlaylistInfoSchema>;

export const UpdatePlaylistInfoSchema = Schema.Struct({
  playlist_id: Schema.UUID,
  user_id: Schema.UUID,
  playlist_name: Schema.optionalWith(Schema.String, {
    exact: true,
  }),
  playlist_inscription_icon: Schema.optionalWith(Schema.String, {
    exact: true,
  }),
  playlist_description: Schema.optionalWith(Schema.String, {
    exact: true,
  }),
});
export type UpdatePlaylistInfo = Schema.Schema.Type<typeof UpdatePlaylistInfoSchema>;

// PlaylistInscriptions Schemas
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
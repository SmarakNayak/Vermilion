import { Schema } from "effect";
import { Model } from "@effect/sql";

// Profile model using @effect/sql Model.Class
export class Profile extends Model.Class<Profile>("Profile")({
  user_id: Model.Generated(Schema.UUID),
  user_handle: Schema.String.pipe(Schema.minLength(2), Schema.maxLength(17)),
  user_name: Schema.String.pipe(Schema.maxLength(30)),
  user_picture: Model.FieldOption(Schema.String.pipe(Schema.maxLength(80))),
  user_bio: Model.FieldOption(Schema.String.pipe(Schema.maxLength(280))),
  user_twitter: Model.FieldOption(Schema.String.pipe(Schema.maxLength(15))),
  user_discord: Model.FieldOption(Schema.String.pipe(Schema.maxLength(37))),
  user_website: Model.FieldOption(Schema.String),
  user_created_at: Model.DateTimeInsert,
  user_updated_at: Model.DateTimeUpdate,
  user_addresses: Schema.Array(Schema.String)
}) {}

// Now we get these variants automatically:
// Profile - for selects
// Profile.insert - for inserts (excludes generated fields)
// Profile.update - for updates (includes all updatable fields)
// Profile.json - for JSON API responses
// Profile.jsonCreate - for JSON API creates
// Profile.jsonUpdate - for JSON API updates
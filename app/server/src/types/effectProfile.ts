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
  user_created_at: Model.Field({ // Db sets for insert || no need to update
    select: Schema.DateTimeUtc,
    json: Schema.DateTimeUtc,
  }),
  user_updated_at: Model.Field({ // Db sets for insert || app sets for update
    select: Schema.DateTimeUtc,
    update: Model.DateTimeWithNow,
    json: Schema.DateTimeUtc,
  }),
  user_addresses: Model.Field({
    json: Schema.Array(Schema.String),      // Available in JSON responses  
    jsonCreate: Schema.Array(Schema.String), // Available in JSON create responses
  })
}) {}

// Extend individual variants for the view
export const ProfileView = Schema.extend(Profile, Schema.Struct({
  user_addresses: Schema.Array(Schema.String)  // View has user_addresses on select
}));

// Now we get these variants automatically:
// Profile - for selects
// Profile.insert - for inserts (excludes generated fields)
// Profile.update - for updates (includes all updatable fields)
// Profile.json - for JSON API responses
// Profile.jsonCreate - for JSON API creates
// Profile.jsonUpdate - for JSON API updates
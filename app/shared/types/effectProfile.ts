import { Schema } from "effect";
import { Model } from "@effect/sql";
import { FieldOptionOmittable, FieldUpdateOmittable } from "./omittable";

// Profile model using @effect/sql Model.Class
const baseFields = {
  user_id: Model.Generated(Schema.UUID),
  user_handle: FieldUpdateOmittable(Schema.String.pipe(
    Schema.minLength(2), 
    Schema.maxLength(17),
    Schema.pattern(/^[a-zA-Z0-9_]{2,17}$/, {
      message: () => "Handle must be 2-17 alphanumeric characters, and can include underscores"
    })
  )),
  user_name: FieldUpdateOmittable(Schema.String.pipe(
    Schema.minLength(1, { message: () => "Display name cannot be empty" }),
    Schema.maxLength(30, { message: () => "Display name must be 30 characters or less" })
  )),
  user_picture: FieldOptionOmittable(Schema.String.pipe(Schema.maxLength(80))),
  user_bio: FieldOptionOmittable(Schema.String.pipe(
    Schema.maxLength(280, { message: () => "Bio must be 280 characters or less" })
  )),
  user_twitter: FieldOptionOmittable(Schema.String.pipe(
    Schema.maxLength(15, { message: () => "Twitter username must be 15 characters or less" }),
    Schema.pattern(/^[a-zA-Z0-9_]+$/, {
      message: () => "Twitter username can only contain letters, numbers, and underscores"
    })
  )),
  user_discord: FieldOptionOmittable(Schema.String.pipe(
    Schema.maxLength(37, { message: () => "Discord username must be 37 characters or less" }),
    Schema.pattern(/^[a-zA-Z0-9_.]+$/, {
      message: () => "Discord username can only contain letters, numbers, periods, and underscores"
    })
  )),
  user_website: FieldOptionOmittable(Schema.String.pipe(
    Schema.pattern(/^https?:\/\/.+\..+/, {
      message: () => "Website must be a valid URL starting with http:// or https://"
    })
  )),
  user_created_at: Model.Field({ // Db sets for insert || no need to update
    select: Schema.DateTimeUtc,
    json: Schema.DateTimeUtc,
  }),
  user_updated_at: Model.Field({ // Db sets for insert || app autosets for update
    select: Schema.DateTimeUtc,
    update: Model.DateTimeWithNow,
    json: Schema.DateTimeUtc,
  }),
}

export class ProfileTable extends Model.Class<ProfileTable>("ProfileTable")(baseFields) {}
export class ProfileView extends Model.Class<ProfileView>("ProfileView")({
  ...baseFields,
  user_addresses: Model.Field({
    select: Schema.Array(Schema.String), // Available in SQL queries
    json: Schema.Array(Schema.String),      // Available in JSON responses  
    jsonCreate: Schema.Array(Schema.String), // Available in JSON create responses
  })
}) {}

//type Profile = Schema.Schema.Type<typeof ProfileTable.jsonCreate>
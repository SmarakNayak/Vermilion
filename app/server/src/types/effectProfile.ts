import { Schema, Option } from "effect";
import { Model } from "@effect/sql";
import { FieldOptionOmittable } from "./omittable";

// Profile model using @effect/sql Model.Class
const baseFields = {
  user_id: Model.Generated(Schema.UUID),
  user_handle: Schema.String.pipe(Schema.minLength(2), Schema.maxLength(17)),
  user_name: Schema.String.pipe(Schema.maxLength(30)),
  user_picture: FieldOptionOmittable(Schema.String.pipe(Schema.maxLength(80))),
  user_bio: FieldOptionOmittable(Schema.String.pipe(Schema.maxLength(280))),
  user_twitter: FieldOptionOmittable(Schema.String.pipe(Schema.maxLength(15))),
  user_discord: FieldOptionOmittable(Schema.String.pipe(Schema.maxLength(37))),
  user_website: FieldOptionOmittable(Schema.String),
  user_created_at: Model.Field({ // Db sets for insert || no need to update
    select: Schema.DateTimeUtcFromDate,
    json: Schema.DateTimeUtcFromDate,
  }),
  user_updated_at: Model.Field({ // Db sets for insert || app autosets for update
    select: Schema.DateTimeUtcFromDate,
    update: Model.DateTimeFromDateWithNow,
    json: Schema.DateTimeUtcFromDate,
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
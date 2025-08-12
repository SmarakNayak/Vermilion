import { HttpApiSchema } from "@effect/platform"
import { Schema} from "effect"

export class Conflict extends Schema.TaggedError<Conflict>()(
  "Conflict",
  {
    message: Schema.String
  },
  HttpApiSchema.annotations({ status: 409, description: "Request conflicts with existing data" })
) {};

export class Forbidden extends Schema.TaggedError<Forbidden>()(
  "Forbidden",
  {
    message: Schema.String
  },
  HttpApiSchema.annotations({ status: 403, description: "Access denied by security policy" })
) {};

export class Issue extends Schema.TaggedError<Issue>()(
  "Issue",
  {
    message: Schema.String
  },
  HttpApiSchema.annotations({ status: 400, description: "Request data violates field constraints" })
) {};
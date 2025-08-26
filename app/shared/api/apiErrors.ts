import { HttpApiSchema } from "@effect/platform"
import { Schema} from "effect"
import { Unauthorized } from "./authMiddleware";

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

// Note Issue is used for db validation errors not caught by Schema.
// As of now, all db constraints are handled by Schema via ParseError, so they should not occur.
export class Issue extends Schema.TaggedError<Issue>()(
  "Issue",
  {
    message: Schema.String
  },
  HttpApiSchema.annotations({ status: 400, description: "Request data violates field constraints" })
) {};

export class NotFound extends Schema.TaggedError<NotFound>()(
  "NotFound",
  {
    message: Schema.String
  },
  HttpApiSchema.annotations({ status: 404, description: "Requested data was not found or denied by security policy" })
) {};

export type ApiError = Conflict | Forbidden | Issue | NotFound | Unauthorized;
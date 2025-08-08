import { Data, Schema } from "effect";

export const PostgresDuplicateKeySchema = Schema.Struct({
  name: Schema.Literal("PostgresError"),
  code: Schema.Literal("23505"),
  message: Schema.String,
  detail: Schema.String,
  schema_name: Schema.String,
  table_name: Schema.String,
  constraint_name: Schema.String,
});
export type PostgresDuplicateKeyError = Schema.Schema.Type<typeof PostgresDuplicateKeySchema>;

export class DatabaseDuplicateKeyError extends Data.TaggedError("DatabaseDuplicateKeyError")<{
  // User-facing error details
  readonly message: string;
  // Server error details
  readonly postgresMessage: string;
  readonly code: string;
  readonly detail: string;
  readonly schema_name: string;
  readonly table_name: string;
  readonly constraint_name: string;
}> {
  static fromPostgresError(error: PostgresDuplicateKeyError): DatabaseDuplicateKeyError {
    const constraintMessages: Record<string, string> = {
      "profile_addresses_pkey": "This address is already associated with another profile",
      "profiles_user_handle_key": "This handle is already taken",
      // "unique_handle_case_insensitive": "This handle is already taken"
    };

    return new DatabaseDuplicateKeyError({
      message: constraintMessages[error.constraint_name] || `Duplicate key error on ${error.table_name}.${error.constraint_name}`,
      postgresMessage: error.message,
      code: error.code,
      detail: error.detail,
      schema_name: error.schema_name,
      table_name: error.table_name,
      constraint_name: error.constraint_name,
    });
  }
}
import { Data, Schema, Effect, Option } from "effect";
import {SqlError} from "@effect/sql";

export const PostgresDuplicateKeySchema = Schema.Struct({
  name: Schema.Literal("PostgresError"),
  code: Schema.Literal("23505"),
  message: Schema.String,
  detail: Schema.optional(Schema.String),
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
  readonly detail: undefined | string;
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

export const PostgresInvalidRowSchema = Schema.Struct({
  name: Schema.Literal("PostgresError"),
  code: Schema.Literal("23514"),
  message: Schema.String,
  detail: Schema.optional(Schema.String),
  schema_name: Schema.String,
  table_name: Schema.String,
  constraint_name: Schema.String,
});
export type PostgresInvalidRowError = Schema.Schema.Type<typeof PostgresInvalidRowSchema>;

export class DatabaseInvalidRowError extends Data.TaggedError("DatabaseInvalidRowError")<{
  readonly message: string;
  readonly postgresMessage: string;
  readonly code: string;
  readonly detail: string | undefined;
  readonly schema_name: string;
  readonly table_name: string;
  readonly constraint_name: string;
}> {
  static fromPostgresError(error: PostgresInvalidRowError): DatabaseInvalidRowError {
    const constraintMessages: Record<string, string> = {
      "valid_handle": "Handle must be 2-17 alphanumeric characters, and can include underscores",
      // "unique_handle_case_insensitive": "This handle is already taken"
    };

    return new DatabaseInvalidRowError({
      message: constraintMessages[error.constraint_name] || `Invalid row violates ${error.constraint_name} constraint`,
      postgresMessage: error.message,
      code: error.code,
      detail: error.detail,
      schema_name: error.schema_name,
      table_name: error.table_name,
      constraint_name: error.constraint_name,
    });
  }
}

export const PostgresSecuritySchema = Schema.Struct({
  name: Schema.Literal("PostgresError"),
  code: Schema.Literal("42501"),
  message: Schema.String,
});
export type PostgresSecurityError = Schema.Schema.Type<typeof PostgresSecuritySchema>;

export class DatabaseSecurityError extends Data.TaggedError("DatabaseSecurityError")<{
  readonly message: string;
  readonly postgresMessage: string;
  readonly code: string;
}> {
  static fromPostgresError(error: PostgresSecurityError): DatabaseSecurityError {
    const postgresMessages: Record<string, string> = {
      "new row violates row-level security policy for table \"profile_addresses\"": "You do not have permission to add this address to a profile",
      "new row violates row-level security policy for table \"profiles\"": "You do not have permission to modify this profile",
      "new row violates row-level security policy for table \"playlist_info\"": "You do not have permission to create this playlist",
      "new row violates row-level security policy for table \"playlist_inscriptions\"": "You do not have permission to add inscriptions to this playlist",
    };

    return new DatabaseSecurityError({
      message: postgresMessages[error.message] || `You are not authorized to perform this action`,
      postgresMessage: error.message,
      code: error.code,
    });
  }

  static fromNoSuchElementException(action: string): DatabaseSecurityError {
    return new DatabaseSecurityError({
      message: `You do not have permission to ${action}`,
      postgresMessage: "NoSuchElementException",
      code: "42501",
    });
  }
}

export const mapPostgresError = (error: SqlError.SqlError) => Effect.gen(function* () {
  const potentialPostgresError = error.cause;
  const duplicateKeyResult = Schema.decodeUnknownOption(PostgresDuplicateKeySchema)(potentialPostgresError);
  if (Option.isSome(duplicateKeyResult)) {
    return yield* Effect.fail(DatabaseDuplicateKeyError.fromPostgresError(duplicateKeyResult.value));
  }
  const invalidRowResult = Schema.decodeUnknownOption(PostgresInvalidRowSchema)(potentialPostgresError);
  if (Option.isSome(invalidRowResult)) {
    return yield* Effect.fail(DatabaseInvalidRowError.fromPostgresError(invalidRowResult.value));
  }
  const securityResult = Schema.decodeUnknownOption(PostgresSecuritySchema)(potentialPostgresError);
  if (Option.isSome(securityResult)) {
    return yield* Effect.fail(DatabaseSecurityError.fromPostgresError(securityResult.value));
  }
  yield* Effect.logError(`---Unhandled Postgres Error---`, { cause: error.cause });
  return yield* Effect.die(error);
})
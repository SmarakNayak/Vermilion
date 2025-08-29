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
      "playlist_info_user_id_playlist_name_key": "A playlist with this name already exists",
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

export class DatabaseNotFoundError extends Data.TaggedError("DatabaseNotFoundError")<{
  readonly message: string;
  readonly object: string;
  readonly action: 'update' | 'delete' | 'get';
}> {
  static fromNoSuchElementException(object: string, action: 'update' | 'delete' | 'get'): DatabaseNotFoundError {
    if (action === 'update') {
      return new DatabaseNotFoundError({
        message: `This ${object} could not be updated. You may not have permission or it may not exist.`,
        object: object,
        action
      });
    } else if (action === 'delete') {
      return new DatabaseNotFoundError({
        message: `This ${object} could not be deleted. You may not have permission or it may have already been removed.`,
        object: object,
        action
      });
    } else {
      return new DatabaseNotFoundError({
        message: `This ${object} could not be found.`,
        object: object,
        action
      });
    }
  }
  static manuallyCreate(message: string, object: string, action: 'update' | 'delete' | 'get'): DatabaseNotFoundError {
    return new DatabaseNotFoundError({
      message,
      object,
      action
    });
  }
}

interface PostgresErrorOptions {
  readonly handleDuplicateKey: boolean;
  readonly handleInvalidRow: boolean;
  readonly handleSecurity: boolean;
}
type conditionalDuplicate<T extends PostgresErrorOptions> = T['handleDuplicateKey'] extends true ? DatabaseDuplicateKeyError : never;
type conditionalInvalidRow<T extends PostgresErrorOptions> = T['handleInvalidRow'] extends true ? DatabaseInvalidRowError : never;
type conditionalSecurity<T extends PostgresErrorOptions> = T['handleSecurity'] extends true ? DatabaseSecurityError : never;

export const mapPostgresError = <T extends PostgresErrorOptions>(
  options: T
): ((error: SqlError.SqlError) => Effect.Effect<
  never,
  conditionalDuplicate<T> | conditionalInvalidRow<T> | conditionalSecurity<T>,  
  never
>) => {
  return (error: SqlError.SqlError) => {
    const potentialPostgresError = error.cause;
    
    if (options.handleDuplicateKey) {
      const duplicateKeyResult = Schema.decodeUnknownOption(PostgresDuplicateKeySchema)(potentialPostgresError);
      if (Option.isSome(duplicateKeyResult)) {
        return Effect.fail(DatabaseDuplicateKeyError.fromPostgresError(duplicateKeyResult.value)) as Effect.Effect<never, conditionalDuplicate<T> , never>;
      }
    }
    
    if (options.handleInvalidRow) {
      const invalidRowResult = Schema.decodeUnknownOption(PostgresInvalidRowSchema)(potentialPostgresError);
      if (Option.isSome(invalidRowResult)) {
        return Effect.fail(DatabaseInvalidRowError.fromPostgresError(invalidRowResult.value)) as Effect.Effect<never, conditionalInvalidRow<T> , never>;
      }
    }
    
    if (options.handleSecurity) {
      const securityResult = Schema.decodeUnknownOption(PostgresSecuritySchema)(potentialPostgresError);
      if (Option.isSome(securityResult)) {
        return Effect.fail(DatabaseSecurityError.fromPostgresError(securityResult.value)) as Effect.Effect<never, conditionalSecurity<T> , never>;
      }
    }
    
    return Effect.gen(function* () {
      yield* Effect.logError(`---Unhandled Postgres Error---`, { cause: error.cause });
      return yield* Effect.die(error);
    });
  };
};

// Backwards compatibility functions
export const mapPostgresInsertError = mapPostgresError({
  handleDuplicateKey: true,
  handleInvalidRow: true,
  handleSecurity: true
});

// Security errors and duplicate key errors do not occur during **most** updates, so they are not handled here.
export const mapPostgresUpdateError = mapPostgresError({
  handleDuplicateKey: false,
  handleInvalidRow: true,
  handleSecurity: false,
});
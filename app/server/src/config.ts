import { Data, Effect, Schema } from "effect";
import { parse } from "yaml";

const AppConfigSchema = Schema.Struct({
  db_host: Schema.String,
  db_name: Schema.String,
  db_user: Schema.String,
  db_password: Schema.String,
});
type AppConfig = Schema.Schema.Type<typeof AppConfigSchema>;

class YamlConfigError extends Data.TaggedError("YamlConfigError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export class ConfigService extends Effect.Service<ConfigService>()("ConfigService", {
  effect: Effect.gen(function* () {

    const configFile = yield* Effect.try({
      try: () => Bun.file(`${process.env.HOME}/ord.yaml`),
      catch: (error) => new YamlConfigError({ message: `Failed to load config file: ${error}`, cause: error }),
    })
    const configText = yield* Effect.tryPromise({
      try: () => configFile.text(),
      catch: (error) => new YamlConfigError({ message: `Failed to read config file: ${error}`, cause: error }),
    });
    const rawConfig = yield* Effect.try({
      try: () => parse(configText),
      catch: (error) => new YamlConfigError({ message: `Failed to parse config file: ${error}`, cause: error }),
    });
    const config: AppConfig = yield* Schema.decodeUnknown(AppConfigSchema)(rawConfig)
      .pipe(
        Effect.mapError((error) => new YamlConfigError({ message: `Config does not match schema: ${error}`, cause: error })),
      );
    yield* Effect.log(`Loaded config: ${JSON.stringify(config)}`);
    return config;
  })
}) {};
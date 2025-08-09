import { Schema } from "effect"
import * as VariantSchema from "@effect/experimental/VariantSchema"

const {
  Class,
  Field,
  FieldExcept,
  FieldOnly,
  Struct,
  Union,
  extract,
  fieldEvolve,
  fieldFromKey
} = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select"
})
export type VariantsDatabase = "select" | "insert" | "update"

/**
 * Convert a field to one that is optional for all variants.
 *
 * For the database variants, it will accept `null`able values.
 * For the JSON variants, it will also accept missing keys.
 *
 * @since 1.0.0
 * @category optional
 */
export interface FieldOption<S extends Schema.Schema.Any> extends
  VariantSchema.Field<{
    readonly select: Schema.OptionFromNullOr<S>
    readonly insert: Schema.OptionFromNullOr<S>
    readonly update: Schema.OptionFromNullOr<S>
    readonly json: Schema.optionalWith<S, { as: "Option" }>
    readonly jsonCreate: Schema.optionalWith<S, { as: "Option"; nullable: true }>
    readonly jsonUpdate: Schema.optionalWith<S, { as: "Option"; nullable: true }>
  }>
{}

/**
 * Convert a field to one that is optional for all variants.
 *
 * For the database variants, it will accept `null`able values.
 * For the JSON variants, it will also accept missing keys.
 *
 * @since 1.0.0
 * @category optional
 */
export const FieldOption: <Field extends VariantSchema.Field<any> | Schema.Schema.Any>(
  self: Field
) => Field extends Schema.Schema.Any ? FieldOption<Field>
  : Field extends VariantSchema.Field<infer S> ? VariantSchema.Field<
      {
        readonly [K in keyof S]: S[K] extends Schema.Schema.Any
          ? K extends VariantsDatabase ? Schema.OptionFromNullOr<S[K]> :
          Schema.optionalWith<S[K], { as: "Option"; nullable: true }>
          : never
      }
    > :
  never = fieldEvolve({
    select: Schema.OptionFromNullOr,
    insert: Schema.OptionFromNullOr,
    update: Schema.OptionFromNullOr,
    json: Schema.optionalWith({ as: "Option" }),
    jsonCreate: Schema.optionalWith({ as: "Option", nullable: true }),
    jsonUpdate: Schema.optionalWith({ as: "Option", nullable: true })
  }) as any
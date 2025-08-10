import { Schema } from "effect"
import * as VariantSchema from "@effect/experimental/VariantSchema"

const {
  Field,
} = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select"
})

/**
 * Convert a field to one that is optional for all variants, and omittable for the create/insert/update variants.
 *
 * For the database create/insert/update variants, it will convert options into nulls, and omit the field if key is missing.
 * For the select/json variants, the field is required and database nulls will be encoded as Option.none() which will be encoded as json nulls.
 *
 * @since 1.0.0
 * @category optional
 */
export interface FieldOptionOmittable<S extends Schema.Schema.Any>  extends
  VariantSchema.Field<{
    readonly select: Schema.OptionFromNullOr<S>
    readonly insert: Schema.optionalWith<Schema.OptionFromNullOr<S>, { exact: true }>
    readonly update: Schema.optionalWith<Schema.OptionFromNullOr<S>, { exact: true }>
    readonly json: Schema.OptionFromNullOr<S>
    readonly jsonCreate: Schema.optionalWith<Schema.OptionFromNullOr<S>, { exact: true }>
    readonly jsonUpdate: Schema.optionalWith<Schema.OptionFromNullOr<S>, { exact: true }>
  }>
{}

/**
 * Convert a field to one that is optional for all variants, and omittable for the create/insert/update variants.
 *
 * For the database create/insert/update variants, it will convert options into nulls, and omit the field if key is missing.
 * For the select/json variants, the field is required and database nulls will be encoded as Option.none() which will be encoded as json nulls.
 *
 * @since 1.0.0
 * @category optional
 */
export const FieldOptionOmittable = <S extends Schema.Schema.Any>(schema: S): FieldOptionOmittable<S> => (
  Field({
    select: Schema.OptionFromNullOr(schema),
    insert: Schema.optionalWith(Schema.OptionFromNullOr(schema), { exact: true }),
    update: Schema.optionalWith(Schema.OptionFromNullOr(schema), { exact: true }),
    json: Schema.OptionFromNullOr(schema),
    jsonCreate: Schema.optionalWith(Schema.OptionFromNullOr(schema), { exact: true }),
    jsonUpdate: Schema.optionalWith(Schema.OptionFromNullOr(schema), { exact: true }),
  })
)
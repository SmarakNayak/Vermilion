import { Schema } from "effect"
import * as VariantSchema from "@effect/experimental/VariantSchema"

const {
  Field,
} = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select"
})

/**
 * Make a field an Option for all variants, and omittable on write variants.
 *
 * Behavior by variant:
 * - select, json: required key; value is Option decoded from `S | null`
 * - insert, update, jsonCreate, jsonUpdate: key is omittable; when present, value is Option decoded from `S | null`
 *
 * Use this when a column may be null/absent but clients shouldn't be forced
 * to send the key on create/update requests.
 * - On update/jsonUpdate: missing key means "do not modify this field".
 * - On insert/jsonCreate: missing key lets defaults or DB behavior apply.
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
 * Make a field an Option for all variants, and omittable on write variants.
 *
 * Behavior by variant:
 * - select, json: required key; value is Option decoded from `S | null`
 * - insert, update, jsonCreate, jsonUpdate: key is omittable; when present, value is Option decoded from `S | null`
 *
 * Use this when a column may be null/absent but clients shouldn't be forced
 * to send the key on create/update requests.
 * - On update/jsonUpdate: missing key means "do not modify this field".
 * - On insert/jsonCreate: missing key lets defaults or DB behavior apply.
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

/**
 * Make a field required everywhere except on update variants.
 *
 * Behavior by variant:
 * - select, insert, json, jsonCreate: required
 * - update, jsonUpdate: key is omittable (missing key allowed; when present, must satisfy `S`)
 * - When the key is missing, it will not be included in the update.
 * @since 1.0.0
 * @category optional
 */
export interface FieldUpdateOmittable<S extends Schema.Schema.Any> extends
  VariantSchema.Field<{
    readonly select: S
    readonly insert: S
    readonly update: Schema.optionalWith<S, { exact: true }>
    readonly json: S
    readonly jsonCreate: S
    readonly jsonUpdate: Schema.optionalWith<S, { exact: true }>
  }>
{}

/**
 * Make a field required everywhere except on update variants.
 *
 * Behavior by variant:
 * - select, insert, json, jsonCreate: required
 * - update, jsonUpdate: key is omittable (missing key allowed; when present, must satisfy `S`)
 * - When the key is missing, it will not be included in the update.
 * @since 1.0.0
 * @category optional
 */
export const FieldUpdateOmittable = <S extends Schema.Schema.Any>(schema: S): FieldUpdateOmittable<S> => (
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalWith(schema, { exact: true }),
    json: schema,
    jsonCreate: schema,
    jsonUpdate: Schema.optionalWith(schema, { exact: true }),
  })
)
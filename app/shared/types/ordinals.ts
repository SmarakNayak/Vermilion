  import { Schema } from 'effect';

  export const FullOrdinalMetadataSchema = Schema.Struct({
    sequence_number: Schema.BigInt,
    id: Schema.String,
    content_length: Schema.NullOr(Schema.BigInt),
    content_type: Schema.NullOr(Schema.String),
    content_encoding: Schema.NullOr(Schema.String),
    content_category: Schema.String,
    genesis_fee: Schema.BigInt,
    genesis_height: Schema.BigInt,
    genesis_transaction: Schema.String,
    pointer: Schema.NullOr(Schema.BigInt),
    number: Schema.BigInt,
    parents: Schema.Array(Schema.String),
    on_chain_collection_id: Schema.NullOr(Schema.String),
    delegate: Schema.NullOr(Schema.String),
    delegate_content_type: Schema.NullOr(Schema.String),
    metaprotocol: Schema.NullOr(Schema.String),
    on_chain_metadata: Schema.Unknown, // serde_json::Value equivalent
    sat: Schema.NullOr(Schema.BigInt),
    sat_block: Schema.NullOr(Schema.BigInt),
    satributes: Schema.Array(Schema.String),
    charms: Schema.Array(Schema.String),
    timestamp: Schema.BigInt,
    sha256: Schema.NullOr(Schema.String),
    text: Schema.NullOr(Schema.String),
    referenced_ids: Schema.Array(Schema.String),
    is_json: Schema.Boolean,
    is_maybe_json: Schema.Boolean,
    is_bitmap_style: Schema.Boolean,
    is_recursive: Schema.Boolean,
    spaced_rune: Schema.NullOr(Schema.String),
    raw_properties: Schema.Unknown, // serde_json::Value equivalent
    inscribed_by_address: Schema.NullOr(Schema.String),
    collection_symbol: Schema.NullOr(Schema.String),
    off_chain_metadata: Schema.NullOr(Schema.Unknown), // Option<serde_json::Value>
    collection_name: Schema.NullOr(Schema.String)
  });
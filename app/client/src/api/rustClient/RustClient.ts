import type * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientError from "@effect/platform/HttpClientError"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import type { ParseError } from "effect/ParseResult"
import * as S from "effect/Schema"

export class RandomInscriptionsParams extends S.Struct({
  /**
* Number parameter for pagination or limiting results
*/
"n": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true })
}) {}

export class FullMetadata extends S.Class<FullMetadata>("FullMetadata")({
  "sequence_number": S.Int,
  "id": S.String,
  "content_length": S.optionalWith(S.Int, { nullable: true }),
  "content_type": S.optionalWith(S.String, { nullable: true }),
  "content_encoding": S.optionalWith(S.String, { nullable: true }),
  "content_category": S.String,
  "genesis_fee": S.Int,
  "genesis_height": S.Int,
  "genesis_transaction": S.String,
  "pointer": S.optionalWith(S.Int, { nullable: true }),
  "number": S.Int,
  "parents": S.Array(S.String),
  "on_chain_collection_id": S.optionalWith(S.String, { nullable: true }),
  "delegate": S.optionalWith(S.String, { nullable: true }),
  "delegate_content_type": S.optionalWith(S.String, { nullable: true }),
  "metaprotocol": S.optionalWith(S.String, { nullable: true }),
  "on_chain_metadata": S.Unknown,
  "sat": S.optionalWith(S.Int, { nullable: true }),
  "sat_block": S.optionalWith(S.Int, { nullable: true }),
  "satributes": S.Array(S.String),
  "charms": S.Array(S.String),
  "timestamp": S.Int,
  "sha256": S.optionalWith(S.String, { nullable: true }),
  "text": S.optionalWith(S.String, { nullable: true }),
  "referenced_ids": S.Array(S.String),
  "is_json": S.Boolean,
  "is_maybe_json": S.Boolean,
  "is_bitmap_style": S.Boolean,
  "is_recursive": S.Boolean,
  "spaced_rune": S.optionalWith(S.String, { nullable: true }),
  "inscribed_by_address": S.optionalWith(S.String, { nullable: true }),
  "collection_symbol": S.optionalWith(S.String, { nullable: true }),
  "collection_name": S.optionalWith(S.String, { nullable: true })
}) {}

export class RandomInscriptions200 extends S.Array(FullMetadata) {}

export class RandomInscriptions400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class RandomInscriptions404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class RandomInscriptions500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class TrendingFeedParams extends S.Struct({
  /**
* Number parameter for pagination or limiting results
*/
"n": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true })
}) {}

export class TrendingItemActivity extends S.Class<TrendingItemActivity>("TrendingItemActivity")({
  "ids": S.Array(S.String),
  "block_age": S.Int,
  "most_recent_timestamp": S.Int,
  "children_count": S.Int,
  "delegate_count": S.Int,
  "comment_count": S.Int,
  "band_start": S.Number,
  "band_end": S.Number,
  "band_id": S.Int
}) {}

export class TrendingItem extends S.Class<TrendingItem>("TrendingItem")({
  "activity": TrendingItemActivity,
  "inscriptions": S.Array(FullMetadata)
}) {}

export class TrendingFeed200 extends S.Array(TrendingItem) {}

export class TrendingFeed400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class TrendingFeed404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class TrendingFeed500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class DiscoverFeedParams extends S.Struct({
  /**
* Number parameter for pagination or limiting results
*/
"n": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true })
}) {}

export class DiscoverItemActivity extends S.Class<DiscoverItemActivity>("DiscoverItemActivity")({
  "ids": S.Array(S.String),
  "block_age": S.Int,
  "most_recent_timestamp": S.Int,
  "children_count": S.Int,
  "delegate_count": S.Int,
  "comment_count": S.Int,
  "edition_count": S.Int,
  "band_start": S.Number,
  "band_end": S.Number,
  "class_band_start": S.Number,
  "class_band_end": S.Number
}) {}

export class DiscoverItem extends S.Class<DiscoverItem>("DiscoverItem")({
  "activity": DiscoverItemActivity,
  "inscriptions": S.Array(FullMetadata)
}) {}

export class DiscoverFeed200 extends S.Array(DiscoverItem) {}

export class DiscoverFeed400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class DiscoverFeed404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class DiscoverFeed500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionInscriptionId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionInscriptionId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionInscriptionId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionNumberNumber400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionNumberNumber404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionNumberNumber500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionSha256Sha256400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionSha256Sha256404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionSha256Sha256500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionMetadataInscriptionId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionMetadataInscriptionId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionMetadataInscriptionId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionMetadataNumberNumber400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionMetadataNumberNumber404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionMetadataNumberNumber500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionNumberEdition extends S.Class<InscriptionNumberEdition>("InscriptionNumberEdition")({
  "id": S.String,
  "number": S.Int,
  "edition": S.Int,
  "total": S.Int
}) {}

export class InscriptionEditionInscriptionId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionEditionInscriptionId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionEditionInscriptionId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionEditionNumberNumber400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionEditionNumberNumber404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionEditionNumberNumber500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionEditionsSha256Sha256Params extends S.Struct({
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class InscriptionEditionsSha256Sha256200 extends S.Array(InscriptionNumberEdition) {}

export class InscriptionEditionsSha256Sha256400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionEditionsSha256Sha256404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionEditionsSha256Sha256500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class ContentType extends S.Literal("text", "image", "gif", "audio", "video", "html", "json", "namespace", "javascript") {}

export class SatributeType extends S.Literal("vintage", "nakamoto", "firsttransaction", "palindrome", "pizza", "block9", "block9_450", "block78", "alpha", "omega", "uniform_palinception", "perfect_palinception", "block286", "jpeg", "uncommon", "rare", "epic", "legendary", "mythic", "black_uncommon", "black_rare", "black_epic", "black_legendary") {}

export class CharmType extends S.Literal("coin", "cursed", "epic", "legendary", "lost", "nineball", "rare", "reinscription", "unbound", "uncommon", "vindicated") {}

export class InscriptionSortBy extends S.Literal("newest", "oldest", "newest_sat", "oldest_sat", "rarest_sat", "commonest_sat", "biggest", "smallest", "highest_fee", "lowest_fee") {}

export class InscriptionChildrenInscriptionIdParams extends S.Struct({
  /**
* Content types to filter inscriptions by
*/
"content_types": S.optionalWith(S.Array(ContentType), { nullable: true, default: () => [] as const }),
  /**
* Satributes to filter inscriptions by
*/
"satributes": S.optionalWith(S.Array(SatributeType), { nullable: true, default: () => [] as const }),
  /**
* Charms to filter inscriptions by
*/
"charms": S.optionalWith(S.Array(CharmType), { nullable: true, default: () => [] as const }),
  /**
* Sort order for inscription results
*/
"sort_by": S.optionalWith(InscriptionSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class InscriptionChildrenInscriptionId200 extends S.Array(FullMetadata) {}

export class InscriptionChildrenInscriptionId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionChildrenInscriptionId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionChildrenInscriptionId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionChildrenNumberNumberParams extends S.Struct({
  /**
* Content types to filter inscriptions by
*/
"content_types": S.optionalWith(S.Array(ContentType), { nullable: true, default: () => [] as const }),
  /**
* Satributes to filter inscriptions by
*/
"satributes": S.optionalWith(S.Array(SatributeType), { nullable: true, default: () => [] as const }),
  /**
* Charms to filter inscriptions by
*/
"charms": S.optionalWith(S.Array(CharmType), { nullable: true, default: () => [] as const }),
  /**
* Sort order for inscription results
*/
"sort_by": S.optionalWith(InscriptionSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class InscriptionChildrenNumberNumber200 extends S.Array(FullMetadata) {}

export class InscriptionChildrenNumberNumber400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionChildrenNumberNumber404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionChildrenNumberNumber500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionReferencedByInscriptionIdParams extends S.Struct({
  /**
* Content types to filter inscriptions by
*/
"content_types": S.optionalWith(S.Array(ContentType), { nullable: true, default: () => [] as const }),
  /**
* Satributes to filter inscriptions by
*/
"satributes": S.optionalWith(S.Array(SatributeType), { nullable: true, default: () => [] as const }),
  /**
* Charms to filter inscriptions by
*/
"charms": S.optionalWith(S.Array(CharmType), { nullable: true, default: () => [] as const }),
  /**
* Sort order for inscription results
*/
"sort_by": S.optionalWith(InscriptionSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class InscriptionReferencedByInscriptionId200 extends S.Array(FullMetadata) {}

export class InscriptionReferencedByInscriptionId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionReferencedByInscriptionId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionReferencedByInscriptionId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionReferencedByNumberNumberParams extends S.Struct({
  /**
* Content types to filter inscriptions by
*/
"content_types": S.optionalWith(S.Array(ContentType), { nullable: true, default: () => [] as const }),
  /**
* Satributes to filter inscriptions by
*/
"satributes": S.optionalWith(S.Array(SatributeType), { nullable: true, default: () => [] as const }),
  /**
* Charms to filter inscriptions by
*/
"charms": S.optionalWith(S.Array(CharmType), { nullable: true, default: () => [] as const }),
  /**
* Sort order for inscription results
*/
"sort_by": S.optionalWith(InscriptionSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class InscriptionReferencedByNumberNumber200 extends S.Array(FullMetadata) {}

export class InscriptionReferencedByNumberNumber400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionReferencedByNumberNumber404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionReferencedByNumberNumber500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionBootlegsInscriptionIdParams extends S.Struct({
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class BootlegEdition extends S.Class<BootlegEdition>("BootlegEdition")({
  "delegate_id": S.String,
  "bootleg_id": S.String,
  "bootleg_number": S.Int,
  "bootleg_sequence_number": S.Int,
  "bootleg_edition": S.Int,
  "total": S.Int,
  "address": S.String,
  "block_timestamp": S.Int,
  "block_number": S.Int
}) {}

export class InscriptionBootlegsInscriptionId200 extends S.Array(BootlegEdition) {}

export class InscriptionBootlegsInscriptionId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionBootlegsInscriptionId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionBootlegsInscriptionId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionBootlegsNumberNumberParams extends S.Struct({
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class InscriptionBootlegsNumberNumber200 extends S.Array(BootlegEdition) {}

export class InscriptionBootlegsNumberNumber400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionBootlegsNumberNumber404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionBootlegsNumberNumber500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BootlegEditionInscriptionId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BootlegEditionInscriptionId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BootlegEditionInscriptionId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BootlegEditionNumberNumber400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BootlegEditionNumberNumber404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BootlegEditionNumberNumber500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionCommentsInscriptionIdParams extends S.Struct({
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class CommentEdition extends S.Class<CommentEdition>("CommentEdition")({
  "delegate_id": S.String,
  "comment_id": S.String,
  "comment_number": S.Int,
  "comment_sequence_number": S.Int,
  "comment_edition": S.Int,
  "total": S.Int,
  "address": S.String,
  "block_timestamp": S.Int,
  "block_number": S.Int
}) {}

export class InscriptionCommentsInscriptionId200 extends S.Array(CommentEdition) {}

export class InscriptionCommentsInscriptionId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionCommentsInscriptionId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionCommentsInscriptionId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionCommentsNumberNumberParams extends S.Struct({
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class InscriptionCommentsNumberNumber200 extends S.Array(CommentEdition) {}

export class InscriptionCommentsNumberNumber400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionCommentsNumberNumber404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionCommentsNumberNumber500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CommentInscriptionId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CommentInscriptionId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CommentInscriptionId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CommentNumberNumber400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CommentNumberNumber404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CommentNumberNumber500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SatributeEdition extends S.Class<SatributeEdition>("SatributeEdition")({
  "satribute": S.String,
  "sat": S.Int,
  "inscription_id": S.String,
  "inscription_number": S.Int,
  "inscription_sequence_number": S.Int,
  "satribute_edition": S.Int,
  "total": S.Int
}) {}

export class InscriptionSatributeEditionsInscriptionId200 extends S.Array(SatributeEdition) {}

export class InscriptionSatributeEditionsInscriptionId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionSatributeEditionsInscriptionId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionSatributeEditionsInscriptionId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionSatributeEditionsNumberNumber200 extends S.Array(SatributeEdition) {}

export class InscriptionSatributeEditionsNumberNumber400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionSatributeEditionsNumberNumber404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionSatributeEditionsNumberNumber500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInBlockBlockParams extends S.Struct({
  /**
* Content types to filter inscriptions by
*/
"content_types": S.optionalWith(S.Array(ContentType), { nullable: true, default: () => [] as const }),
  /**
* Satributes to filter inscriptions by
*/
"satributes": S.optionalWith(S.Array(SatributeType), { nullable: true, default: () => [] as const }),
  /**
* Charms to filter inscriptions by
*/
"charms": S.optionalWith(S.Array(CharmType), { nullable: true, default: () => [] as const }),
  /**
* Sort order for inscription results
*/
"sort_by": S.optionalWith(InscriptionSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class InscriptionsInBlockBlock200 extends S.Array(FullMetadata) {}

export class InscriptionsInBlockBlock400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInBlockBlock404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInBlockBlock500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsParams extends S.Struct({
  /**
* Content types to filter inscriptions by
*/
"content_types": S.optionalWith(S.Array(ContentType), { nullable: true, default: () => [] as const }),
  /**
* Satributes to filter inscriptions by
*/
"satributes": S.optionalWith(S.Array(SatributeType), { nullable: true, default: () => [] as const }),
  /**
* Charms to filter inscriptions by
*/
"charms": S.optionalWith(S.Array(CharmType), { nullable: true, default: () => [] as const }),
  /**
* Sort order for inscription results
*/
"sort_by": S.optionalWith(InscriptionSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class Inscriptions200 extends S.Array(FullMetadata) {}

export class Inscriptions400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class Inscriptions404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class Inscriptions500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class RandomInscription400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class RandomInscription404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class RandomInscription500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class RecentInscriptionsParams extends S.Struct({
  /**
* Number parameter for pagination or limiting results
*/
"n": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true })
}) {}

export class RecentInscriptions200 extends S.Array(FullMetadata) {}

export class RecentInscriptions400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class RecentInscriptions404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class RecentInscriptions500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class RecentBoostsParams extends S.Struct({
  /**
* Number parameter for pagination or limiting results
*/
"n": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true })
}) {}

export class BoostFullMetadata extends S.Class<BoostFullMetadata>("BoostFullMetadata")({
  "sequence_number": S.Int,
  "id": S.String,
  "content_length": S.optionalWith(S.Int, { nullable: true }),
  "content_type": S.optionalWith(S.String, { nullable: true }),
  "content_encoding": S.optionalWith(S.String, { nullable: true }),
  "content_category": S.String,
  "genesis_fee": S.Int,
  "genesis_height": S.Int,
  "genesis_transaction": S.String,
  "pointer": S.optionalWith(S.Int, { nullable: true }),
  "number": S.Int,
  "parents": S.Array(S.String),
  "on_chain_collection_id": S.optionalWith(S.String, { nullable: true }),
  "delegate": S.optionalWith(S.String, { nullable: true }),
  "delegate_content_type": S.optionalWith(S.String, { nullable: true }),
  "metaprotocol": S.optionalWith(S.String, { nullable: true }),
  "on_chain_metadata": S.Unknown,
  "sat": S.optionalWith(S.Int, { nullable: true }),
  "sat_block": S.optionalWith(S.Int, { nullable: true }),
  "satributes": S.Array(S.String),
  "charms": S.Array(S.String),
  "timestamp": S.Int,
  "sha256": S.optionalWith(S.String, { nullable: true }),
  "text": S.optionalWith(S.String, { nullable: true }),
  "referenced_ids": S.Array(S.String),
  "is_json": S.Boolean,
  "is_maybe_json": S.Boolean,
  "is_bitmap_style": S.Boolean,
  "is_recursive": S.Boolean,
  "spaced_rune": S.optionalWith(S.String, { nullable: true }),
  "inscribed_by_address": S.optionalWith(S.String, { nullable: true }),
  "collection_symbol": S.optionalWith(S.String, { nullable: true }),
  "collection_name": S.optionalWith(S.String, { nullable: true }),
  "address": S.optionalWith(S.String, { nullable: true }),
  "bootleg_edition": S.optionalWith(S.Int, { nullable: true })
}) {}

export class RecentBoosts200 extends S.Array(BoostFullMetadata) {}

export class RecentBoosts400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class RecentBoosts404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class RecentBoosts500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class LeaderboardEntry extends S.Class<LeaderboardEntry>("LeaderboardEntry")({
  "address": S.String,
  "count": S.Int
}) {}

export class BoostLeaderboard200 extends S.Array(LeaderboardEntry) {}

export class BoostLeaderboard400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BoostLeaderboard404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BoostLeaderboard500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class Transfer extends S.Class<Transfer>("Transfer")({
  "id": S.String,
  "block_number": S.Int,
  "block_timestamp": S.Int,
  "satpoint": S.String,
  "tx_offset": S.Int,
  "transaction": S.String,
  "vout": S.Int,
  "offset": S.Int,
  "address": S.String,
  "previous_address": S.String,
  "price": S.Int,
  "tx_fee": S.Int,
  "tx_size": S.Int,
  "is_genesis": S.Boolean
}) {}

export class InscriptionLastTransferInscriptionId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionLastTransferInscriptionId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionLastTransferInscriptionId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionLastTransferNumberNumber400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionLastTransferNumberNumber404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionLastTransferNumberNumber500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionTransfersInscriptionId200 extends S.Array(Transfer) {}

export class InscriptionTransfersInscriptionId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionTransfersInscriptionId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionTransfersInscriptionId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionTransfersNumberNumber200 extends S.Array(Transfer) {}

export class InscriptionTransfersNumberNumber400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionTransfersNumberNumber404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionTransfersNumberNumber500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInAddressAddressParams extends S.Struct({
  /**
* Content types to filter inscriptions by
*/
"content_types": S.optionalWith(S.Array(ContentType), { nullable: true, default: () => [] as const }),
  /**
* Satributes to filter inscriptions by
*/
"satributes": S.optionalWith(S.Array(SatributeType), { nullable: true, default: () => [] as const }),
  /**
* Charms to filter inscriptions by
*/
"charms": S.optionalWith(S.Array(CharmType), { nullable: true, default: () => [] as const }),
  /**
* Sort order for inscription results
*/
"sort_by": S.optionalWith(InscriptionSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class InscriptionsInAddressAddress200 extends S.Array(FullMetadata) {}

export class InscriptionsInAddressAddress400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInAddressAddress404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInAddressAddress500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsOnSatSat200 extends S.Array(FullMetadata) {}

export class InscriptionsOnSatSat400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsOnSatSat404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsOnSatSat500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInSatBlockBlockParams extends S.Struct({
  /**
* Content types to filter inscriptions by
*/
"content_types": S.optionalWith(S.Array(ContentType), { nullable: true, default: () => [] as const }),
  /**
* Satributes to filter inscriptions by
*/
"satributes": S.optionalWith(S.Array(SatributeType), { nullable: true, default: () => [] as const }),
  /**
* Charms to filter inscriptions by
*/
"charms": S.optionalWith(S.Array(CharmType), { nullable: true, default: () => [] as const }),
  /**
* Sort order for inscription results
*/
"sort_by": S.optionalWith(InscriptionSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class InscriptionsInSatBlockBlock200 extends S.Array(FullMetadata) {}

export class InscriptionsInSatBlockBlock400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInSatBlockBlock404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInSatBlockBlock500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SatMetadata extends S.Class<SatMetadata>("SatMetadata")({
  "sat": S.Int,
  "satributes": S.Array(S.String),
  "decimal": S.String,
  "degree": S.String,
  "name": S.String,
  "block": S.Int,
  "cycle": S.Int,
  "epoch": S.Int,
  "period": S.Int,
  "third": S.Int,
  "rarity": S.String,
  "percentile": S.String,
  "timestamp": S.Int
}) {}

export class SatMetadataSat400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SatMetadataSat404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SatMetadataSat500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class Satribute extends S.Class<Satribute>("Satribute")({
  "sat": S.Int,
  "satribute": S.String
}) {}

export class SatributesSat200 extends S.Array(Satribute) {}

export class SatributesSat400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SatributesSat404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SatributesSat500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionCollectionData extends S.Class<InscriptionCollectionData>("InscriptionCollectionData")({
  "description": S.optionalWith(S.String, { nullable: true }),
  "id": S.String,
  "number": S.Int,
  "collection_symbol": S.String,
  "name": S.optionalWith(S.String, { nullable: true }),
  "image_uri": S.optionalWith(S.String, { nullable: true }),
  "inscription_icon": S.optionalWith(S.String, { nullable: true }),
  "supply": S.optionalWith(S.Int, { nullable: true }),
  "twitter": S.optionalWith(S.String, { nullable: true }),
  "discord": S.optionalWith(S.String, { nullable: true }),
  "website": S.optionalWith(S.String, { nullable: true }),
  "min_inscription_number": S.optionalWith(S.Int, { nullable: true }),
  "max_inscription_number": S.optionalWith(S.Int, { nullable: true }),
  "date_created": S.Int
}) {}

export class InscriptionCollectionDataInscriptionId200 extends S.Array(InscriptionCollectionData) {}

export class InscriptionCollectionDataInscriptionId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionCollectionDataInscriptionId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionCollectionDataInscriptionId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionCollectionDataNumberNumber200 extends S.Array(InscriptionCollectionData) {}

export class InscriptionCollectionDataNumberNumber400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionCollectionDataNumberNumber404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionCollectionDataNumberNumber500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CombinedBlockStats extends S.Class<CombinedBlockStats>("CombinedBlockStats")({
  "block_number": S.Int,
  "block_hash": S.optionalWith(S.String, { nullable: true }),
  "block_timestamp": S.optionalWith(S.Int, { nullable: true }),
  "block_tx_count": S.optionalWith(S.Int, { nullable: true }),
  "block_size": S.optionalWith(S.Int, { nullable: true }),
  "block_fees": S.optionalWith(S.Int, { nullable: true }),
  "min_fee": S.optionalWith(S.Int, { nullable: true }),
  "max_fee": S.optionalWith(S.Int, { nullable: true }),
  "average_fee": S.optionalWith(S.Int, { nullable: true }),
  "block_inscription_count": S.optionalWith(S.Int, { nullable: true }),
  "block_inscription_size": S.optionalWith(S.Int, { nullable: true }),
  "block_inscription_fees": S.optionalWith(S.Int, { nullable: true }),
  "block_transfer_count": S.optionalWith(S.Int, { nullable: true }),
  "block_transfer_size": S.optionalWith(S.Int, { nullable: true }),
  "block_transfer_fees": S.optionalWith(S.Int, { nullable: true }),
  "block_volume": S.optionalWith(S.Int, { nullable: true })
}) {}

export class BlockStatisticsBlock400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BlockStatisticsBlock404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BlockStatisticsBlock500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SatBlockStats extends S.Class<SatBlockStats>("SatBlockStats")({
  "sat_block_number": S.Int,
  "sat_block_timestamp": S.optionalWith(S.Int, { nullable: true }),
  "sat_block_inscription_count": S.optionalWith(S.Int, { nullable: true }),
  "sat_block_inscription_size": S.optionalWith(S.Int, { nullable: true }),
  "sat_block_inscription_fees": S.optionalWith(S.Int, { nullable: true })
}) {}

export class SatBlockStatisticsBlock400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SatBlockStatisticsBlock404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SatBlockStatisticsBlock500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BlockSortBy extends S.Literal("newest", "oldest", "most_txs", "least_txs", "most_inscriptions", "least_inscriptions", "biggest_block", "smallest_block", "biggest_total_inscriptions_size", "smallest_total_inscriptions_size", "highest_total_fees", "lowest_total_fees", "highest_inscription_fees", "lowest_inscription_fees", "most_volume", "least_volume") {}

export class BlocksParams extends S.Struct({
  /**
* Sort order for block results
*/
"sort_by": S.optionalWith(BlockSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class Blocks200 extends S.Array(CombinedBlockStats) {}

export class Blocks400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class Blocks404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class Blocks500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CollectionSortBy extends S.Literal("biggest_on_chain_footprint", "smallest_on_chain_footprint", "most_volume", "least_volume", "biggest_file_size", "smallest_file_size", "biggest_creation_fee", "smallest_creation_fee", "earliest_first_inscribed_date", "latest_first_inscribed_date", "earliest_last_inscribed_date", "latest_last_inscribed_date", "biggest_supply", "smallest_supply") {}

export class CollectionsParams extends S.Struct({
  /**
* Sort order for collection results
*/
"sort_by": S.optionalWith(CollectionSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class CollectionSummary extends S.Class<CollectionSummary>("CollectionSummary")({
  "description": S.optionalWith(S.String, { nullable: true }),
  "collection_symbol": S.String,
  "name": S.optionalWith(S.String, { nullable: true }),
  "twitter": S.optionalWith(S.String, { nullable: true }),
  "discord": S.optionalWith(S.String, { nullable: true }),
  "website": S.optionalWith(S.String, { nullable: true }),
  "total_inscription_fees": S.optionalWith(S.Int, { nullable: true }),
  "total_inscription_size": S.optionalWith(S.Int, { nullable: true }),
  "first_inscribed_date": S.optionalWith(S.Int, { nullable: true }),
  "last_inscribed_date": S.optionalWith(S.Int, { nullable: true }),
  "supply": S.optionalWith(S.Int, { nullable: true }),
  "range_start": S.optionalWith(S.Int, { nullable: true }),
  "range_end": S.optionalWith(S.Int, { nullable: true }),
  "total_volume": S.optionalWith(S.Int, { nullable: true }),
  "transfer_fees": S.optionalWith(S.Int, { nullable: true }),
  "transfer_footprint": S.optionalWith(S.Int, { nullable: true }),
  "total_fees": S.optionalWith(S.Int, { nullable: true }),
  "total_on_chain_footprint": S.optionalWith(S.Int, { nullable: true })
}) {}

export class Collections200 extends S.Array(CollectionSummary) {}

export class Collections400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class Collections404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class Collections500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CollectionSummaryCollectionSymbol400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CollectionSummaryCollectionSymbol404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CollectionSummaryCollectionSymbol500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CollectionHoldersCollectionSymbolParams extends S.Struct({
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class CollectionHolders extends S.Class<CollectionHolders>("CollectionHolders")({
  "collection_symbol": S.String,
  "collection_holder_count": S.optionalWith(S.Int, { nullable: true }),
  "address": S.optionalWith(S.String, { nullable: true }),
  "address_count": S.optionalWith(S.Int, { nullable: true })
}) {}

export class CollectionHoldersCollectionSymbol200 extends S.Array(CollectionHolders) {}

export class CollectionHoldersCollectionSymbol400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CollectionHoldersCollectionSymbol404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class CollectionHoldersCollectionSymbol500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInCollectionCollectionSymbolParams extends S.Struct({
  /**
* Content types to filter inscriptions by
*/
"content_types": S.optionalWith(S.Array(ContentType), { nullable: true, default: () => [] as const }),
  /**
* Satributes to filter inscriptions by
*/
"satributes": S.optionalWith(S.Array(SatributeType), { nullable: true, default: () => [] as const }),
  /**
* Charms to filter inscriptions by
*/
"charms": S.optionalWith(S.Array(CharmType), { nullable: true, default: () => [] as const }),
  /**
* Sort order for inscription results
*/
"sort_by": S.optionalWith(InscriptionSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class InscriptionsInCollectionCollectionSymbol200 extends S.Array(FullMetadata) {}

export class InscriptionsInCollectionCollectionSymbol400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInCollectionCollectionSymbol404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInCollectionCollectionSymbol500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class OnChainCollectionsParams extends S.Struct({
  /**
* Sort order for collection results
*/
"sort_by": S.optionalWith(CollectionSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class OnChainCollectionSummary extends S.Class<OnChainCollectionSummary>("OnChainCollectionSummary")({
  "parents": S.Array(S.String),
  "parent_numbers": S.Array(S.Int),
  "total_inscription_fees": S.optionalWith(S.Int, { nullable: true }),
  "total_inscription_size": S.optionalWith(S.Int, { nullable: true }),
  "first_inscribed_date": S.optionalWith(S.Int, { nullable: true }),
  "last_inscribed_date": S.optionalWith(S.Int, { nullable: true }),
  "supply": S.optionalWith(S.Int, { nullable: true }),
  "range_start": S.optionalWith(S.Int, { nullable: true }),
  "range_end": S.optionalWith(S.Int, { nullable: true }),
  "total_volume": S.optionalWith(S.Int, { nullable: true }),
  "transfer_fees": S.optionalWith(S.Int, { nullable: true }),
  "transfer_footprint": S.optionalWith(S.Int, { nullable: true }),
  "total_fees": S.optionalWith(S.Int, { nullable: true }),
  "total_on_chain_footprint": S.optionalWith(S.Int, { nullable: true })
}) {}

export class OnChainCollections200 extends S.Array(OnChainCollectionSummary) {}

export class OnChainCollections400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class OnChainCollections404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class OnChainCollections500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class OnChainCollectionSummaryParents400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class OnChainCollectionSummaryParents404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class OnChainCollectionSummaryParents500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class OnChainCollectionHoldersParentsParams extends S.Struct({
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class OnChainCollectionHolders extends S.Class<OnChainCollectionHolders>("OnChainCollectionHolders")({
  "parents": S.Array(S.String),
  "parent_numbers": S.Array(S.Int),
  "collection_holder_count": S.optionalWith(S.Int, { nullable: true }),
  "address": S.optionalWith(S.String, { nullable: true }),
  "address_count": S.optionalWith(S.Int, { nullable: true })
}) {}

export class OnChainCollectionHoldersParents200 extends S.Array(OnChainCollectionHolders) {}

export class OnChainCollectionHoldersParents400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class OnChainCollectionHoldersParents404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class OnChainCollectionHoldersParents500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInOnChainCollectionParentsParams extends S.Struct({
  /**
* Content types to filter inscriptions by
*/
"content_types": S.optionalWith(S.Array(ContentType), { nullable: true, default: () => [] as const }),
  /**
* Satributes to filter inscriptions by
*/
"satributes": S.optionalWith(S.Array(SatributeType), { nullable: true, default: () => [] as const }),
  /**
* Charms to filter inscriptions by
*/
"charms": S.optionalWith(S.Array(CharmType), { nullable: true, default: () => [] as const }),
  /**
* Sort order for inscription results
*/
"sort_by": S.optionalWith(InscriptionSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class InscriptionsInOnChainCollectionParents200 extends S.Array(FullMetadata) {}

export class InscriptionsInOnChainCollectionParents400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInOnChainCollectionParents404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInOnChainCollectionParents500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GallerySortBy extends S.Literal("biggest_on_chain_footprint", "smallest_on_chain_footprint", "most_volume", "least_volume", "biggest_file_size", "smallest_file_size", "biggest_creation_fee", "smallest_creation_fee", "earliest_first_inscribed_date", "latest_first_inscribed_date", "earliest_last_inscribed_date", "latest_last_inscribed_date", "biggest_supply", "smallest_supply", "most_boosts", "least_boosts", "newest", "oldest") {}

export class GalleryInscriptionsParams extends S.Struct({
  /**
* Sort order for gallery results
*/
"sort_by": S.optionalWith(GallerySortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class GalleryInscriptions200 extends S.Array(FullMetadata) {}

export class GalleryInscriptions400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GalleryInscriptions404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GalleryInscriptions500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GalleriesSummaryParams extends S.Struct({
  /**
* Sort order for gallery results
*/
"sort_by": S.optionalWith(GallerySortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class GallerySummary extends S.Class<GallerySummary>("GallerySummary")({
  "gallery_id": S.String,
  "total_inscription_fees": S.optionalWith(S.Int, { nullable: true }),
  "total_inscription_size": S.optionalWith(S.Int, { nullable: true }),
  "first_inscribed_date": S.optionalWith(S.Int, { nullable: true }),
  "last_inscribed_date": S.optionalWith(S.Int, { nullable: true }),
  "gallery_inscribed_date": S.optionalWith(S.Int, { nullable: true }),
  "supply": S.optionalWith(S.Int, { nullable: true }),
  "range_start": S.optionalWith(S.Int, { nullable: true }),
  "range_end": S.optionalWith(S.Int, { nullable: true }),
  "total_volume": S.optionalWith(S.Int, { nullable: true }),
  "transfer_fees": S.optionalWith(S.Int, { nullable: true }),
  "transfer_footprint": S.optionalWith(S.Int, { nullable: true }),
  "total_fees": S.optionalWith(S.Int, { nullable: true }),
  "total_on_chain_footprint": S.optionalWith(S.Int, { nullable: true }),
  "boost_count": S.optionalWith(S.Int, { nullable: true })
}) {}

export class GalleriesSummary200 extends S.Array(GallerySummary) {}

export class GalleriesSummary400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GalleriesSummary404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GalleriesSummary500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GallerySummaryGalleryId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GallerySummaryGalleryId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GallerySummaryGalleryId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GalleryHoldersGalleryIdParams extends S.Struct({
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class GalleryHolders extends S.Class<GalleryHolders>("GalleryHolders")({
  "gallery_id": S.String,
  "gallery_holder_count": S.optionalWith(S.Int, { nullable: true }),
  "address": S.optionalWith(S.String, { nullable: true }),
  "address_count": S.optionalWith(S.Int, { nullable: true })
}) {}

export class GalleryHoldersGalleryId200 extends S.Array(GalleryHolders) {}

export class GalleryHoldersGalleryId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GalleryHoldersGalleryId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GalleryHoldersGalleryId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInGalleryGalleryIdParams extends S.Struct({
  /**
* Content types to filter inscriptions by
*/
"content_types": S.optionalWith(S.Array(ContentType), { nullable: true, default: () => [] as const }),
  /**
* Satributes to filter inscriptions by
*/
"satributes": S.optionalWith(S.Array(SatributeType), { nullable: true, default: () => [] as const }),
  /**
* Charms to filter inscriptions by
*/
"charms": S.optionalWith(S.Array(CharmType), { nullable: true, default: () => [] as const }),
  /**
* Sort order for inscription results
*/
"sort_by": S.optionalWith(InscriptionSortBy, { nullable: true }),
  /**
* Page number for pagination, starting from 0
*/
"page_number": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true }),
  /**
* Number of items per page, maximum 100
*/
"page_size": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(100)), { nullable: true })
}) {}

export class InscriptionsInGalleryGalleryId200 extends S.Array(FullMetadata) {}

export class InscriptionsInGalleryGalleryId400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInGalleryGalleryId404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class InscriptionsInGalleryGalleryId500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SearchResult extends S.Class<SearchResult>("SearchResult")({
  "collections": S.Array(CollectionSummary),
  "inscription": S.optionalWith(FullMetadata, { nullable: true }),
  "address": S.optionalWith(S.String, { nullable: true }),
  "block": S.optionalWith(CombinedBlockStats, { nullable: true }),
  "sat": S.optionalWith(SatMetadata, { nullable: true })
}) {}

export class SearchSearchByQuery400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SearchSearchByQuery404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SearchSearchByQuery500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BlockIconBlock400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BlockIconBlock404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BlockIconBlock500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SatBlockIconBlock400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SatBlockIconBlock404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SatBlockIconBlock500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BlockTransfersBlock200 extends S.Array(Transfer) {}

export class BlockTransfersBlock400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BlockTransfersBlock404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class BlockTransfersBlock500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SubmitPackageRequest extends S.Array(S.String) {}

export class SubmitPackage200 extends S.Array(S.String) {}

export class SubmitPackage400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SubmitPackage404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class SubmitPackage500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GetRawTransactionTxid200 extends S.Struct({
  
}) {}

export class GetRawTransactionTxid400 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GetRawTransactionTxid404 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

export class GetRawTransactionTxid500 extends S.Struct({
  "error": S.String,
  "message": S.String
}) {}

/**
* Contact information for the exposed API.
*/
export class Contact extends S.Class<Contact>("Contact")({
  /**
* The identifying name of the contact person/organization.
*/
"name": S.optionalWith(S.String, { nullable: true }),
  /**
* The URL pointing to the contact information.
*  This MUST be in the format of a URL.
*/
"url": S.optionalWith(S.String, { nullable: true }),
  /**
* The email address of the contact person/organization.
*  This MUST be in the format of an email address.
*/
"email": S.optionalWith(S.String, { nullable: true })
}) {}

/**
* License information for the exposed API.
*/
export class License extends S.Class<License>("License")({
  /**
* REQUIRED. The license name used for the API.
*/
"name": S.String,
  /**
* An [SPDX](https://spdx.org/spdx-specification-21-web-version#h.jxpfx0ykyb60) license expression for the API. The `identifier` field is mutually exclusive of the `url` field.
*/
"identifier": S.optionalWith(S.String, { nullable: true }),
  /**
* A URL to the license used for the API. This MUST be in the form of a
*  URL. The `url` field is mutually exclusive of the `identifier` field.
*/
"url": S.optionalWith(S.String, { nullable: true })
}) {}

/**
* The object provides metadata about the API.
*  The metadata MAY be used by the clients if needed,
*  and MAY be presented in editing or documentation generation tools for
*  convenience.
*/
export class Info extends S.Class<Info>("Info")({
  /**
* REQUIRED. The title of the application.
*/
"title": S.String,
  /**
* A description of the API.
*  CommonMark syntax MAY be used for rich text representation.
*/
"description": S.optionalWith(S.String, { nullable: true }),
  /**
* A short summary of the API.
*/
"summary": S.optionalWith(S.String, { nullable: true }),
  /**
* A URL to the Terms of Service for the API.
*  This MUST be in the format of a URL.
*/
"termsOfService": S.optionalWith(S.String, { nullable: true }),
  /**
* The contact information for the exposed API.
*/
"contact": S.optionalWith(Contact, { nullable: true }),
  /**
* The license information for the exposed API.
*/
"license": S.optionalWith(License, { nullable: true }),
  /**
* REQUIRED. The version of the OpenAPI document (which is distinct from
*  the OpenAPI Specification version or the API implementation version).
*/
"version": S.String
}) {}

/**
* An object representing a Server.
*/
export class Server extends S.Class<Server>("Server")({
  /**
* An optional string describing the host designated
*  by the URL. CommonMark syntax MAY be used for rich
*  text representation.
*/
"description": S.optionalWith(S.String, { nullable: true }),
  /**
* REQUIRED. A URL to the target host.
*  This URL supports Server Variables and MAY be relative,
*  to indicate that the host location is relative to the
*  location where the OpenAPI document is being served.
*  Variable substitutions will be made when a variable
*  is named in {brackets}.
*/
"url": S.String,
  /**
* A map between a variable name and its value.
*  The value is used for substitution in the server's URL template.
*/
"variables": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true })
}) {}

/**
* Holds the relative paths to the individual endpoints and
*  their operations. The path is appended to the URL from the
*  Server Object in order to construct the full URL. The Paths
*  MAY be empty, due to Access Control List (ACL) constraints.
*/
export class Paths extends S.Record({ key: S.String, value: S.Unknown }) {}

/**
* Holds a set of reusable objects for different aspects of the OAS.
*  All objects defined within the components object will have no effect
*  on the API unless they are explicitly referenced from properties
*  outside the components object.
*/
export class Components extends S.Class<Components>("Components")({
  /**
* An object to hold reusable Security Scheme Objects.
*/
"securitySchemes": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  /**
* An object to hold reusable Response Objects.
*/
"responses": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  /**
* An object to hold reusable Parameter Objects.
*/
"parameters": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  /**
* An object to hold reusable Example Objects.
*/
"examples": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  /**
* An object to hold reusable Request Body Objects.
*/
"requestBodies": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  /**
* An object to hold reusable Header Objects.
*/
"headers": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  /**
* An object to hold reusable Schema Objects.
*/
"schemas": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  /**
* An object to hold reusable Link Objects.
*/
"links": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  /**
* An object to hold reusable Callback Objects.
*/
"callbacks": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  /**
* An object to hold reusable Path Item Objects.
*/
"pathItems": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true })
}) {}

/**
* Allows referencing an external resource for extended documentation.
*/
export class ExternalDocumentation extends S.Class<ExternalDocumentation>("ExternalDocumentation")({
  /**
* A description of the target documentation.
*  CommonMark syntax MAY be used for rich text representation.
*/
"description": S.optionalWith(S.String, { nullable: true }),
  /**
* REQUIRED. The URL for the target documentation.
*  This MUST be in the format of a URL.
*/
"url": S.String
}) {}

/**
* Adds metadata to a single tag that is used by the
*  Operation Object. It is not mandatory to have a
*  Tag Object per tag defined in the Operation Object instances.
*/
export class Tag extends S.Class<Tag>("Tag")({
  /**
* A description for the tag.
*  CommonMark syntax MAY be used for rich text representation.
*/
"description": S.optionalWith(S.String, { nullable: true }),
  /**
* REQUIRED. The name of the tag.
*/
"name": S.String,
  /**
* Additional external documentation for this tag.
*/
"externalDocs": S.optionalWith(ExternalDocumentation, { nullable: true })
}) {}

export class OpenApi extends S.Class<OpenApi>("OpenApi")({
  "openapi": S.String,
  /**
* REQUIRED. Provides metadata about the API.
*  The metadata MAY be used by tooling as required.
*/
"info": Info,
  /**
* The default value for the `$schema` keyword within Schema Objects
*  contained within this OAS document. This MUST be in the form of a URI.
*/
"jsonSchemaDialect": S.optionalWith(S.String, { nullable: true }),
  /**
* An array of Server Objects, which provide connectivity information to a
*  target server. If the servers property is not provided, or is an empty
*  array, the default value would be a Server Object with a url value of /.
*/
"servers": S.optionalWith(S.Array(Server), { nullable: true }),
  /**
* The available paths and operations for the API.
*/
"paths": S.optionalWith(Paths, { nullable: true }),
  /**
* The incoming webhooks that MAY be received as part of this API and that
*  the API consumer MAY choose to implement. Closely related to the
*  `callbacks` feature, this section describes requests initiated other
*  than by an API call, for example by an out of band registration. The key
*  name is a unique string to refer to each webhook, while the (optionally
*  referenced) Path Item Object describes a request that may be initiated
*  by the API provider and the expected responses.
*/
"webhooks": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  /**
* An element to hold various schemas for the document.
*/
"components": S.optionalWith(Components, { nullable: true }),
  /**
* A declaration of which security mechanisms can be used across the API.
* 
*  The list of values includes alternative security requirement objects
*  that can be used. Only one of the security requirement objects need to
*  be satisfied to authorize a request. Individual operations can override
*  this definition. Global security settings may be overridden on a
*  per-path basis.
*/
"security": S.optionalWith(S.Array(S.Record({ key: S.String, value: S.Unknown })), { nullable: true }),
  /**
* A list of tags used by the document with additional metadata.
* 
*  The order of the tags can be used to reflect on their order by the
*  parsing tools. Not all tags that are used by the Operation Object
*  must be declared. The tags that are not declared MAY be organized
*  randomly or based on the tool's logic. Each tag name in the list
*  MUST be unique.
*/
"tags": S.optionalWith(S.Array(Tag), { nullable: true }),
  /**
* Additional external documentation.
*/
"externalDocs": S.optionalWith(ExternalDocumentation, { nullable: true })
}) {}

export const make = (
  httpClient: HttpClient.HttpClient, 
  options: {
    readonly transformClient?: ((client: HttpClient.HttpClient) => Effect.Effect<HttpClient.HttpClient>) | undefined
  } = {}
): RustClient => {
  const unexpectedStatus = (response: HttpClientResponse.HttpClientResponse) =>
    Effect.flatMap(
      Effect.orElseSucceed(response.json, () => "Unexpected status code"),
      (description) =>
        Effect.fail(
          new HttpClientError.ResponseError({
            request: response.request,
            response,
            reason: "StatusCode",
            description: typeof description === "string" ? description : JSON.stringify(description),
          }),
        ),
    )
  const withResponse: <A, E>(
    f: (response: HttpClientResponse.HttpClientResponse) => Effect.Effect<A, E>,
  ) => (
    request: HttpClientRequest.HttpClientRequest,
  ) => Effect.Effect<any, any> = options.transformClient
    ? (f) => (request) =>
        Effect.flatMap(
          Effect.flatMap(options.transformClient!(httpClient), (client) =>
            client.execute(request),
          ),
          f,
        )
    : (f) => (request) => Effect.flatMap(httpClient.execute(request), f)
  const decodeSuccess =
    <A, I, R>(schema: S.Schema<A, I, R>) =>
    (response: HttpClientResponse.HttpClientResponse) =>
      HttpClientResponse.schemaBodyJson(schema)(response)
  const decodeError =
    <const Tag extends string, A, I, R>(tag: Tag, schema: S.Schema<A, I, R>) =>
    (response: HttpClientResponse.HttpClientResponse) =>
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(schema)(response),
        (cause) => Effect.fail(RustClientError(tag, cause, response)),
      )
  return {
    httpClient,
    "GET/random_inscriptions": (options) => HttpClientRequest.get(`/random_inscriptions`).pipe(
    HttpClientRequest.setUrlParams({ "n": options?.["n"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(RandomInscriptions200),
      "400": decodeError("RandomInscriptions400", RandomInscriptions400),
      "404": decodeError("RandomInscriptions404", RandomInscriptions404),
      "500": decodeError("RandomInscriptions500", RandomInscriptions500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/trending_feed": (options) => HttpClientRequest.get(`/trending_feed`).pipe(
    HttpClientRequest.setUrlParams({ "n": options?.["n"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(TrendingFeed200),
      "400": decodeError("TrendingFeed400", TrendingFeed400),
      "404": decodeError("TrendingFeed404", TrendingFeed404),
      "500": decodeError("TrendingFeed500", TrendingFeed500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/discover_feed": (options) => HttpClientRequest.get(`/discover_feed`).pipe(
    HttpClientRequest.setUrlParams({ "n": options?.["n"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(DiscoverFeed200),
      "400": decodeError("DiscoverFeed400", DiscoverFeed400),
      "404": decodeError("DiscoverFeed404", DiscoverFeed404),
      "500": decodeError("DiscoverFeed500", DiscoverFeed500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "400": decodeError("InscriptionInscriptionId400", InscriptionInscriptionId400),
      "404": decodeError("InscriptionInscriptionId404", InscriptionInscriptionId404),
      "500": decodeError("InscriptionInscriptionId500", InscriptionInscriptionId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_number/{number}": (number) => HttpClientRequest.get(`/inscription_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "400": decodeError("InscriptionNumberNumber400", InscriptionNumberNumber400),
      "404": decodeError("InscriptionNumberNumber404", InscriptionNumberNumber404),
      "500": decodeError("InscriptionNumberNumber500", InscriptionNumberNumber500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_sha256/{sha256}": (sha256) => HttpClientRequest.get(`/inscription_sha256/${sha256}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "400": decodeError("InscriptionSha256Sha256400", InscriptionSha256Sha256400),
      "404": decodeError("InscriptionSha256Sha256404", InscriptionSha256Sha256404),
      "500": decodeError("InscriptionSha256Sha256500", InscriptionSha256Sha256500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_metadata/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription_metadata/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(FullMetadata),
      "400": decodeError("InscriptionMetadataInscriptionId400", InscriptionMetadataInscriptionId400),
      "404": decodeError("InscriptionMetadataInscriptionId404", InscriptionMetadataInscriptionId404),
      "500": decodeError("InscriptionMetadataInscriptionId500", InscriptionMetadataInscriptionId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_metadata_number/{number}": (number) => HttpClientRequest.get(`/inscription_metadata_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(FullMetadata),
      "400": decodeError("InscriptionMetadataNumberNumber400", InscriptionMetadataNumberNumber400),
      "404": decodeError("InscriptionMetadataNumberNumber404", InscriptionMetadataNumberNumber404),
      "500": decodeError("InscriptionMetadataNumberNumber500", InscriptionMetadataNumberNumber500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_edition/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription_edition/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionNumberEdition),
      "400": decodeError("InscriptionEditionInscriptionId400", InscriptionEditionInscriptionId400),
      "404": decodeError("InscriptionEditionInscriptionId404", InscriptionEditionInscriptionId404),
      "500": decodeError("InscriptionEditionInscriptionId500", InscriptionEditionInscriptionId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_edition_number/{number}": (number) => HttpClientRequest.get(`/inscription_edition_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionNumberEdition),
      "400": decodeError("InscriptionEditionNumberNumber400", InscriptionEditionNumberNumber400),
      "404": decodeError("InscriptionEditionNumberNumber404", InscriptionEditionNumberNumber404),
      "500": decodeError("InscriptionEditionNumberNumber500", InscriptionEditionNumberNumber500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_editions_sha256/{sha256}": (sha256, options) => HttpClientRequest.get(`/inscription_editions_sha256/${sha256}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionEditionsSha256Sha256200),
      "400": decodeError("InscriptionEditionsSha256Sha256400", InscriptionEditionsSha256Sha256400),
      "404": decodeError("InscriptionEditionsSha256Sha256404", InscriptionEditionsSha256Sha256404),
      "500": decodeError("InscriptionEditionsSha256Sha256500", InscriptionEditionsSha256Sha256500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_children/{inscription_id}": (inscriptionId, options) => HttpClientRequest.get(`/inscription_children/${inscriptionId}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionChildrenInscriptionId200),
      "400": decodeError("InscriptionChildrenInscriptionId400", InscriptionChildrenInscriptionId400),
      "404": decodeError("InscriptionChildrenInscriptionId404", InscriptionChildrenInscriptionId404),
      "500": decodeError("InscriptionChildrenInscriptionId500", InscriptionChildrenInscriptionId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_children_number/{number}": (number, options) => HttpClientRequest.get(`/inscription_children_number/${number}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionChildrenNumberNumber200),
      "400": decodeError("InscriptionChildrenNumberNumber400", InscriptionChildrenNumberNumber400),
      "404": decodeError("InscriptionChildrenNumberNumber404", InscriptionChildrenNumberNumber404),
      "500": decodeError("InscriptionChildrenNumberNumber500", InscriptionChildrenNumberNumber500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_referenced_by/{inscription_id}": (inscriptionId, options) => HttpClientRequest.get(`/inscription_referenced_by/${inscriptionId}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionReferencedByInscriptionId200),
      "400": decodeError("InscriptionReferencedByInscriptionId400", InscriptionReferencedByInscriptionId400),
      "404": decodeError("InscriptionReferencedByInscriptionId404", InscriptionReferencedByInscriptionId404),
      "500": decodeError("InscriptionReferencedByInscriptionId500", InscriptionReferencedByInscriptionId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_referenced_by_number/{number}": (number, options) => HttpClientRequest.get(`/inscription_referenced_by_number/${number}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionReferencedByNumberNumber200),
      "400": decodeError("InscriptionReferencedByNumberNumber400", InscriptionReferencedByNumberNumber400),
      "404": decodeError("InscriptionReferencedByNumberNumber404", InscriptionReferencedByNumberNumber404),
      "500": decodeError("InscriptionReferencedByNumberNumber500", InscriptionReferencedByNumberNumber500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_bootlegs/{inscription_id}": (inscriptionId, options) => HttpClientRequest.get(`/inscription_bootlegs/${inscriptionId}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionBootlegsInscriptionId200),
      "400": decodeError("InscriptionBootlegsInscriptionId400", InscriptionBootlegsInscriptionId400),
      "404": decodeError("InscriptionBootlegsInscriptionId404", InscriptionBootlegsInscriptionId404),
      "500": decodeError("InscriptionBootlegsInscriptionId500", InscriptionBootlegsInscriptionId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_bootlegs_number/{number}": (number, options) => HttpClientRequest.get(`/inscription_bootlegs_number/${number}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionBootlegsNumberNumber200),
      "400": decodeError("InscriptionBootlegsNumberNumber400", InscriptionBootlegsNumberNumber400),
      "404": decodeError("InscriptionBootlegsNumberNumber404", InscriptionBootlegsNumberNumber404),
      "500": decodeError("InscriptionBootlegsNumberNumber500", InscriptionBootlegsNumberNumber500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/bootleg_edition/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/bootleg_edition/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(BootlegEdition),
      "400": decodeError("BootlegEditionInscriptionId400", BootlegEditionInscriptionId400),
      "404": decodeError("BootlegEditionInscriptionId404", BootlegEditionInscriptionId404),
      "500": decodeError("BootlegEditionInscriptionId500", BootlegEditionInscriptionId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/bootleg_edition_number/{number}": (number) => HttpClientRequest.get(`/bootleg_edition_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(BootlegEdition),
      "400": decodeError("BootlegEditionNumberNumber400", BootlegEditionNumberNumber400),
      "404": decodeError("BootlegEditionNumberNumber404", BootlegEditionNumberNumber404),
      "500": decodeError("BootlegEditionNumberNumber500", BootlegEditionNumberNumber500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_comments/{inscription_id}": (inscriptionId, options) => HttpClientRequest.get(`/inscription_comments/${inscriptionId}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionCommentsInscriptionId200),
      "400": decodeError("InscriptionCommentsInscriptionId400", InscriptionCommentsInscriptionId400),
      "404": decodeError("InscriptionCommentsInscriptionId404", InscriptionCommentsInscriptionId404),
      "500": decodeError("InscriptionCommentsInscriptionId500", InscriptionCommentsInscriptionId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_comments_number/{number}": (number, options) => HttpClientRequest.get(`/inscription_comments_number/${number}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionCommentsNumberNumber200),
      "400": decodeError("InscriptionCommentsNumberNumber400", InscriptionCommentsNumberNumber400),
      "404": decodeError("InscriptionCommentsNumberNumber404", InscriptionCommentsNumberNumber404),
      "500": decodeError("InscriptionCommentsNumberNumber500", InscriptionCommentsNumberNumber500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/comment/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/comment/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "400": decodeError("CommentInscriptionId400", CommentInscriptionId400),
      "404": decodeError("CommentInscriptionId404", CommentInscriptionId404),
      "500": decodeError("CommentInscriptionId500", CommentInscriptionId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/comment_number/{number}": (number) => HttpClientRequest.get(`/comment_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "400": decodeError("CommentNumberNumber400", CommentNumberNumber400),
      "404": decodeError("CommentNumberNumber404", CommentNumberNumber404),
      "500": decodeError("CommentNumberNumber500", CommentNumberNumber500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_satribute_editions/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription_satribute_editions/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionSatributeEditionsInscriptionId200),
      "400": decodeError("InscriptionSatributeEditionsInscriptionId400", InscriptionSatributeEditionsInscriptionId400),
      "404": decodeError("InscriptionSatributeEditionsInscriptionId404", InscriptionSatributeEditionsInscriptionId404),
      "500": decodeError("InscriptionSatributeEditionsInscriptionId500", InscriptionSatributeEditionsInscriptionId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_satribute_editions_number/{number}": (number) => HttpClientRequest.get(`/inscription_satribute_editions_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionSatributeEditionsNumberNumber200),
      "400": decodeError("InscriptionSatributeEditionsNumberNumber400", InscriptionSatributeEditionsNumberNumber400),
      "404": decodeError("InscriptionSatributeEditionsNumberNumber404", InscriptionSatributeEditionsNumberNumber404),
      "500": decodeError("InscriptionSatributeEditionsNumberNumber500", InscriptionSatributeEditionsNumberNumber500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions_in_block/{block}": (block, options) => HttpClientRequest.get(`/inscriptions_in_block/${block}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionsInBlockBlock200),
      "400": decodeError("InscriptionsInBlockBlock400", InscriptionsInBlockBlock400),
      "404": decodeError("InscriptionsInBlockBlock404", InscriptionsInBlockBlock404),
      "500": decodeError("InscriptionsInBlockBlock500", InscriptionsInBlockBlock500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions": (options) => HttpClientRequest.get(`/inscriptions`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(Inscriptions200),
      "400": decodeError("Inscriptions400", Inscriptions400),
      "404": decodeError("Inscriptions404", Inscriptions404),
      "500": decodeError("Inscriptions500", Inscriptions500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/random_inscription": () => HttpClientRequest.get(`/random_inscription`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(FullMetadata),
      "400": decodeError("RandomInscription400", RandomInscription400),
      "404": decodeError("RandomInscription404", RandomInscription404),
      "500": decodeError("RandomInscription500", RandomInscription500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/recent_inscriptions": (options) => HttpClientRequest.get(`/recent_inscriptions`).pipe(
    HttpClientRequest.setUrlParams({ "n": options?.["n"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(RecentInscriptions200),
      "400": decodeError("RecentInscriptions400", RecentInscriptions400),
      "404": decodeError("RecentInscriptions404", RecentInscriptions404),
      "500": decodeError("RecentInscriptions500", RecentInscriptions500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/recent_boosts": (options) => HttpClientRequest.get(`/recent_boosts`).pipe(
    HttpClientRequest.setUrlParams({ "n": options?.["n"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(RecentBoosts200),
      "400": decodeError("RecentBoosts400", RecentBoosts400),
      "404": decodeError("RecentBoosts404", RecentBoosts404),
      "500": decodeError("RecentBoosts500", RecentBoosts500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/boost_leaderboard": () => HttpClientRequest.get(`/boost_leaderboard`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(BoostLeaderboard200),
      "400": decodeError("BoostLeaderboard400", BoostLeaderboard400),
      "404": decodeError("BoostLeaderboard404", BoostLeaderboard404),
      "500": decodeError("BoostLeaderboard500", BoostLeaderboard500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_last_transfer/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription_last_transfer/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(Transfer),
      "400": decodeError("InscriptionLastTransferInscriptionId400", InscriptionLastTransferInscriptionId400),
      "404": decodeError("InscriptionLastTransferInscriptionId404", InscriptionLastTransferInscriptionId404),
      "500": decodeError("InscriptionLastTransferInscriptionId500", InscriptionLastTransferInscriptionId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_last_transfer_number/{number}": (number) => HttpClientRequest.get(`/inscription_last_transfer_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(Transfer),
      "400": decodeError("InscriptionLastTransferNumberNumber400", InscriptionLastTransferNumberNumber400),
      "404": decodeError("InscriptionLastTransferNumberNumber404", InscriptionLastTransferNumberNumber404),
      "500": decodeError("InscriptionLastTransferNumberNumber500", InscriptionLastTransferNumberNumber500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_transfers/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription_transfers/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionTransfersInscriptionId200),
      "400": decodeError("InscriptionTransfersInscriptionId400", InscriptionTransfersInscriptionId400),
      "404": decodeError("InscriptionTransfersInscriptionId404", InscriptionTransfersInscriptionId404),
      "500": decodeError("InscriptionTransfersInscriptionId500", InscriptionTransfersInscriptionId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_transfers_number/{number}": (number) => HttpClientRequest.get(`/inscription_transfers_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionTransfersNumberNumber200),
      "400": decodeError("InscriptionTransfersNumberNumber400", InscriptionTransfersNumberNumber400),
      "404": decodeError("InscriptionTransfersNumberNumber404", InscriptionTransfersNumberNumber404),
      "500": decodeError("InscriptionTransfersNumberNumber500", InscriptionTransfersNumberNumber500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions_in_address/{address}": (address, options) => HttpClientRequest.get(`/inscriptions_in_address/${address}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionsInAddressAddress200),
      "400": decodeError("InscriptionsInAddressAddress400", InscriptionsInAddressAddress400),
      "404": decodeError("InscriptionsInAddressAddress404", InscriptionsInAddressAddress404),
      "500": decodeError("InscriptionsInAddressAddress500", InscriptionsInAddressAddress500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions_on_sat/{sat}": (sat) => HttpClientRequest.get(`/inscriptions_on_sat/${sat}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionsOnSatSat200),
      "400": decodeError("InscriptionsOnSatSat400", InscriptionsOnSatSat400),
      "404": decodeError("InscriptionsOnSatSat404", InscriptionsOnSatSat404),
      "500": decodeError("InscriptionsOnSatSat500", InscriptionsOnSatSat500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions_in_sat_block/{block}": (block, options) => HttpClientRequest.get(`/inscriptions_in_sat_block/${block}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionsInSatBlockBlock200),
      "400": decodeError("InscriptionsInSatBlockBlock400", InscriptionsInSatBlockBlock400),
      "404": decodeError("InscriptionsInSatBlockBlock404", InscriptionsInSatBlockBlock404),
      "500": decodeError("InscriptionsInSatBlockBlock500", InscriptionsInSatBlockBlock500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/sat_metadata/{sat}": (sat) => HttpClientRequest.get(`/sat_metadata/${sat}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(SatMetadata),
      "400": decodeError("SatMetadataSat400", SatMetadataSat400),
      "404": decodeError("SatMetadataSat404", SatMetadataSat404),
      "500": decodeError("SatMetadataSat500", SatMetadataSat500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/satributes/{sat}": (sat) => HttpClientRequest.get(`/satributes/${sat}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(SatributesSat200),
      "400": decodeError("SatributesSat400", SatributesSat400),
      "404": decodeError("SatributesSat404", SatributesSat404),
      "500": decodeError("SatributesSat500", SatributesSat500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_collection_data/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription_collection_data/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionCollectionDataInscriptionId200),
      "400": decodeError("InscriptionCollectionDataInscriptionId400", InscriptionCollectionDataInscriptionId400),
      "404": decodeError("InscriptionCollectionDataInscriptionId404", InscriptionCollectionDataInscriptionId404),
      "500": decodeError("InscriptionCollectionDataInscriptionId500", InscriptionCollectionDataInscriptionId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_collection_data_number/{number}": (number) => HttpClientRequest.get(`/inscription_collection_data_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionCollectionDataNumberNumber200),
      "400": decodeError("InscriptionCollectionDataNumberNumber400", InscriptionCollectionDataNumberNumber400),
      "404": decodeError("InscriptionCollectionDataNumberNumber404", InscriptionCollectionDataNumberNumber404),
      "500": decodeError("InscriptionCollectionDataNumberNumber500", InscriptionCollectionDataNumberNumber500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/block_statistics/{block}": (block) => HttpClientRequest.get(`/block_statistics/${block}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(CombinedBlockStats),
      "400": decodeError("BlockStatisticsBlock400", BlockStatisticsBlock400),
      "404": decodeError("BlockStatisticsBlock404", BlockStatisticsBlock404),
      "500": decodeError("BlockStatisticsBlock500", BlockStatisticsBlock500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/sat_block_statistics/{block}": (block) => HttpClientRequest.get(`/sat_block_statistics/${block}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(SatBlockStats),
      "400": decodeError("SatBlockStatisticsBlock400", SatBlockStatisticsBlock400),
      "404": decodeError("SatBlockStatisticsBlock404", SatBlockStatisticsBlock404),
      "500": decodeError("SatBlockStatisticsBlock500", SatBlockStatisticsBlock500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/blocks": (options) => HttpClientRequest.get(`/blocks`).pipe(
    HttpClientRequest.setUrlParams({ "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(Blocks200),
      "400": decodeError("Blocks400", Blocks400),
      "404": decodeError("Blocks404", Blocks404),
      "500": decodeError("Blocks500", Blocks500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/collections": (options) => HttpClientRequest.get(`/collections`).pipe(
    HttpClientRequest.setUrlParams({ "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(Collections200),
      "400": decodeError("Collections400", Collections400),
      "404": decodeError("Collections404", Collections404),
      "500": decodeError("Collections500", Collections500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/collection_summary/{collection_symbol}": (collectionSymbol) => HttpClientRequest.get(`/collection_summary/${collectionSymbol}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(CollectionSummary),
      "400": decodeError("CollectionSummaryCollectionSymbol400", CollectionSummaryCollectionSymbol400),
      "404": decodeError("CollectionSummaryCollectionSymbol404", CollectionSummaryCollectionSymbol404),
      "500": decodeError("CollectionSummaryCollectionSymbol500", CollectionSummaryCollectionSymbol500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/collection_holders/{collection_symbol}": (collectionSymbol, options) => HttpClientRequest.get(`/collection_holders/${collectionSymbol}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(CollectionHoldersCollectionSymbol200),
      "400": decodeError("CollectionHoldersCollectionSymbol400", CollectionHoldersCollectionSymbol400),
      "404": decodeError("CollectionHoldersCollectionSymbol404", CollectionHoldersCollectionSymbol404),
      "500": decodeError("CollectionHoldersCollectionSymbol500", CollectionHoldersCollectionSymbol500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions_in_collection/{collection_symbol}": (collectionSymbol, options) => HttpClientRequest.get(`/inscriptions_in_collection/${collectionSymbol}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionsInCollectionCollectionSymbol200),
      "400": decodeError("InscriptionsInCollectionCollectionSymbol400", InscriptionsInCollectionCollectionSymbol400),
      "404": decodeError("InscriptionsInCollectionCollectionSymbol404", InscriptionsInCollectionCollectionSymbol404),
      "500": decodeError("InscriptionsInCollectionCollectionSymbol500", InscriptionsInCollectionCollectionSymbol500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/on_chain_collections": (options) => HttpClientRequest.get(`/on_chain_collections`).pipe(
    HttpClientRequest.setUrlParams({ "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(OnChainCollections200),
      "400": decodeError("OnChainCollections400", OnChainCollections400),
      "404": decodeError("OnChainCollections404", OnChainCollections404),
      "500": decodeError("OnChainCollections500", OnChainCollections500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/on_chain_collection_summary/{parents}": (parents) => HttpClientRequest.get(`/on_chain_collection_summary/${parents}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(OnChainCollectionSummary),
      "400": decodeError("OnChainCollectionSummaryParents400", OnChainCollectionSummaryParents400),
      "404": decodeError("OnChainCollectionSummaryParents404", OnChainCollectionSummaryParents404),
      "500": decodeError("OnChainCollectionSummaryParents500", OnChainCollectionSummaryParents500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/on_chain_collection_holders/{parents}": (parents, options) => HttpClientRequest.get(`/on_chain_collection_holders/${parents}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(OnChainCollectionHoldersParents200),
      "400": decodeError("OnChainCollectionHoldersParents400", OnChainCollectionHoldersParents400),
      "404": decodeError("OnChainCollectionHoldersParents404", OnChainCollectionHoldersParents404),
      "500": decodeError("OnChainCollectionHoldersParents500", OnChainCollectionHoldersParents500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions_in_on_chain_collection/{parents}": (parents, options) => HttpClientRequest.get(`/inscriptions_in_on_chain_collection/${parents}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionsInOnChainCollectionParents200),
      "400": decodeError("InscriptionsInOnChainCollectionParents400", InscriptionsInOnChainCollectionParents400),
      "404": decodeError("InscriptionsInOnChainCollectionParents404", InscriptionsInOnChainCollectionParents404),
      "500": decodeError("InscriptionsInOnChainCollectionParents500", InscriptionsInOnChainCollectionParents500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/gallery_inscriptions": (options) => HttpClientRequest.get(`/gallery_inscriptions`).pipe(
    HttpClientRequest.setUrlParams({ "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(GalleryInscriptions200),
      "400": decodeError("GalleryInscriptions400", GalleryInscriptions400),
      "404": decodeError("GalleryInscriptions404", GalleryInscriptions404),
      "500": decodeError("GalleryInscriptions500", GalleryInscriptions500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/galleries_summary": (options) => HttpClientRequest.get(`/galleries_summary`).pipe(
    HttpClientRequest.setUrlParams({ "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(GalleriesSummary200),
      "400": decodeError("GalleriesSummary400", GalleriesSummary400),
      "404": decodeError("GalleriesSummary404", GalleriesSummary404),
      "500": decodeError("GalleriesSummary500", GalleriesSummary500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/gallery_summary/{gallery_id}": (galleryId) => HttpClientRequest.get(`/gallery_summary/${galleryId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(GallerySummary),
      "400": decodeError("GallerySummaryGalleryId400", GallerySummaryGalleryId400),
      "404": decodeError("GallerySummaryGalleryId404", GallerySummaryGalleryId404),
      "500": decodeError("GallerySummaryGalleryId500", GallerySummaryGalleryId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/gallery_holders/{gallery_id}": (galleryId, options) => HttpClientRequest.get(`/gallery_holders/${galleryId}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(GalleryHoldersGalleryId200),
      "400": decodeError("GalleryHoldersGalleryId400", GalleryHoldersGalleryId400),
      "404": decodeError("GalleryHoldersGalleryId404", GalleryHoldersGalleryId404),
      "500": decodeError("GalleryHoldersGalleryId500", GalleryHoldersGalleryId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions_in_gallery/{gallery_id}": (galleryId, options) => HttpClientRequest.get(`/inscriptions_in_gallery/${galleryId}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionsInGalleryGalleryId200),
      "400": decodeError("InscriptionsInGalleryGalleryId400", InscriptionsInGalleryGalleryId400),
      "404": decodeError("InscriptionsInGalleryGalleryId404", InscriptionsInGalleryGalleryId404),
      "500": decodeError("InscriptionsInGalleryGalleryId500", InscriptionsInGalleryGalleryId500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/search/{search_by_query}": (searchByQuery) => HttpClientRequest.get(`/search/${searchByQuery}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(SearchResult),
      "400": decodeError("SearchSearchByQuery400", SearchSearchByQuery400),
      "404": decodeError("SearchSearchByQuery404", SearchSearchByQuery404),
      "500": decodeError("SearchSearchByQuery500", SearchSearchByQuery500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/block_icon/{block}": (block) => HttpClientRequest.get(`/block_icon/${block}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "400": decodeError("BlockIconBlock400", BlockIconBlock400),
      "404": decodeError("BlockIconBlock404", BlockIconBlock404),
      "500": decodeError("BlockIconBlock500", BlockIconBlock500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/sat_block_icon/{block}": (block) => HttpClientRequest.get(`/sat_block_icon/${block}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "400": decodeError("SatBlockIconBlock400", SatBlockIconBlock400),
      "404": decodeError("SatBlockIconBlock404", SatBlockIconBlock404),
      "500": decodeError("SatBlockIconBlock500", SatBlockIconBlock500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/block_transfers/{block}": (block) => HttpClientRequest.get(`/block_transfers/${block}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(BlockTransfersBlock200),
      "400": decodeError("BlockTransfersBlock400", BlockTransfersBlock400),
      "404": decodeError("BlockTransfersBlock404", BlockTransfersBlock404),
      "500": decodeError("BlockTransfersBlock500", BlockTransfersBlock500),
      orElse: unexpectedStatus
    }))
  ),
  "POST/submit_package": (options) => HttpClientRequest.post(`/submit_package`).pipe(
    HttpClientRequest.bodyUnsafeJson(options),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(SubmitPackage200),
      "400": decodeError("SubmitPackage400", SubmitPackage400),
      "404": decodeError("SubmitPackage404", SubmitPackage404),
      "500": decodeError("SubmitPackage500", SubmitPackage500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/get_raw_transaction/{txid}": (txid) => HttpClientRequest.get(`/get_raw_transaction/${txid}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(GetRawTransactionTxid200),
      "400": decodeError("GetRawTransactionTxid400", GetRawTransactionTxid400),
      "404": decodeError("GetRawTransactionTxid404", GetRawTransactionTxid404),
      "500": decodeError("GetRawTransactionTxid500", GetRawTransactionTxid500),
      orElse: unexpectedStatus
    }))
  ),
  "GET/api.json": () => HttpClientRequest.get(`/api.json`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(OpenApi),
      orElse: unexpectedStatus
    }))
  ),
  "GET/docs": () => HttpClientRequest.get(`/docs`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      orElse: unexpectedStatus
    }))
  )
  }
}

export interface RustClient {
  readonly httpClient: HttpClient.HttpClient
  readonly "GET/random_inscriptions": (options?: typeof RandomInscriptionsParams.Encoded | undefined) => Effect.Effect<typeof RandomInscriptions200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"RandomInscriptions400", typeof RandomInscriptions400.Type> | RustClientError<"RandomInscriptions404", typeof RandomInscriptions404.Type> | RustClientError<"RandomInscriptions500", typeof RandomInscriptions500.Type>>
  readonly "GET/trending_feed": (options?: typeof TrendingFeedParams.Encoded | undefined) => Effect.Effect<typeof TrendingFeed200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"TrendingFeed400", typeof TrendingFeed400.Type> | RustClientError<"TrendingFeed404", typeof TrendingFeed404.Type> | RustClientError<"TrendingFeed500", typeof TrendingFeed500.Type>>
  readonly "GET/discover_feed": (options?: typeof DiscoverFeedParams.Encoded | undefined) => Effect.Effect<typeof DiscoverFeed200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"DiscoverFeed400", typeof DiscoverFeed400.Type> | RustClientError<"DiscoverFeed404", typeof DiscoverFeed404.Type> | RustClientError<"DiscoverFeed500", typeof DiscoverFeed500.Type>>
  readonly "GET/inscription/{inscription_id}": (inscriptionId: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionInscriptionId400", typeof InscriptionInscriptionId400.Type> | RustClientError<"InscriptionInscriptionId404", typeof InscriptionInscriptionId404.Type> | RustClientError<"InscriptionInscriptionId500", typeof InscriptionInscriptionId500.Type>>
  readonly "GET/inscription_number/{number}": (number: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionNumberNumber400", typeof InscriptionNumberNumber400.Type> | RustClientError<"InscriptionNumberNumber404", typeof InscriptionNumberNumber404.Type> | RustClientError<"InscriptionNumberNumber500", typeof InscriptionNumberNumber500.Type>>
  readonly "GET/inscription_sha256/{sha256}": (sha256: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionSha256Sha256400", typeof InscriptionSha256Sha256400.Type> | RustClientError<"InscriptionSha256Sha256404", typeof InscriptionSha256Sha256404.Type> | RustClientError<"InscriptionSha256Sha256500", typeof InscriptionSha256Sha256500.Type>>
  readonly "GET/inscription_metadata/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof FullMetadata.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionMetadataInscriptionId400", typeof InscriptionMetadataInscriptionId400.Type> | RustClientError<"InscriptionMetadataInscriptionId404", typeof InscriptionMetadataInscriptionId404.Type> | RustClientError<"InscriptionMetadataInscriptionId500", typeof InscriptionMetadataInscriptionId500.Type>>
  readonly "GET/inscription_metadata_number/{number}": (number: string) => Effect.Effect<typeof FullMetadata.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionMetadataNumberNumber400", typeof InscriptionMetadataNumberNumber400.Type> | RustClientError<"InscriptionMetadataNumberNumber404", typeof InscriptionMetadataNumberNumber404.Type> | RustClientError<"InscriptionMetadataNumberNumber500", typeof InscriptionMetadataNumberNumber500.Type>>
  readonly "GET/inscription_edition/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof InscriptionNumberEdition.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionEditionInscriptionId400", typeof InscriptionEditionInscriptionId400.Type> | RustClientError<"InscriptionEditionInscriptionId404", typeof InscriptionEditionInscriptionId404.Type> | RustClientError<"InscriptionEditionInscriptionId500", typeof InscriptionEditionInscriptionId500.Type>>
  readonly "GET/inscription_edition_number/{number}": (number: string) => Effect.Effect<typeof InscriptionNumberEdition.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionEditionNumberNumber400", typeof InscriptionEditionNumberNumber400.Type> | RustClientError<"InscriptionEditionNumberNumber404", typeof InscriptionEditionNumberNumber404.Type> | RustClientError<"InscriptionEditionNumberNumber500", typeof InscriptionEditionNumberNumber500.Type>>
  readonly "GET/inscription_editions_sha256/{sha256}": (sha256: string, options?: typeof InscriptionEditionsSha256Sha256Params.Encoded | undefined) => Effect.Effect<typeof InscriptionEditionsSha256Sha256200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionEditionsSha256Sha256400", typeof InscriptionEditionsSha256Sha256400.Type> | RustClientError<"InscriptionEditionsSha256Sha256404", typeof InscriptionEditionsSha256Sha256404.Type> | RustClientError<"InscriptionEditionsSha256Sha256500", typeof InscriptionEditionsSha256Sha256500.Type>>
  readonly "GET/inscription_children/{inscription_id}": (inscriptionId: string, options?: typeof InscriptionChildrenInscriptionIdParams.Encoded | undefined) => Effect.Effect<typeof InscriptionChildrenInscriptionId200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionChildrenInscriptionId400", typeof InscriptionChildrenInscriptionId400.Type> | RustClientError<"InscriptionChildrenInscriptionId404", typeof InscriptionChildrenInscriptionId404.Type> | RustClientError<"InscriptionChildrenInscriptionId500", typeof InscriptionChildrenInscriptionId500.Type>>
  readonly "GET/inscription_children_number/{number}": (number: string, options?: typeof InscriptionChildrenNumberNumberParams.Encoded | undefined) => Effect.Effect<typeof InscriptionChildrenNumberNumber200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionChildrenNumberNumber400", typeof InscriptionChildrenNumberNumber400.Type> | RustClientError<"InscriptionChildrenNumberNumber404", typeof InscriptionChildrenNumberNumber404.Type> | RustClientError<"InscriptionChildrenNumberNumber500", typeof InscriptionChildrenNumberNumber500.Type>>
  readonly "GET/inscription_referenced_by/{inscription_id}": (inscriptionId: string, options?: typeof InscriptionReferencedByInscriptionIdParams.Encoded | undefined) => Effect.Effect<typeof InscriptionReferencedByInscriptionId200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionReferencedByInscriptionId400", typeof InscriptionReferencedByInscriptionId400.Type> | RustClientError<"InscriptionReferencedByInscriptionId404", typeof InscriptionReferencedByInscriptionId404.Type> | RustClientError<"InscriptionReferencedByInscriptionId500", typeof InscriptionReferencedByInscriptionId500.Type>>
  readonly "GET/inscription_referenced_by_number/{number}": (number: string, options?: typeof InscriptionReferencedByNumberNumberParams.Encoded | undefined) => Effect.Effect<typeof InscriptionReferencedByNumberNumber200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionReferencedByNumberNumber400", typeof InscriptionReferencedByNumberNumber400.Type> | RustClientError<"InscriptionReferencedByNumberNumber404", typeof InscriptionReferencedByNumberNumber404.Type> | RustClientError<"InscriptionReferencedByNumberNumber500", typeof InscriptionReferencedByNumberNumber500.Type>>
  readonly "GET/inscription_bootlegs/{inscription_id}": (inscriptionId: string, options?: typeof InscriptionBootlegsInscriptionIdParams.Encoded | undefined) => Effect.Effect<typeof InscriptionBootlegsInscriptionId200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionBootlegsInscriptionId400", typeof InscriptionBootlegsInscriptionId400.Type> | RustClientError<"InscriptionBootlegsInscriptionId404", typeof InscriptionBootlegsInscriptionId404.Type> | RustClientError<"InscriptionBootlegsInscriptionId500", typeof InscriptionBootlegsInscriptionId500.Type>>
  readonly "GET/inscription_bootlegs_number/{number}": (number: string, options?: typeof InscriptionBootlegsNumberNumberParams.Encoded | undefined) => Effect.Effect<typeof InscriptionBootlegsNumberNumber200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionBootlegsNumberNumber400", typeof InscriptionBootlegsNumberNumber400.Type> | RustClientError<"InscriptionBootlegsNumberNumber404", typeof InscriptionBootlegsNumberNumber404.Type> | RustClientError<"InscriptionBootlegsNumberNumber500", typeof InscriptionBootlegsNumberNumber500.Type>>
  readonly "GET/bootleg_edition/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof BootlegEdition.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"BootlegEditionInscriptionId400", typeof BootlegEditionInscriptionId400.Type> | RustClientError<"BootlegEditionInscriptionId404", typeof BootlegEditionInscriptionId404.Type> | RustClientError<"BootlegEditionInscriptionId500", typeof BootlegEditionInscriptionId500.Type>>
  readonly "GET/bootleg_edition_number/{number}": (number: string) => Effect.Effect<typeof BootlegEdition.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"BootlegEditionNumberNumber400", typeof BootlegEditionNumberNumber400.Type> | RustClientError<"BootlegEditionNumberNumber404", typeof BootlegEditionNumberNumber404.Type> | RustClientError<"BootlegEditionNumberNumber500", typeof BootlegEditionNumberNumber500.Type>>
  readonly "GET/inscription_comments/{inscription_id}": (inscriptionId: string, options?: typeof InscriptionCommentsInscriptionIdParams.Encoded | undefined) => Effect.Effect<typeof InscriptionCommentsInscriptionId200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionCommentsInscriptionId400", typeof InscriptionCommentsInscriptionId400.Type> | RustClientError<"InscriptionCommentsInscriptionId404", typeof InscriptionCommentsInscriptionId404.Type> | RustClientError<"InscriptionCommentsInscriptionId500", typeof InscriptionCommentsInscriptionId500.Type>>
  readonly "GET/inscription_comments_number/{number}": (number: string, options?: typeof InscriptionCommentsNumberNumberParams.Encoded | undefined) => Effect.Effect<typeof InscriptionCommentsNumberNumber200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionCommentsNumberNumber400", typeof InscriptionCommentsNumberNumber400.Type> | RustClientError<"InscriptionCommentsNumberNumber404", typeof InscriptionCommentsNumberNumber404.Type> | RustClientError<"InscriptionCommentsNumberNumber500", typeof InscriptionCommentsNumberNumber500.Type>>
  readonly "GET/comment/{inscription_id}": (inscriptionId: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError | RustClientError<"CommentInscriptionId400", typeof CommentInscriptionId400.Type> | RustClientError<"CommentInscriptionId404", typeof CommentInscriptionId404.Type> | RustClientError<"CommentInscriptionId500", typeof CommentInscriptionId500.Type>>
  readonly "GET/comment_number/{number}": (number: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError | RustClientError<"CommentNumberNumber400", typeof CommentNumberNumber400.Type> | RustClientError<"CommentNumberNumber404", typeof CommentNumberNumber404.Type> | RustClientError<"CommentNumberNumber500", typeof CommentNumberNumber500.Type>>
  readonly "GET/inscription_satribute_editions/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof InscriptionSatributeEditionsInscriptionId200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionSatributeEditionsInscriptionId400", typeof InscriptionSatributeEditionsInscriptionId400.Type> | RustClientError<"InscriptionSatributeEditionsInscriptionId404", typeof InscriptionSatributeEditionsInscriptionId404.Type> | RustClientError<"InscriptionSatributeEditionsInscriptionId500", typeof InscriptionSatributeEditionsInscriptionId500.Type>>
  readonly "GET/inscription_satribute_editions_number/{number}": (number: string) => Effect.Effect<typeof InscriptionSatributeEditionsNumberNumber200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionSatributeEditionsNumberNumber400", typeof InscriptionSatributeEditionsNumberNumber400.Type> | RustClientError<"InscriptionSatributeEditionsNumberNumber404", typeof InscriptionSatributeEditionsNumberNumber404.Type> | RustClientError<"InscriptionSatributeEditionsNumberNumber500", typeof InscriptionSatributeEditionsNumberNumber500.Type>>
  readonly "GET/inscriptions_in_block/{block}": (block: string, options?: typeof InscriptionsInBlockBlockParams.Encoded | undefined) => Effect.Effect<typeof InscriptionsInBlockBlock200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionsInBlockBlock400", typeof InscriptionsInBlockBlock400.Type> | RustClientError<"InscriptionsInBlockBlock404", typeof InscriptionsInBlockBlock404.Type> | RustClientError<"InscriptionsInBlockBlock500", typeof InscriptionsInBlockBlock500.Type>>
  readonly "GET/inscriptions": (options?: typeof InscriptionsParams.Encoded | undefined) => Effect.Effect<typeof Inscriptions200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"Inscriptions400", typeof Inscriptions400.Type> | RustClientError<"Inscriptions404", typeof Inscriptions404.Type> | RustClientError<"Inscriptions500", typeof Inscriptions500.Type>>
  readonly "GET/random_inscription": () => Effect.Effect<typeof FullMetadata.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"RandomInscription400", typeof RandomInscription400.Type> | RustClientError<"RandomInscription404", typeof RandomInscription404.Type> | RustClientError<"RandomInscription500", typeof RandomInscription500.Type>>
  readonly "GET/recent_inscriptions": (options?: typeof RecentInscriptionsParams.Encoded | undefined) => Effect.Effect<typeof RecentInscriptions200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"RecentInscriptions400", typeof RecentInscriptions400.Type> | RustClientError<"RecentInscriptions404", typeof RecentInscriptions404.Type> | RustClientError<"RecentInscriptions500", typeof RecentInscriptions500.Type>>
  readonly "GET/recent_boosts": (options?: typeof RecentBoostsParams.Encoded | undefined) => Effect.Effect<typeof RecentBoosts200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"RecentBoosts400", typeof RecentBoosts400.Type> | RustClientError<"RecentBoosts404", typeof RecentBoosts404.Type> | RustClientError<"RecentBoosts500", typeof RecentBoosts500.Type>>
  readonly "GET/boost_leaderboard": () => Effect.Effect<typeof BoostLeaderboard200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"BoostLeaderboard400", typeof BoostLeaderboard400.Type> | RustClientError<"BoostLeaderboard404", typeof BoostLeaderboard404.Type> | RustClientError<"BoostLeaderboard500", typeof BoostLeaderboard500.Type>>
  readonly "GET/inscription_last_transfer/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof Transfer.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionLastTransferInscriptionId400", typeof InscriptionLastTransferInscriptionId400.Type> | RustClientError<"InscriptionLastTransferInscriptionId404", typeof InscriptionLastTransferInscriptionId404.Type> | RustClientError<"InscriptionLastTransferInscriptionId500", typeof InscriptionLastTransferInscriptionId500.Type>>
  readonly "GET/inscription_last_transfer_number/{number}": (number: string) => Effect.Effect<typeof Transfer.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionLastTransferNumberNumber400", typeof InscriptionLastTransferNumberNumber400.Type> | RustClientError<"InscriptionLastTransferNumberNumber404", typeof InscriptionLastTransferNumberNumber404.Type> | RustClientError<"InscriptionLastTransferNumberNumber500", typeof InscriptionLastTransferNumberNumber500.Type>>
  readonly "GET/inscription_transfers/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof InscriptionTransfersInscriptionId200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionTransfersInscriptionId400", typeof InscriptionTransfersInscriptionId400.Type> | RustClientError<"InscriptionTransfersInscriptionId404", typeof InscriptionTransfersInscriptionId404.Type> | RustClientError<"InscriptionTransfersInscriptionId500", typeof InscriptionTransfersInscriptionId500.Type>>
  readonly "GET/inscription_transfers_number/{number}": (number: string) => Effect.Effect<typeof InscriptionTransfersNumberNumber200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionTransfersNumberNumber400", typeof InscriptionTransfersNumberNumber400.Type> | RustClientError<"InscriptionTransfersNumberNumber404", typeof InscriptionTransfersNumberNumber404.Type> | RustClientError<"InscriptionTransfersNumberNumber500", typeof InscriptionTransfersNumberNumber500.Type>>
  readonly "GET/inscriptions_in_address/{address}": (address: string, options?: typeof InscriptionsInAddressAddressParams.Encoded | undefined) => Effect.Effect<typeof InscriptionsInAddressAddress200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionsInAddressAddress400", typeof InscriptionsInAddressAddress400.Type> | RustClientError<"InscriptionsInAddressAddress404", typeof InscriptionsInAddressAddress404.Type> | RustClientError<"InscriptionsInAddressAddress500", typeof InscriptionsInAddressAddress500.Type>>
  readonly "GET/inscriptions_on_sat/{sat}": (sat: string) => Effect.Effect<typeof InscriptionsOnSatSat200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionsOnSatSat400", typeof InscriptionsOnSatSat400.Type> | RustClientError<"InscriptionsOnSatSat404", typeof InscriptionsOnSatSat404.Type> | RustClientError<"InscriptionsOnSatSat500", typeof InscriptionsOnSatSat500.Type>>
  readonly "GET/inscriptions_in_sat_block/{block}": (block: string, options?: typeof InscriptionsInSatBlockBlockParams.Encoded | undefined) => Effect.Effect<typeof InscriptionsInSatBlockBlock200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionsInSatBlockBlock400", typeof InscriptionsInSatBlockBlock400.Type> | RustClientError<"InscriptionsInSatBlockBlock404", typeof InscriptionsInSatBlockBlock404.Type> | RustClientError<"InscriptionsInSatBlockBlock500", typeof InscriptionsInSatBlockBlock500.Type>>
  readonly "GET/sat_metadata/{sat}": (sat: string) => Effect.Effect<typeof SatMetadata.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"SatMetadataSat400", typeof SatMetadataSat400.Type> | RustClientError<"SatMetadataSat404", typeof SatMetadataSat404.Type> | RustClientError<"SatMetadataSat500", typeof SatMetadataSat500.Type>>
  readonly "GET/satributes/{sat}": (sat: string) => Effect.Effect<typeof SatributesSat200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"SatributesSat400", typeof SatributesSat400.Type> | RustClientError<"SatributesSat404", typeof SatributesSat404.Type> | RustClientError<"SatributesSat500", typeof SatributesSat500.Type>>
  readonly "GET/inscription_collection_data/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof InscriptionCollectionDataInscriptionId200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionCollectionDataInscriptionId400", typeof InscriptionCollectionDataInscriptionId400.Type> | RustClientError<"InscriptionCollectionDataInscriptionId404", typeof InscriptionCollectionDataInscriptionId404.Type> | RustClientError<"InscriptionCollectionDataInscriptionId500", typeof InscriptionCollectionDataInscriptionId500.Type>>
  readonly "GET/inscription_collection_data_number/{number}": (number: string) => Effect.Effect<typeof InscriptionCollectionDataNumberNumber200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionCollectionDataNumberNumber400", typeof InscriptionCollectionDataNumberNumber400.Type> | RustClientError<"InscriptionCollectionDataNumberNumber404", typeof InscriptionCollectionDataNumberNumber404.Type> | RustClientError<"InscriptionCollectionDataNumberNumber500", typeof InscriptionCollectionDataNumberNumber500.Type>>
  readonly "GET/block_statistics/{block}": (block: string) => Effect.Effect<typeof CombinedBlockStats.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"BlockStatisticsBlock400", typeof BlockStatisticsBlock400.Type> | RustClientError<"BlockStatisticsBlock404", typeof BlockStatisticsBlock404.Type> | RustClientError<"BlockStatisticsBlock500", typeof BlockStatisticsBlock500.Type>>
  readonly "GET/sat_block_statistics/{block}": (block: string) => Effect.Effect<typeof SatBlockStats.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"SatBlockStatisticsBlock400", typeof SatBlockStatisticsBlock400.Type> | RustClientError<"SatBlockStatisticsBlock404", typeof SatBlockStatisticsBlock404.Type> | RustClientError<"SatBlockStatisticsBlock500", typeof SatBlockStatisticsBlock500.Type>>
  readonly "GET/blocks": (options?: typeof BlocksParams.Encoded | undefined) => Effect.Effect<typeof Blocks200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"Blocks400", typeof Blocks400.Type> | RustClientError<"Blocks404", typeof Blocks404.Type> | RustClientError<"Blocks500", typeof Blocks500.Type>>
  readonly "GET/collections": (options?: typeof CollectionsParams.Encoded | undefined) => Effect.Effect<typeof Collections200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"Collections400", typeof Collections400.Type> | RustClientError<"Collections404", typeof Collections404.Type> | RustClientError<"Collections500", typeof Collections500.Type>>
  readonly "GET/collection_summary/{collection_symbol}": (collectionSymbol: string) => Effect.Effect<typeof CollectionSummary.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"CollectionSummaryCollectionSymbol400", typeof CollectionSummaryCollectionSymbol400.Type> | RustClientError<"CollectionSummaryCollectionSymbol404", typeof CollectionSummaryCollectionSymbol404.Type> | RustClientError<"CollectionSummaryCollectionSymbol500", typeof CollectionSummaryCollectionSymbol500.Type>>
  readonly "GET/collection_holders/{collection_symbol}": (collectionSymbol: string, options?: typeof CollectionHoldersCollectionSymbolParams.Encoded | undefined) => Effect.Effect<typeof CollectionHoldersCollectionSymbol200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"CollectionHoldersCollectionSymbol400", typeof CollectionHoldersCollectionSymbol400.Type> | RustClientError<"CollectionHoldersCollectionSymbol404", typeof CollectionHoldersCollectionSymbol404.Type> | RustClientError<"CollectionHoldersCollectionSymbol500", typeof CollectionHoldersCollectionSymbol500.Type>>
  readonly "GET/inscriptions_in_collection/{collection_symbol}": (collectionSymbol: string, options?: typeof InscriptionsInCollectionCollectionSymbolParams.Encoded | undefined) => Effect.Effect<typeof InscriptionsInCollectionCollectionSymbol200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionsInCollectionCollectionSymbol400", typeof InscriptionsInCollectionCollectionSymbol400.Type> | RustClientError<"InscriptionsInCollectionCollectionSymbol404", typeof InscriptionsInCollectionCollectionSymbol404.Type> | RustClientError<"InscriptionsInCollectionCollectionSymbol500", typeof InscriptionsInCollectionCollectionSymbol500.Type>>
  readonly "GET/on_chain_collections": (options?: typeof OnChainCollectionsParams.Encoded | undefined) => Effect.Effect<typeof OnChainCollections200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"OnChainCollections400", typeof OnChainCollections400.Type> | RustClientError<"OnChainCollections404", typeof OnChainCollections404.Type> | RustClientError<"OnChainCollections500", typeof OnChainCollections500.Type>>
  readonly "GET/on_chain_collection_summary/{parents}": (parents: string) => Effect.Effect<typeof OnChainCollectionSummary.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"OnChainCollectionSummaryParents400", typeof OnChainCollectionSummaryParents400.Type> | RustClientError<"OnChainCollectionSummaryParents404", typeof OnChainCollectionSummaryParents404.Type> | RustClientError<"OnChainCollectionSummaryParents500", typeof OnChainCollectionSummaryParents500.Type>>
  readonly "GET/on_chain_collection_holders/{parents}": (parents: string, options?: typeof OnChainCollectionHoldersParentsParams.Encoded | undefined) => Effect.Effect<typeof OnChainCollectionHoldersParents200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"OnChainCollectionHoldersParents400", typeof OnChainCollectionHoldersParents400.Type> | RustClientError<"OnChainCollectionHoldersParents404", typeof OnChainCollectionHoldersParents404.Type> | RustClientError<"OnChainCollectionHoldersParents500", typeof OnChainCollectionHoldersParents500.Type>>
  readonly "GET/inscriptions_in_on_chain_collection/{parents}": (parents: string, options?: typeof InscriptionsInOnChainCollectionParentsParams.Encoded | undefined) => Effect.Effect<typeof InscriptionsInOnChainCollectionParents200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionsInOnChainCollectionParents400", typeof InscriptionsInOnChainCollectionParents400.Type> | RustClientError<"InscriptionsInOnChainCollectionParents404", typeof InscriptionsInOnChainCollectionParents404.Type> | RustClientError<"InscriptionsInOnChainCollectionParents500", typeof InscriptionsInOnChainCollectionParents500.Type>>
  readonly "GET/gallery_inscriptions": (options?: typeof GalleryInscriptionsParams.Encoded | undefined) => Effect.Effect<typeof GalleryInscriptions200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"GalleryInscriptions400", typeof GalleryInscriptions400.Type> | RustClientError<"GalleryInscriptions404", typeof GalleryInscriptions404.Type> | RustClientError<"GalleryInscriptions500", typeof GalleryInscriptions500.Type>>
  readonly "GET/galleries_summary": (options?: typeof GalleriesSummaryParams.Encoded | undefined) => Effect.Effect<typeof GalleriesSummary200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"GalleriesSummary400", typeof GalleriesSummary400.Type> | RustClientError<"GalleriesSummary404", typeof GalleriesSummary404.Type> | RustClientError<"GalleriesSummary500", typeof GalleriesSummary500.Type>>
  readonly "GET/gallery_summary/{gallery_id}": (galleryId: string) => Effect.Effect<typeof GallerySummary.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"GallerySummaryGalleryId400", typeof GallerySummaryGalleryId400.Type> | RustClientError<"GallerySummaryGalleryId404", typeof GallerySummaryGalleryId404.Type> | RustClientError<"GallerySummaryGalleryId500", typeof GallerySummaryGalleryId500.Type>>
  readonly "GET/gallery_holders/{gallery_id}": (galleryId: string, options?: typeof GalleryHoldersGalleryIdParams.Encoded | undefined) => Effect.Effect<typeof GalleryHoldersGalleryId200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"GalleryHoldersGalleryId400", typeof GalleryHoldersGalleryId400.Type> | RustClientError<"GalleryHoldersGalleryId404", typeof GalleryHoldersGalleryId404.Type> | RustClientError<"GalleryHoldersGalleryId500", typeof GalleryHoldersGalleryId500.Type>>
  readonly "GET/inscriptions_in_gallery/{gallery_id}": (galleryId: string, options?: typeof InscriptionsInGalleryGalleryIdParams.Encoded | undefined) => Effect.Effect<typeof InscriptionsInGalleryGalleryId200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"InscriptionsInGalleryGalleryId400", typeof InscriptionsInGalleryGalleryId400.Type> | RustClientError<"InscriptionsInGalleryGalleryId404", typeof InscriptionsInGalleryGalleryId404.Type> | RustClientError<"InscriptionsInGalleryGalleryId500", typeof InscriptionsInGalleryGalleryId500.Type>>
  readonly "GET/search/{search_by_query}": (searchByQuery: string) => Effect.Effect<typeof SearchResult.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"SearchSearchByQuery400", typeof SearchSearchByQuery400.Type> | RustClientError<"SearchSearchByQuery404", typeof SearchSearchByQuery404.Type> | RustClientError<"SearchSearchByQuery500", typeof SearchSearchByQuery500.Type>>
  readonly "GET/block_icon/{block}": (block: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError | RustClientError<"BlockIconBlock400", typeof BlockIconBlock400.Type> | RustClientError<"BlockIconBlock404", typeof BlockIconBlock404.Type> | RustClientError<"BlockIconBlock500", typeof BlockIconBlock500.Type>>
  readonly "GET/sat_block_icon/{block}": (block: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError | RustClientError<"SatBlockIconBlock400", typeof SatBlockIconBlock400.Type> | RustClientError<"SatBlockIconBlock404", typeof SatBlockIconBlock404.Type> | RustClientError<"SatBlockIconBlock500", typeof SatBlockIconBlock500.Type>>
  readonly "GET/block_transfers/{block}": (block: string) => Effect.Effect<typeof BlockTransfersBlock200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"BlockTransfersBlock400", typeof BlockTransfersBlock400.Type> | RustClientError<"BlockTransfersBlock404", typeof BlockTransfersBlock404.Type> | RustClientError<"BlockTransfersBlock500", typeof BlockTransfersBlock500.Type>>
  readonly "POST/submit_package": (options: typeof SubmitPackageRequest.Encoded) => Effect.Effect<typeof SubmitPackage200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"SubmitPackage400", typeof SubmitPackage400.Type> | RustClientError<"SubmitPackage404", typeof SubmitPackage404.Type> | RustClientError<"SubmitPackage500", typeof SubmitPackage500.Type>>
  readonly "GET/get_raw_transaction/{txid}": (txid: string) => Effect.Effect<typeof GetRawTransactionTxid200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"GetRawTransactionTxid400", typeof GetRawTransactionTxid400.Type> | RustClientError<"GetRawTransactionTxid404", typeof GetRawTransactionTxid404.Type> | RustClientError<"GetRawTransactionTxid500", typeof GetRawTransactionTxid500.Type>>
  readonly "GET/api.json": () => Effect.Effect<typeof OpenApi.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/docs": () => Effect.Effect<void, HttpClientError.HttpClientError | ParseError>
}

export interface RustClientError<Tag extends string, E> {
  readonly _tag: Tag
  readonly request: HttpClientRequest.HttpClientRequest
  readonly response: HttpClientResponse.HttpClientResponse
  readonly cause: E
}

class RustClientErrorImpl extends Data.Error<{
  _tag: string
  cause: any
  request: HttpClientRequest.HttpClientRequest
  response: HttpClientResponse.HttpClientResponse
}> {}

export const RustClientError = <Tag extends string, E>(
  tag: Tag,
  cause: E,
  response: HttpClientResponse.HttpClientResponse,
): RustClientError<Tag, E> =>
  new RustClientErrorImpl({
    _tag: tag,
    cause,
    response,
    request: response.request,
  }) as any

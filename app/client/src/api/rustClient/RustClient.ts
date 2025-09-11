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

/**
* Resource not found error message
*/
export class RandomInscriptions404 extends S.String {}

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

export class InscriptionNumberEdition extends S.Class<InscriptionNumberEdition>("InscriptionNumberEdition")({
  "id": S.String,
  "number": S.Int,
  "edition": S.Int,
  "total": S.Int
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

export class ContentType extends S.Literal("text", "image", "gif", "audio", "video", "html", "json", "namespace") {}

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

export class InscriptionSatributeEditionsNumberNumber200 extends S.Array(SatributeEdition) {}

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

export class RecentInscriptionsParams extends S.Struct({
  /**
* Number parameter for pagination or limiting results
*/
"n": S.optionalWith(S.Int.pipe(S.greaterThanOrEqualTo(0)), { nullable: true })
}) {}

export class RecentInscriptions200 extends S.Array(FullMetadata) {}

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

export class LeaderboardEntry extends S.Class<LeaderboardEntry>("LeaderboardEntry")({
  "address": S.String,
  "count": S.Int
}) {}

export class BoostLeaderboard200 extends S.Array(LeaderboardEntry) {}

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

export class InscriptionTransfersInscriptionId200 extends S.Array(Transfer) {}

export class InscriptionTransfersNumberNumber200 extends S.Array(Transfer) {}

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

export class InscriptionsOnSatSat200 extends S.Array(FullMetadata) {}

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

export class Satribute extends S.Class<Satribute>("Satribute")({
  "sat": S.Int,
  "satribute": S.String
}) {}

export class SatributesSat200 extends S.Array(Satribute) {}

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

export class InscriptionCollectionDataNumberNumber200 extends S.Array(InscriptionCollectionData) {}

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

export class SatBlockStats extends S.Class<SatBlockStats>("SatBlockStats")({
  "sat_block_number": S.Int,
  "sat_block_timestamp": S.optionalWith(S.Int, { nullable: true }),
  "sat_block_inscription_count": S.optionalWith(S.Int, { nullable: true }),
  "sat_block_inscription_size": S.optionalWith(S.Int, { nullable: true }),
  "sat_block_inscription_fees": S.optionalWith(S.Int, { nullable: true })
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

export class SearchResult extends S.Class<SearchResult>("SearchResult")({
  "collections": S.Array(CollectionSummary),
  "inscription": S.optionalWith(FullMetadata, { nullable: true }),
  "address": S.optionalWith(S.String, { nullable: true }),
  "block": S.optionalWith(CombinedBlockStats, { nullable: true }),
  "sat": S.optionalWith(SatMetadata, { nullable: true })
}) {}

export class BlockTransfersBlock200 extends S.Array(Transfer) {}

export class SubmitPackageRequest extends S.Array(S.String) {}

export class SubmitPackage200 extends S.Array(S.String) {}

export class GetRawTransactionTxid200 extends S.Struct({
  
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
      "404": decodeError("RandomInscriptions404", RandomInscriptions404),
      orElse: unexpectedStatus
    }))
  ),
  "GET/trending_feed": (options) => HttpClientRequest.get(`/trending_feed`).pipe(
    HttpClientRequest.setUrlParams({ "n": options?.["n"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(TrendingFeed200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/discover_feed": (options) => HttpClientRequest.get(`/discover_feed`).pipe(
    HttpClientRequest.setUrlParams({ "n": options?.["n"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(DiscoverFeed200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_number/{number}": (number) => HttpClientRequest.get(`/inscription_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_sha256/{sha256}": (sha256) => HttpClientRequest.get(`/inscription_sha256/${sha256}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_metadata/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription_metadata/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(FullMetadata),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_metadata_number/{number}": (number) => HttpClientRequest.get(`/inscription_metadata_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(FullMetadata),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_edition/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription_edition/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionNumberEdition),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_edition_number/{number}": (number) => HttpClientRequest.get(`/inscription_edition_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionNumberEdition),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_editions_sha256/{sha256}": (sha256, options) => HttpClientRequest.get(`/inscription_editions_sha256/${sha256}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionEditionsSha256Sha256200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_children/{inscription_id}": (inscriptionId, options) => HttpClientRequest.get(`/inscription_children/${inscriptionId}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionChildrenInscriptionId200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_children_number/{number}": (number, options) => HttpClientRequest.get(`/inscription_children_number/${number}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionChildrenNumberNumber200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_referenced_by/{inscription_id}": (inscriptionId, options) => HttpClientRequest.get(`/inscription_referenced_by/${inscriptionId}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionReferencedByInscriptionId200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_referenced_by_number/{number}": (number, options) => HttpClientRequest.get(`/inscription_referenced_by_number/${number}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionReferencedByNumberNumber200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_bootlegs/{inscription_id}": (inscriptionId, options) => HttpClientRequest.get(`/inscription_bootlegs/${inscriptionId}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionBootlegsInscriptionId200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_bootlegs_number/{number}": (number, options) => HttpClientRequest.get(`/inscription_bootlegs_number/${number}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionBootlegsNumberNumber200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/bootleg_edition/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/bootleg_edition/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(BootlegEdition),
      orElse: unexpectedStatus
    }))
  ),
  "GET/bootleg_edition_number/{number}": (number) => HttpClientRequest.get(`/bootleg_edition_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(BootlegEdition),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_comments/{inscription_id}": (inscriptionId, options) => HttpClientRequest.get(`/inscription_comments/${inscriptionId}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionCommentsInscriptionId200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_comments_number/{number}": (number, options) => HttpClientRequest.get(`/inscription_comments_number/${number}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionCommentsNumberNumber200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/comment/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/comment/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      orElse: unexpectedStatus
    }))
  ),
  "GET/comment_number/{number}": (number) => HttpClientRequest.get(`/comment_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_satribute_editions/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription_satribute_editions/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionSatributeEditionsInscriptionId200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_satribute_editions_number/{number}": (number) => HttpClientRequest.get(`/inscription_satribute_editions_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionSatributeEditionsNumberNumber200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions_in_block/{block}": (block, options) => HttpClientRequest.get(`/inscriptions_in_block/${block}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionsInBlockBlock200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions": (options) => HttpClientRequest.get(`/inscriptions`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(Inscriptions200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/random_inscription": () => HttpClientRequest.get(`/random_inscription`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(FullMetadata),
      orElse: unexpectedStatus
    }))
  ),
  "GET/recent_inscriptions": (options) => HttpClientRequest.get(`/recent_inscriptions`).pipe(
    HttpClientRequest.setUrlParams({ "n": options?.["n"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(RecentInscriptions200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/recent_boosts": (options) => HttpClientRequest.get(`/recent_boosts`).pipe(
    HttpClientRequest.setUrlParams({ "n": options?.["n"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(RecentBoosts200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/boost_leaderboard": () => HttpClientRequest.get(`/boost_leaderboard`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(BoostLeaderboard200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_last_transfer/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription_last_transfer/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(Transfer),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_last_transfer_number/{number}": (number) => HttpClientRequest.get(`/inscription_last_transfer_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(Transfer),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_transfers/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription_transfers/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionTransfersInscriptionId200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_transfers_number/{number}": (number) => HttpClientRequest.get(`/inscription_transfers_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionTransfersNumberNumber200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions_in_address/{address}": (address, options) => HttpClientRequest.get(`/inscriptions_in_address/${address}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionsInAddressAddress200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions_on_sat/{sat}": (sat) => HttpClientRequest.get(`/inscriptions_on_sat/${sat}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionsOnSatSat200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions_in_sat_block/{block}": (block, options) => HttpClientRequest.get(`/inscriptions_in_sat_block/${block}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionsInSatBlockBlock200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/sat_metadata/{sat}": (sat) => HttpClientRequest.get(`/sat_metadata/${sat}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(SatMetadata),
      orElse: unexpectedStatus
    }))
  ),
  "GET/satributes/{sat}": (sat) => HttpClientRequest.get(`/satributes/${sat}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(SatributesSat200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_collection_data/{inscription_id}": (inscriptionId) => HttpClientRequest.get(`/inscription_collection_data/${inscriptionId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionCollectionDataInscriptionId200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscription_collection_data_number/{number}": (number) => HttpClientRequest.get(`/inscription_collection_data_number/${number}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionCollectionDataNumberNumber200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/block_statistics/{block}": (block) => HttpClientRequest.get(`/block_statistics/${block}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(CombinedBlockStats),
      orElse: unexpectedStatus
    }))
  ),
  "GET/sat_block_statistics/{block}": (block) => HttpClientRequest.get(`/sat_block_statistics/${block}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(SatBlockStats),
      orElse: unexpectedStatus
    }))
  ),
  "GET/blocks": (options) => HttpClientRequest.get(`/blocks`).pipe(
    HttpClientRequest.setUrlParams({ "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(Blocks200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/collections": (options) => HttpClientRequest.get(`/collections`).pipe(
    HttpClientRequest.setUrlParams({ "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(Collections200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/collection_summary/{collection_symbol}": (collectionSymbol) => HttpClientRequest.get(`/collection_summary/${collectionSymbol}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(CollectionSummary),
      orElse: unexpectedStatus
    }))
  ),
  "GET/collection_holders/{collection_symbol}": (collectionSymbol, options) => HttpClientRequest.get(`/collection_holders/${collectionSymbol}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(CollectionHoldersCollectionSymbol200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions_in_collection/{collection_symbol}": (collectionSymbol, options) => HttpClientRequest.get(`/inscriptions_in_collection/${collectionSymbol}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionsInCollectionCollectionSymbol200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/on_chain_collections": (options) => HttpClientRequest.get(`/on_chain_collections`).pipe(
    HttpClientRequest.setUrlParams({ "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(OnChainCollections200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/on_chain_collection_summary/{parents}": (parents) => HttpClientRequest.get(`/on_chain_collection_summary/${parents}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(OnChainCollectionSummary),
      orElse: unexpectedStatus
    }))
  ),
  "GET/on_chain_collection_holders/{parents}": (parents, options) => HttpClientRequest.get(`/on_chain_collection_holders/${parents}`).pipe(
    HttpClientRequest.setUrlParams({ "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(OnChainCollectionHoldersParents200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/inscriptions_in_on_chain_collection/{parents}": (parents, options) => HttpClientRequest.get(`/inscriptions_in_on_chain_collection/${parents}`).pipe(
    HttpClientRequest.setUrlParams({ "content_types": options?.["content_types"] as any, "satributes": options?.["satributes"] as any, "charms": options?.["charms"] as any, "sort_by": options?.["sort_by"] as any, "page_number": options?.["page_number"] as any, "page_size": options?.["page_size"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(InscriptionsInOnChainCollectionParents200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/search/{search_by_query}": (searchByQuery) => HttpClientRequest.get(`/search/${searchByQuery}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(SearchResult),
      orElse: unexpectedStatus
    }))
  ),
  "GET/block_icon/{block}": (block) => HttpClientRequest.get(`/block_icon/${block}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      orElse: unexpectedStatus
    }))
  ),
  "GET/sat_block_icon/{block}": (block) => HttpClientRequest.get(`/sat_block_icon/${block}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      orElse: unexpectedStatus
    }))
  ),
  "GET/block_transfers/{block}": (block) => HttpClientRequest.get(`/block_transfers/${block}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(BlockTransfersBlock200),
      orElse: unexpectedStatus
    }))
  ),
  "POST/submit_package": (options) => HttpClientRequest.post(`/submit_package`).pipe(
    HttpClientRequest.bodyUnsafeJson(options),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(SubmitPackage200),
      orElse: unexpectedStatus
    }))
  ),
  "GET/get_raw_transaction/{txid}": (txid) => HttpClientRequest.get(`/get_raw_transaction/${txid}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(GetRawTransactionTxid200),
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
  readonly "GET/random_inscriptions": (options?: typeof RandomInscriptionsParams.Encoded | undefined) => Effect.Effect<typeof RandomInscriptions200.Type, HttpClientError.HttpClientError | ParseError | RustClientError<"RandomInscriptions404", typeof RandomInscriptions404.Type>>
  readonly "GET/trending_feed": (options?: typeof TrendingFeedParams.Encoded | undefined) => Effect.Effect<typeof TrendingFeed200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/discover_feed": (options?: typeof DiscoverFeedParams.Encoded | undefined) => Effect.Effect<typeof DiscoverFeed200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription/{inscription_id}": (inscriptionId: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_number/{number}": (number: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_sha256/{sha256}": (sha256: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_metadata/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof FullMetadata.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_metadata_number/{number}": (number: string) => Effect.Effect<typeof FullMetadata.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_edition/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof InscriptionNumberEdition.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_edition_number/{number}": (number: string) => Effect.Effect<typeof InscriptionNumberEdition.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_editions_sha256/{sha256}": (sha256: string, options?: typeof InscriptionEditionsSha256Sha256Params.Encoded | undefined) => Effect.Effect<typeof InscriptionEditionsSha256Sha256200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_children/{inscription_id}": (inscriptionId: string, options?: typeof InscriptionChildrenInscriptionIdParams.Encoded | undefined) => Effect.Effect<typeof InscriptionChildrenInscriptionId200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_children_number/{number}": (number: string, options?: typeof InscriptionChildrenNumberNumberParams.Encoded | undefined) => Effect.Effect<typeof InscriptionChildrenNumberNumber200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_referenced_by/{inscription_id}": (inscriptionId: string, options?: typeof InscriptionReferencedByInscriptionIdParams.Encoded | undefined) => Effect.Effect<typeof InscriptionReferencedByInscriptionId200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_referenced_by_number/{number}": (number: string, options?: typeof InscriptionReferencedByNumberNumberParams.Encoded | undefined) => Effect.Effect<typeof InscriptionReferencedByNumberNumber200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_bootlegs/{inscription_id}": (inscriptionId: string, options?: typeof InscriptionBootlegsInscriptionIdParams.Encoded | undefined) => Effect.Effect<typeof InscriptionBootlegsInscriptionId200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_bootlegs_number/{number}": (number: string, options?: typeof InscriptionBootlegsNumberNumberParams.Encoded | undefined) => Effect.Effect<typeof InscriptionBootlegsNumberNumber200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/bootleg_edition/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof BootlegEdition.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/bootleg_edition_number/{number}": (number: string) => Effect.Effect<typeof BootlegEdition.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_comments/{inscription_id}": (inscriptionId: string, options?: typeof InscriptionCommentsInscriptionIdParams.Encoded | undefined) => Effect.Effect<typeof InscriptionCommentsInscriptionId200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_comments_number/{number}": (number: string, options?: typeof InscriptionCommentsNumberNumberParams.Encoded | undefined) => Effect.Effect<typeof InscriptionCommentsNumberNumber200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/comment/{inscription_id}": (inscriptionId: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError>
  readonly "GET/comment_number/{number}": (number: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_satribute_editions/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof InscriptionSatributeEditionsInscriptionId200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_satribute_editions_number/{number}": (number: string) => Effect.Effect<typeof InscriptionSatributeEditionsNumberNumber200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscriptions_in_block/{block}": (block: string, options?: typeof InscriptionsInBlockBlockParams.Encoded | undefined) => Effect.Effect<typeof InscriptionsInBlockBlock200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscriptions": (options?: typeof InscriptionsParams.Encoded | undefined) => Effect.Effect<typeof Inscriptions200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/random_inscription": () => Effect.Effect<typeof FullMetadata.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/recent_inscriptions": (options?: typeof RecentInscriptionsParams.Encoded | undefined) => Effect.Effect<typeof RecentInscriptions200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/recent_boosts": (options?: typeof RecentBoostsParams.Encoded | undefined) => Effect.Effect<typeof RecentBoosts200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/boost_leaderboard": () => Effect.Effect<typeof BoostLeaderboard200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_last_transfer/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof Transfer.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_last_transfer_number/{number}": (number: string) => Effect.Effect<typeof Transfer.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_transfers/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof InscriptionTransfersInscriptionId200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_transfers_number/{number}": (number: string) => Effect.Effect<typeof InscriptionTransfersNumberNumber200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscriptions_in_address/{address}": (address: string, options?: typeof InscriptionsInAddressAddressParams.Encoded | undefined) => Effect.Effect<typeof InscriptionsInAddressAddress200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscriptions_on_sat/{sat}": (sat: string) => Effect.Effect<typeof InscriptionsOnSatSat200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscriptions_in_sat_block/{block}": (block: string, options?: typeof InscriptionsInSatBlockBlockParams.Encoded | undefined) => Effect.Effect<typeof InscriptionsInSatBlockBlock200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/sat_metadata/{sat}": (sat: string) => Effect.Effect<typeof SatMetadata.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/satributes/{sat}": (sat: string) => Effect.Effect<typeof SatributesSat200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_collection_data/{inscription_id}": (inscriptionId: string) => Effect.Effect<typeof InscriptionCollectionDataInscriptionId200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscription_collection_data_number/{number}": (number: string) => Effect.Effect<typeof InscriptionCollectionDataNumberNumber200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/block_statistics/{block}": (block: string) => Effect.Effect<typeof CombinedBlockStats.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/sat_block_statistics/{block}": (block: string) => Effect.Effect<typeof SatBlockStats.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/blocks": (options?: typeof BlocksParams.Encoded | undefined) => Effect.Effect<typeof Blocks200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/collections": (options?: typeof CollectionsParams.Encoded | undefined) => Effect.Effect<typeof Collections200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/collection_summary/{collection_symbol}": (collectionSymbol: string) => Effect.Effect<typeof CollectionSummary.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/collection_holders/{collection_symbol}": (collectionSymbol: string, options?: typeof CollectionHoldersCollectionSymbolParams.Encoded | undefined) => Effect.Effect<typeof CollectionHoldersCollectionSymbol200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscriptions_in_collection/{collection_symbol}": (collectionSymbol: string, options?: typeof InscriptionsInCollectionCollectionSymbolParams.Encoded | undefined) => Effect.Effect<typeof InscriptionsInCollectionCollectionSymbol200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/on_chain_collections": (options?: typeof OnChainCollectionsParams.Encoded | undefined) => Effect.Effect<typeof OnChainCollections200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/on_chain_collection_summary/{parents}": (parents: string) => Effect.Effect<typeof OnChainCollectionSummary.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/on_chain_collection_holders/{parents}": (parents: string, options?: typeof OnChainCollectionHoldersParentsParams.Encoded | undefined) => Effect.Effect<typeof OnChainCollectionHoldersParents200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/inscriptions_in_on_chain_collection/{parents}": (parents: string, options?: typeof InscriptionsInOnChainCollectionParentsParams.Encoded | undefined) => Effect.Effect<typeof InscriptionsInOnChainCollectionParents200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/search/{search_by_query}": (searchByQuery: string) => Effect.Effect<typeof SearchResult.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/block_icon/{block}": (block: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError>
  readonly "GET/sat_block_icon/{block}": (block: string) => Effect.Effect<void, HttpClientError.HttpClientError | ParseError>
  readonly "GET/block_transfers/{block}": (block: string) => Effect.Effect<typeof BlockTransfersBlock200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "POST/submit_package": (options: typeof SubmitPackageRequest.Encoded) => Effect.Effect<typeof SubmitPackage200.Type, HttpClientError.HttpClientError | ParseError>
  readonly "GET/get_raw_transaction/{txid}": (txid: string) => Effect.Effect<typeof GetRawTransactionTxid200.Type, HttpClientError.HttpClientError | ParseError>
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

// Metadata extraction utilities for on-chain data

/**
 * Extracts artist or author from on-chain metadata
 * Looks for properties containing "artist", "author", "creator", etc.
 *
 * @param onChainMetadata - The on-chain metadata object
 * @returns The artist/author string if found, undefined otherwise
 */
export const extractArtistFromMetadata = (onChainMetadata: unknown): string | undefined => {
  if (!onChainMetadata || typeof onChainMetadata !== 'object') {
    return undefined;
  }

  const metadata = onChainMetadata as Record<string, unknown>;

  // Look for artist/author/creator properties (case-insensitive)
  const artistKeys = Object.keys(metadata).filter(key => {
    const lowerKey = key.toLowerCase();
    return lowerKey.includes('artist') ||
           lowerKey.includes('author') ||
           lowerKey.includes('creator');
  });

  if (artistKeys.length > 0 && artistKeys[0]) {
    const value = metadata[artistKeys[0]];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
};

/**
 * Extracts title, collection, or name from on-chain metadata
 * Prioritizes "title" over "collection" over "name"
 *
 * @param onChainMetadata - The on-chain metadata object
 * @returns The title/collection/name string if found, undefined otherwise
 */
export const extractCollectionTitleFromMetadata = (onChainMetadata: unknown): string | undefined => {
  if (!onChainMetadata || typeof onChainMetadata !== 'object') {
    return undefined;
  }

  const metadata = onChainMetadata as Record<string, unknown>;

  // Look for title properties first (preferred)
  const titleKeys = Object.keys(metadata).filter(key =>
    key.toLowerCase().includes('title')
  );
  if (titleKeys.length > 0 && titleKeys[0]) {
    const value = metadata[titleKeys[0]];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  // Then look for collection properties
  const collectionKeys = Object.keys(metadata).filter(key =>
    key.toLowerCase().includes('collection')
  );
  if (collectionKeys.length > 0 && collectionKeys[0]) {
    const value = metadata[collectionKeys[0]];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  // Finally look for name properties (last priority)
  const nameKeys = Object.keys(metadata).filter(key =>
    key.toLowerCase().includes('name')
  );
  if (nameKeys.length > 0 && nameKeys[0]) {
    const value = metadata[nameKeys[0]];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
};

/**
 * Extracts title or name from on-chain metadata for individual entries or pieces in a collection
 * Searches for "title" and "name" but excludes "collection"
 * Prioritizes "title" over "name"
 *
 * @param onChainMetadata - The on-chain metadata object
 * @returns The title/name string if found, undefined otherwise
 */
export const extractEntryTitleFromMetadata = (onChainMetadata: unknown): string | undefined => {
  if (!onChainMetadata || typeof onChainMetadata !== 'object') {
    return undefined;
  }

  const metadata = onChainMetadata as Record<string, unknown>;

  // Look for title properties first (preferred)
  const titleKeys = Object.keys(metadata).filter(key =>
    key.toLowerCase().includes('title')
  );
  if (titleKeys.length > 0 && titleKeys[0]) {
    const value = metadata[titleKeys[0]];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  // Then look for name properties (but exclude collection-related names)
  const nameKeys = Object.keys(metadata).filter(key => {
    const lowerKey = key.toLowerCase();
    return lowerKey.includes('name') && !lowerKey.includes('collection');
  });
  if (nameKeys.length > 0 && nameKeys[0]) {
    const value = metadata[nameKeys[0]];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
};
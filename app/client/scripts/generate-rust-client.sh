# Generate Rust Client TypeScript types
# This script fixes OpenAPI schema issues and generates clean TypeScript types

echo "🔧 Replacing 'true' with '{}' in API JSON..."
sed -i 's/"schema": true/"schema": {}/g' src/api/rustClient/api.json

echo "🚀 Generating TypeScript client from OpenAPI spec..."
bun x @tim-smart/openapi-gen --spec src/api/rustClient/api.json --name RustClient > src/api/rustClient/RustClient.ts

echo "🩹 Adding missing on_chain_metadata field..."
sed -i '/"metaprotocol": S.optionalWith(S.String, { nullable: true }),/a\  "on_chain_metadata": S.Unknown,' src/api/rustClient/RustClient.ts

echo "✅ Rust client generation complete!"
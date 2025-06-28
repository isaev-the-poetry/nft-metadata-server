# Ton NFT Metadata Server

A lightweight, high-performance NFT metadata server built with NestJS for the TON blockchain. This server provides comprehensive support for both standard NFTs and compressed NFTs (cNFTs) with Merkle tree validation.

## Features
 
- **Compressed NFT (cNFT) Support**: Advanced cNFT functionality with Merkle tree proofs 
- **High Performance**: Built with NestJS and optimized for fast response times
- **Database Integration**: SQLite database with Prisma ORM for efficient data management
- **Docker Ready**: Containerized deployment with Docker and Docker Compose 

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nft-metadata-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5.1. Create initial metadata:
```edit scripts/seed.ts
```

5.2. Seed the database (optional):
```bash
npm run seed
```

### Running the Application

#### Development Mode
```bash
npm run start:dev
```

#### Production Mode
```bash
npm run build
npm run start:prod
```

#### Docker Deployment
```bash
docker-compose up -d
```

## API Documentation

### Standard NFT Endpoints

#### Get Collection Metadata
```
GET /metadata/collection/:id
GET /metadata/collection/:id.json
```

Returns collection metadata including name, description, and image.

**Example Response:**
```json
{
  "name": "Collection Name",
  "description": "Collection Description", 
  "image": "https://example.com/image.png"
}
```

#### Get Token Metadata
```
GET /metadata/collection/:collectionId/token/:tokenId
GET /metadata/collection/:collectionId/token/:tokenId.json
```

Returns individual token metadata with attributes.

**Example Response:**
```json
{
  "name": "Token Name",
  "description": "Token Description",
  "image": "https://example.com/token.png",
  "content_url": "https://example.com/content",
  "attributes": [
    {
      "trait_type": "Rarity",
      "value": "Common"
    }
  ]
}
```

### Compressed NFT (cNFT) Endpoints

#### Get Individual cNFT Item
```
GET /cnft/:collectionId/v1/items/:index
GET /compressed/:collectionId/v1/items/:index
```

Returns a specific cNFT item with Merkle proof for verification.

**Example Response:**
```json
{
  "item": {
    "metadata": {
      "owner": "0:abc123...",
      "individual_content": "base64-encoded-content"
    },
    "data_cell": "base64-encoded-cell",
    "index": "0"
  },
  "root": "merkle-root-hash",
  "proof_cell": "base64-encoded-proof"
}
```

#### Get Multiple cNFT Items
```
GET /cnft/:collectionId/v1/items?offset=0&count=100
GET /compressed/:collectionId/v1/items?offset=0&count=100
```

Returns a paginated list of cNFT items (max 100 per request).

#### Get Collection State
```
GET /cnft/:collectionId/v1/state
GET /compressed/:collectionId/v1/state
```

Returns the current state of the cNFT collection including Merkle tree information.

**Example Response:**
```json
{
  "depth": 10,
  "capacity": "1024",
  "last_index": "99",
  "root": "merkle-root-hash",
  "address": "0:collection-address"
}
```

## Database Schema

The server uses three main database models:

### nft_collection
- `id`: Auto-incremented collection ID
- `name`: Collection name
- `description`: Collection description
- `image`: Collection image URL
- `address`: TON blockchain address (optional)

### nft_token
- `id`: Token ID within collection
- `collection_id`: Reference to collection
- `name`: Token name
- `description`: Token description
- `image`: Token image URL
- `content_url`: Additional content URL
- `attributes`: JSON attributes

### compressed_nft
- `token_id`: Reference to token
- `collection_id`: Reference to collection
- `owner`: TON address of owner
- `individual_content`: Compressed content data

## Development Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build production version
- `npm run start:prod` - Start production server
- `npm run edit` - Open Prisma Studio for database management
- `npm run seed` - Seed database with sample data
- `npm run db::purge` - Clean database

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="file:./dev.db"
PORT=80
NODE_ENV=production
```

### Database Management

The server uses Prisma ORM with SQLite. Key commands:

- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema to database
- `npx prisma studio` - Open database GUI
- `npx prisma migrate dev` - Create and run migrations

## Architecture

- **Framework**: NestJS with TypeScript
- **Database**: SQLite with Prisma ORM
- **Blockchain**: TON integration with `@ton/core`
- **Compression**: Merkle tree implementation for cNFTs
- **Logging**: Built-in request logging middleware

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
 
## Author

© Igor Isaev 2025

---

For support and questions, please open an issue in the repository. 
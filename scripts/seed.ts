/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';
import { Address } from 'ton';

const db = new PrismaClient();

async function main() {
 
  const nft_collection = await db.nft_collection.create({
    data: {
      id: 1,
      name: 'Test Nft Collection Metadata',
      description: ` 🎨 description! 🎨  `,
      image:
        'https://static.paintbowl.art/bowl-logo.png',
      tokens: {
        create: Array(10)
          .fill(0)
          .map((_, index) => ({
            id: index,
            name: `Test Nft Metadata #${index + 1}`,
            attributes: { rarity: 'rare' },
            description: `Replace me for actual metadata`,
            image:  'https://static.paintbowl.art/bowl-neon-purple-blue.png',
            content_url:  'https://static.paintbowl.art/bowl-neon-purple-blue.mp4',
          })),
      },
      address: 'TBA', // contract address for compressed nft. if you not use compressed nft, you can skip this field.
    },
  });

  console.log('Collection metadata created successfully'); 
 
 
  // Next part is used for compresed nft metadata. if you not use compressed nft, you can comment/skip this part.
  // https://github.com/ton-blockchain/TEPs/pull/126
  // https://github.com/ton-community/compressed-nft-contract
  // https://docs.tonconsole.com/tonconsole/nft/cnft

  const owners = [
    'EQD__________________________________________0vo', // Test wallet 1
    'EQB__________________________________________1vo', // Test wallet 2  
    'EQC__________________________________________2vo', // Test wallet 3
    'EQD__________________________________________3vo', // Test wallet 4
    'EQE__________________________________________4vo', // Test wallet 5
    'EQF__________________________________________5vo', // Test wallet 6
    'EQG__________________________________________6vo', // Test wallet 7
    'EQH__________________________________________7vo', // Test wallet 8
    'EQI__________________________________________8vo', // Test wallet 9
    'EQJ__________________________________________9vo', // Test wallet 10
  ]
 
  await Promise.all(
    owners.map(async (owner, index) => 
       db.compressed_nft.create({
        data: {
          collection_id: nft_collection.id,
          token_id: index,
          owner: Address.parse(owner).toRawString(),
          individual_content: index.toString(),
        },
      })
  ),
  );

  console.log('Compressed NFTs created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

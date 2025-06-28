import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('Starting database cleanup...');
  
    
  console.log('Deleting cnft data...');
  await db.$executeRaw`DELETE FROM compressed_nft`;
  console.log('Compressed NFT data deleted successfully');

  console.log('Deleting tokens...');
  await db.$executeRaw`DELETE FROM nft_token`;
  console.log('Tokens deleted successfully');
  
  console.log('Deleting collections...');
  await db.$executeRaw`DELETE FROM nft_collection`;
  console.log('Collections deleted successfully');
  
  console.log('Database cleanup completed!');
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  }); 
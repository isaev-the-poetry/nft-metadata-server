import { PrismaClient } from '@prisma/client';
  
(() => {
  (new PrismaClient()).nft_collection
    .findMany({include: {tokens: true}})
    .then(console.log)
    .catch(console.error);
})() 
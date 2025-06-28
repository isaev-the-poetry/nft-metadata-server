import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller()
export class MetadataController {
  constructor(private readonly database: PrismaService) {}

  @Get()
  getHello(): string {
    return 'NFT Metadata service (c) Igor Isaev 2025';
  }
  
  @Get('metadata/collection/:id')
  @Get('metadata/collection/:id.json')
  async getCollection(@Param('id') id: string) {
    const collection = await this.database.nft_collection.findUnique({
      where: { id: Number(id) },
      select: {
        name: true,
        description: true,
        image: true,
      },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }

  @Get('metadata/collection/:collectionId/token/:tokenId') 
  @Get('metadata/collection/:collectionId/token/:tokenId.json')
  async getToken(
    @Param('collectionId') collectionId: string,
    @Param('tokenId') tokenId: string,
  ) {  
    const cleanTokenId = tokenId.replace('.json', '');
    const token = await this.database.nft_token.findFirst({
      where: {
        id: Number(cleanTokenId),
        collection_id: Number(collectionId),
      },
      select: {
        name: true,
        description: true,
        image: true,
        content_url: true,
        attributes: true,
      },
    });
    if (!token) throw new NotFoundException('Token not found');
    return token;
  }
}

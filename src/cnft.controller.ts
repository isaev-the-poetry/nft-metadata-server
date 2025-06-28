import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MerkleTree } from './merkle.service';
import { beginCell, Address } from 'ton';

@Controller(['cnft', 'compressed'])
export class CnftController {
  constructor(
    private readonly database: PrismaService,
    private readonly merkleTree: MerkleTree,
  ) {}

  @Get(':collectionId/v1/items/:index')
  async getItem(
    @Param('collectionId') collectionId: string,
    @Param('index') index: string,
  ) {
    const tokens = await this.database.compressed_nft.findMany({
      where: {
        token: {
          collection: {
            id: Number(collectionId),
          },
        },
      },
      orderBy: {
        token_id: 'asc',
      },
    });

    const item = tokens[Number(index)]; // TODO продумать
    if (!item) throw new NotFoundException('Item not found');

    const tree = MerkleTree.fromTokens(tokens);

    const data_cell = beginCell()
      .storeAddress(Address.parse(item.owner))
      .storeStringRefTail(item.individual_content)
      .endCell();

    const proof = tree.proofForNode(tree.leafIndexToNodeIndex(Number(index)));
    const proof_cell = this.merkleTree.proofCell({ proof, data: data_cell });

    return {
      item: {
        metadata: {
          owner: item.owner,
          individual_content: beginCell()
            .storeStringTail(item.individual_content) // correct + 
            .endCell()
            .toBoc()
            .toString('base64'),
        },
        data_cell: data_cell.toBoc().toString('base64'),
        index: index,
      },
      root: tree.root().toString(16),
      proof_cell: proof_cell.toBoc().toString('base64'),
    };
  }

  @Get(':collectionId/v1/items')
  async getItems(
    @Param('collectionId') collectionId: string,
    @Query('offset') offset: string,
    @Query('count') count: string,
  ) {
    const offsetNum = parseInt(offset) || 0;
    const countNum = Math.min(parseInt(count), 100) || 100; // Limiting count to 100 items max

    const tokens = await this.database.compressed_nft.findMany({
      where: {
        token: {
          collection: {
            id: Number(collectionId),
          },
        },
      },
      orderBy: {
        token_id: 'asc',
      },
    });

    const tree = MerkleTree.fromTokens(tokens);
    const items = tokens.slice(offsetNum, offsetNum + countNum);

    return {
      items: items.map(({ owner, individual_content, token_id }) => ({
        metadata: {
          owner: owner,
          individual_content: beginCell()
            .storeStringTail(individual_content)
            .endCell()
            .toBoc()
            .toString('base64'),
        },
        data_cell: beginCell()
          .storeAddress(Address.parse(owner))
          .storeStringRefTail(individual_content)
          .endCell()
          .toBoc()
          .toString('base64'),
        index: token_id.toString(), // TODO index or tokenId
      })),
      last_index: (tokens.length - 1).toString(),
      root: tree.root().toString(16),
    };
  }

  @Get(':collectionId/v1/state')
  async getState(@Param('collectionId') collectionId: string) {
    const tokens = await this.database.compressed_nft.findMany({
      where: {
        token: {
          collection: {
            id: Number(collectionId),
          },
        },
      },
      include: {
        token: {
          select: {
            collection: {
              select: {
                address: true,
              },
            },
          },
        },
      },
      orderBy: {
        token_id: 'asc',
      },
    });

    if (tokens.length === 0)
      throw new NotFoundException('Collection not found');

    const tree = MerkleTree.fromTokens(tokens);

    return {
      depth: tree.depth,
      capacity: Math.pow(2, tree.depth).toString(),
      last_index: (tokens.length - 1).toString(),
      root: tree.root().toString(16),
      address: tokens[0].token.collection.address,
    };
  }
}

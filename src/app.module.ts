import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MetadataController } from './metadata.controller'; 
import { PrismaService } from './prisma.service';
import { LoggingMiddleware } from './logging.middleware';
import { MerkleTree, merkleHash } from './merkle.service';
import { CnftController } from './cnft.controller';

@Module({
  imports: [],
  controllers: [MetadataController, CnftController],
  providers: [
    PrismaService,
    {
      provide: MerkleTree,
      useFactory: () => {
        // Initialize with empty array and default depth
        return new MerkleTree([], 0, merkleHash);
      },
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}

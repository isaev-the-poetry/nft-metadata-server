import { Injectable } from '@nestjs/common';
import { Address, beginCell , Builder, Cell} from 'ton';
import { sha256_sync } from 'ton-crypto';

 
interface ProofParams {
    proof: bigint[];
    data: Cell;
}
 
function hash(b: Buffer): Buffer { 
    return sha256_sync(b) as Buffer;
}

export function bufferToInt(b: Buffer): bigint {
    return BigInt('0x' + b.toString('hex'));
}

export function hashToInt(b: Buffer): bigint {
    return bufferToInt(hash(b));
}
 
const merkleHash = (a: bigint, b: bigint) => bufferToInt(beginCell().storeUint(a, 256).storeUint(b, 256).endCell().hash());
export { merkleHash };
 

@Injectable()
export class MerkleTree {
    constructor(public readonly buf: bigint[], public readonly depth: number, public readonly hash: (a: bigint, b: bigint) => bigint) {}

    static fromLeaves(leaves: bigint[], hash: (a: bigint, b: bigint) => bigint = merkleHash) {
        const depth = Math.log2(leaves.length);
        if (!Number.isInteger(depth)) {
            throw new Error('Bad leaves array');
        }
        const buf = new Array<bigint>(leaves.length * 2);
        for (let i = 0; i < leaves.length; i++) {
            buf[leaves.length + i] = leaves[i];
        }
        for (let i = depth - 1; i >= 0; i--) {
            for (let j = Math.pow(2, i); j < Math.pow(2, i+1); j++) {
                buf[j] = hash(buf[2*j], buf[2*j+1]);
            }
        }
        return new MerkleTree(buf, depth, hash);
    }
        
    static fromTokens(tokens: { owner: string; individual_content: string }[]) {
        const nftDataCells = tokens.map(
          ({ owner, individual_content }): Cell =>
            beginCell()
              .storeAddress(Address.parse(owner))
              .storeStringRefTail(individual_content)
              .endCell(),
        );
    
        const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(nftDataCells.length)));
        const paddingCells: bigint[] = Array(
          nextPowerOf2 - nftDataCells.length,
        ).fill(0n) as bigint[];
    
        return MerkleTree.fromLeaves([
          ...nftDataCells.map((cell) => bufferToInt(cell.hash())),
          ...paddingCells,
        ]); 
      }

    leafIdxToNodeIdx(i: number) {
        return Math.pow(2, this.depth) + i;
    }

    root() {
        return this.buf[1];
    }

    leaf(i: number) {
        return this.buf[Math.pow(2, this.depth) + i];
    }

    leafIndexToNodeIndex(i: number | bigint) {
        return Math.pow(2, this.depth) + Number(i);
    }

    node(i: number) {
        return this.buf[i];
    }

    proofWithIndices(i: number) {
        const proof: { index: number, value: bigint }[] = [];
        for (let j = 0; j < this.depth; j++) {
            i ^= 1;
            proof.push({ value: this.node(i), index: i });
            i >>= 1;
        }
        return proof;
    }

    proofForNode(i: number): bigint[] {
        return this.proofWithIndices(i).map(v => v.value);
    }

    generateUpdate(leaves: bigint[]) {
        const totalLeaves = 1 << this.depth;
        if (leaves.length >= totalLeaves) {
            throw new Error('Cannot fully update the tree');
        }
        const from = totalLeaves - leaves.length;
        const nodes = leaves.map((l, i) => ({ index: totalLeaves + from + i, value: l, depth: this.depth }));
        const updated = false;
        do {
            if (nodes.length < 2) {
                break;
            }
            for (let i = 0; i < nodes.length - 1; i++) {
                if (nodes[i].depth === nodes[i+1].depth && (nodes[i].index ^ nodes[i+1].index) === 1) {
                    nodes.splice(i, 2, { index: nodes[i].index >> 1, value: this.hash(nodes[i].value, nodes[i+1].value), depth: nodes[i].depth - 1 });
                }
            }
        } while (updated);
        const proof = this.proofWithIndices(totalLeaves + from).filter(p => nodes.findIndex(n => n.index === p.index) === -1);
        return {
            nodes,
            proof,
        };
    }

    proofCell(params: ProofParams): Cell {
        const pb: Builder[] = params.proof.filter((e): e is bigint => e !== undefined)
            .map((e): Builder => beginCell().storeUint(e, 256));
        let proofCell = new Cell();
        while (pb.length > 0) {
            proofCell = pb.pop()!.storeRef(proofCell).endCell();
        } 
        return beginCell().storeRef(params.data).storeRef(proofCell).endCell();
    }

}

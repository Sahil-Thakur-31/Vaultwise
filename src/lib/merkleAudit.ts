import { MerkleAuditAction, MerkleAuditBlock } from "@/types/vault";

const GENESIS_PREVIOUS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Computes a SHA-256 hex digest using WebCrypto API.
 */
export async function sha256Hex(data: string): Promise<string> {
  const cryptoObj = typeof window !== "undefined" ? window.crypto : globalThis.crypto;
  const buffer = new TextEncoder().encode(data);
  const hashBuffer = await cryptoObj.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Creates the Genesis Block for a fresh cryptographic vault ledger.
 */
export async function createGenesisBlock(): Promise<MerkleAuditBlock> {
  const timestamp = new Date().toISOString();
  const itemHash = await sha256Hex("GENESIS_INIT_ZERO_KNOWLEDGE_ENCLAVE");
  const blockContent = `0|${timestamp}|VAULT_UNLOCKED|System Enclave|${itemHash}|${GENESIS_PREVIOUS_HASH}`;
  const blockHash = await sha256Hex(blockContent);

  return {
    index: 0,
    timestamp,
    action: "VAULT_UNLOCKED",
    actor: "System Enclave",
    itemHash,
    previousHash: GENESIS_PREVIOUS_HASH,
    blockHash,
    merkleRoot: blockHash,
  };
}

/**
 * Appends a new tamper-evident block to the cryptographic chain.
 * Each block mathematically binds to the exact hash of the previous block.
 */
export async function appendAuditBlock(
  chain: MerkleAuditBlock[],
  action: MerkleAuditAction,
  actor: string,
  payloadData: unknown
): Promise<MerkleAuditBlock[]> {
  const parentChain = chain.length > 0 ? chain : [await createGenesisBlock()];
  const previousBlock = parentChain[parentChain.length - 1];

  const payloadString = typeof payloadData === "string" ? payloadData : JSON.stringify(payloadData || {});
  const itemHash = await sha256Hex(payloadString);
  const timestamp = new Date().toISOString();
  const nextIndex = previousBlock.index + 1;

  const blockContent = `${nextIndex}|${timestamp}|${action}|${actor}|${itemHash}|${previousBlock.blockHash}`;
  const blockHash = await sha256Hex(blockContent);

  // Merkle cumulative root combining prior root and current block
  const merkleRoot = await sha256Hex(`${previousBlock.merkleRoot}:${blockHash}`);

  const newBlock: MerkleAuditBlock = {
    index: nextIndex,
    timestamp,
    action,
    actor,
    itemHash,
    previousHash: previousBlock.blockHash,
    blockHash,
    merkleRoot,
  };

  return [...parentChain, newBlock];
}

export interface ChainVerificationResult {
  isValid: boolean;
  blockCount: number;
  genesisHash: string;
  latestMerkleRoot: string;
  tamperedIndex?: number;
  failureReason?: string;
}

/**
 * Verifies the mathematical integrity of the entire audit hash chain.
 * Detects any retroactively modified blocks, altered hashes, or inserted records.
 */
export async function verifyChainIntegrity(
  chain: MerkleAuditBlock[]
): Promise<ChainVerificationResult> {
  if (!chain || chain.length === 0) {
    return {
      isValid: true,
      blockCount: 0,
      genesisHash: GENESIS_PREVIOUS_HASH,
      latestMerkleRoot: GENESIS_PREVIOUS_HASH,
    };
  }

  // 1. Verify Genesis Block
  const genesis = chain[0];
  if (genesis.index !== 0 || genesis.previousHash !== GENESIS_PREVIOUS_HASH) {
    return {
      isValid: false,
      blockCount: chain.length,
      genesisHash: genesis.previousHash,
      latestMerkleRoot: "",
      tamperedIndex: 0,
      failureReason: "Genesis block has invalid previous hash or index.",
    };
  }

  // Re-verify genesis hash
  const expectedGenesisHash = await sha256Hex(
    `0|${genesis.timestamp}|${genesis.action}|${genesis.actor}|${genesis.itemHash}|${GENESIS_PREVIOUS_HASH}`
  );
  if (genesis.blockHash !== expectedGenesisHash) {
    return {
      isValid: false,
      blockCount: chain.length,
      genesisHash: genesis.previousHash,
      latestMerkleRoot: "",
      tamperedIndex: 0,
      failureReason: "Genesis block hash signature does not match computed digest.",
    };
  }

  // 2. Verify all subsequent blocks in sequence
  for (let i = 1; i < chain.length; i++) {
    const current = chain[i];
    const prev = chain[i - 1];

    // Check index sequence
    if (current.index !== prev.index + 1) {
      return {
        isValid: false,
        blockCount: chain.length,
        genesisHash: genesis.blockHash,
        latestMerkleRoot: prev.merkleRoot,
        tamperedIndex: i,
        failureReason: `Block index sequence broken at block #${current.index} (expected #${prev.index + 1}).`,
      };
    }

    // Check hash continuity
    if (current.previousHash !== prev.blockHash) {
      return {
        isValid: false,
        blockCount: chain.length,
        genesisHash: genesis.blockHash,
        latestMerkleRoot: prev.merkleRoot,
        tamperedIndex: i,
        failureReason: `Cryptographic link severed at block #${current.index}. Previous hash does not match prior block hash.`,
      };
    }

    // Recompute block digest
    const expectedBlockHash = await sha256Hex(
      `${current.index}|${current.timestamp}|${current.action}|${current.actor}|${current.itemHash}|${current.previousHash}`
    );
    if (current.blockHash !== expectedBlockHash) {
      return {
        isValid: false,
        blockCount: chain.length,
        genesisHash: genesis.blockHash,
        latestMerkleRoot: prev.merkleRoot,
        tamperedIndex: i,
        failureReason: `Block #${current.index} hash digest mismatch: payload has been tampered with or modified.`,
      };
    }
  }

  const latestBlock = chain[chain.length - 1];
  return {
    isValid: true,
    blockCount: chain.length,
    genesisHash: genesis.blockHash,
    latestMerkleRoot: latestBlock.merkleRoot,
  };
}


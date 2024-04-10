import { type Tag } from "arweave/web/lib/transaction";
import { type connect } from "@permaweb/aoconnect";

/**
 * Dummy ID
 */
export const Id = "0000000000000000000000000000000000000000001";

/**
 * Dummy owner
 */
export const Owner = "0000000000000000000000000000000000000000002";

/**
 * Token info interface
 */
export interface TokenInfo {
  Name?: string;
  Ticker?: string;
  Denomination: bigint;
  Logo?: string;
}

/**
 * ao connect() instance
 */
export type AoInstance = ReturnType<typeof connect>;

/**
 * Find the value for a tag name
 * @param tagName Name of the tag to find
 * @param tags Tags to find the value in
 */
export const getTagValue = (tagName: string, tags: Tag[]) =>
  tags.find((t) => t.name === tagName)?.value;

/**
 * Returned message object(s) from dryRun
 */
export interface Message {
  Anchor: string;
  Tags: Tag[];
  Target: string;
  Data: string;
}
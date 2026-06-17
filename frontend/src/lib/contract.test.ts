import { describe, it, expect } from "vitest";
import { ARC_USDC_ADDRESS, DEFAULT_PRICE, getMicroTuneAddress } from "@/lib/contract";

describe("contract config", () => {
  it("returns the configured contract address", () => {
    const addr = getMicroTuneAddress();
    expect(addr).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("exposes a USDC address", () => {
    expect(ARC_USDC_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("has a default listen price of 0.05 USDC (18 decimals)", () => {
    expect(DEFAULT_PRICE).toBe("50000000000000000");
  });
});

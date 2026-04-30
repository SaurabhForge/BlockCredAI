import assert from "node:assert/strict";
import test from "node:test";
import { requireText, requireUnixTimestamp, requireWalletAddress } from "./validation";

test("requireWalletAddress accepts valid EVM addresses", () => {
  const address = "0x0000000000000000000000000000000000000001";
  assert.equal(requireWalletAddress(address, "employeeAddress"), address);
});

test("requireWalletAddress rejects invalid addresses", () => {
  assert.throws(
    () => requireWalletAddress("not-a-wallet", "employeeAddress"),
    /valid wallet address/
  );
});

test("requireText trims and normalizes whitespace", () => {
  assert.equal(requireText("  Senior   Engineer  ", "jobDetails"), "Senior Engineer");
});

test("requireText enforces length limits", () => {
  assert.throws(() => requireText("abc", "claimedExperience", { min: 10 }), /at least 10/);
  assert.throws(() => requireText("abcdef", "claimedExperience", { max: 5 }), /5 characters/);
});

test("requireUnixTimestamp accepts positive integer timestamps", () => {
  assert.equal(requireUnixTimestamp("1714521600", "startDate"), 1714521600);
});

test("requireUnixTimestamp rejects non-positive or non-integer values", () => {
  assert.throws(() => requireUnixTimestamp("0", "startDate"), /positive Unix timestamp/);
  assert.throws(() => requireUnixTimestamp("10.5", "startDate"), /positive Unix timestamp/);
});

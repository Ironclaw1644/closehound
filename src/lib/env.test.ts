import { describe, it, expect } from "vitest";
import { isMockMode } from "./env";

describe("env", () => {
  it("isMockMode returns a boolean", () => {
    expect(typeof isMockMode()).toBe("boolean");
  });
});

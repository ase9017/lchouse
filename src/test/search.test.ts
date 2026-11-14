import { describe, expect, it } from "vitest";
import { matchesWords, queryWords, searchText } from "@/lib/search";

const camera = searchText({ id: "00004", n: "كاميرا داهوا 2 ميجا عادية خارجي", m: "DH-HAC-B5E20P", b: "dahua", d: "" });
const found = (query: string) => matchesWords(camera, queryWords(query));

describe("Catalogue search", () => {
  it("matches Arabic words regardless of spelling variants and word order", () => {
    expect(found("خارجى داهوا")).toBe(true);
    expect(found("عاديه")).toBe(true);
  });
  it("matches model numbers typed with or without dashes", () => {
    expect(found("dh-hac-b5e20p")).toBe(true);
    expect(found("HACB5E20P")).toBe(true);
    expect(found("٢ ميجا")).toBe(true);
  });
  it("requires every word to match", () => {
    expect(found("داهوا داخلي")).toBe(false);
    expect(found("   ")).toBe(true);
  });
});

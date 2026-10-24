import { describe, expect, it } from "vitest";
import { isCompanyEmail, hasCompanyRole } from "@/lib/company-access";
describe("Company quote access", () => {
  it("recognizes the specified company email only", () => { expect(isCompanyEmail("infolcrhouse@gmail.com")).toBe(true); expect(isCompanyEmail("visitor@example.com")).toBe(false); });
  it("requires an administrator role, not merely a signed-in account", () => { expect(hasCompanyRole([])).toBe(false); expect(hasCompanyRole(["user"])).toBe(false); expect(hasCompanyRole(["admin"])).toBe(true); });
});
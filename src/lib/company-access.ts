export const COMPANY_EMAIL = "infolcrhouse@gmail.com";
export function isCompanyEmail(email: string) { return email.trim().toLowerCase() === COMPANY_EMAIL; }
export function hasCompanyRole(roles: string[]) { return roles.includes("admin"); }
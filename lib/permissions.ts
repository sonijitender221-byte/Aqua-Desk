import type { UserRole } from "@prisma/client";

const permissions: Record<UserRole, string[]> = {
  SUPER_ADMIN: ["*"],
  OWNER: ["*"],
  BRANCH_MANAGER: ["customers:write", "services:write", "technicians:read", "inventory:write", "finance:write", "reports:read"],
  STAFF: ["customers:write", "services:write", "inventory:read", "finance:read"],
  TECHNICIAN: ["services:assigned", "services:update", "customers:read"],
  CUSTOMER: ["portal:read", "portal:write"],
};

export function can(role: UserRole, permission: string) {
  return permissions[role].includes("*") || permissions[role].includes(permission);
}

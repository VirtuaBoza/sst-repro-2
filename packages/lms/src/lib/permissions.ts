import { schema } from "@stacks-ils-ion/core/sql";

export type Perm =
  | "editItems"
  | "editPatrons"
  | "editPolicy"
  | "editUsers"
  | "editLibraries"
  | "editOrgs";

export function roleCan(role: schema.OrgRole | undefined, perm: Perm): boolean {
  if (role === "ADMIN") return true;
  switch (perm) {
    case "editItems":
    case "editPatrons":
    case "editPolicy":
      return role === "STAFF";
    default:
      return false;
  }
}

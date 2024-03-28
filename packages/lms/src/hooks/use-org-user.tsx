"use client";

import { Perm, roleCan } from "@/lib/permissions";
import { schema } from "@stacks-ils-ion/core/sql";
import React, { useCallback, useContext } from "react";

export interface OrgUserContext {
  can: (perm: Perm) => boolean;
  organization: Pick<schema.Organization, "id" | "name">;
  role: schema.OrgRole;
}
const orgUserContext = React.createContext<OrgUserContext | null>(null);

export function useOrgUser() {
  const context = useContext(orgUserContext);
  if (!context) throw new Error("No org user role.");
  return context;
}

export function OrgUserContextProvider({
  children,
  organization,
  role,
}: {
  children?: React.ReactNode;
} & Pick<OrgUserContext, "organization" | "role">) {
  const can = useCallback<OrgUserContext["can"]>(
    (perm) => roleCan(role, perm),
    [role]
  );

  return (
    <orgUserContext.Provider
      value={{
        can,
        organization,
        role,
      }}
    >
      {children}
    </orgUserContext.Provider>
  );
}

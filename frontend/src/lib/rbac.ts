/**
 * Centralized RBAC configuration.
 * ALL role definitions and permission checks live here — do not hardcode roles elsewhere.
 */

// ─── Role Constants ───────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN: 'ADMIN',
  PR_REQUESTOR: 'PR_REQUESTER',
  PR_APPROVER: 'PR_APPROVER',
  PO_REQUESTOR: 'PO_REQUESTER',
  PO_APPROVER: 'PO_APPROVER',
} as const;

export type AppRole = typeof ROLES[keyof typeof ROLES];

// ─── Page Access Rules ────────────────────────────────────────────────────────
export const PAGE_ROLES: Record<string, AppRole[]> = {
  '/pr':         [ROLES.ADMIN, ROLES.PR_REQUESTOR, ROLES.PR_APPROVER],
  '/pr/new':     [ROLES.ADMIN, ROLES.PR_REQUESTOR],
  '/po':         [ROLES.ADMIN, ROLES.PO_REQUESTOR, ROLES.PO_APPROVER],
  '/po/new':     [ROLES.ADMIN, ROLES.PO_REQUESTOR],
  '/approvals':  [ROLES.ADMIN, ROLES.PR_APPROVER, ROLES.PO_APPROVER],
  '/suppliers':  [ROLES.ADMIN, ROLES.PO_REQUESTOR],
  '/users':      [ROLES.ADMIN],
};

// ─── Navigation Items (with role filter) ─────────────────────────────────────
export const NAV_ITEMS = [
  {
    name: 'Dashboard',
    path: '/',
    roles: null, // visible to all authenticated users
  },
  {
    name: 'Purchase Requests',
    path: '/pr',
    roles: [ROLES.ADMIN, ROLES.PR_REQUESTOR, ROLES.PR_APPROVER],
  },
  {
    name: 'Purchase Orders',
    path: '/po',
    roles: [ROLES.ADMIN, ROLES.PO_REQUESTOR, ROLES.PO_APPROVER],
  },
  {
    name: 'Approvals',
    path: '/approvals',
    roles: [ROLES.ADMIN, ROLES.PR_APPROVER, ROLES.PO_APPROVER],
  },
  {
    name: 'Suppliers',
    path: '/suppliers',
    roles: [ROLES.ADMIN, ROLES.PO_REQUESTOR],
  },
  {
    name: 'Users',
    path: '/users',
    roles: [ROLES.ADMIN],
  },
] as const;

// ─── Action-Level Permissions ─────────────────────────────────────────────────
export const ACTIONS = {
  // PR
  PR_CREATE:  [ROLES.ADMIN, ROLES.PR_REQUESTOR],
  PR_EDIT:    [ROLES.ADMIN, ROLES.PR_REQUESTOR],
  PR_APPROVE: [ROLES.ADMIN, ROLES.PR_APPROVER],

  // PO
  PO_CREATE:  [ROLES.ADMIN, ROLES.PO_REQUESTOR],
  PO_EDIT:    [ROLES.ADMIN, ROLES.PO_REQUESTOR],
  PO_APPROVE: [ROLES.ADMIN, ROLES.PO_APPROVER],

  // Admin
  USER_MANAGE:     [ROLES.ADMIN],
  SUPPLIER_CREATE: [ROLES.ADMIN],
} as const;

export type ActionKey = keyof typeof ACTIONS;

// ─── Helper Functions ─────────────────────────────────────────────────────────

/** Returns true if the given role is allowed for the page path. */
export const canAccessPage = (role: string | undefined, path: string): boolean => {
  if (!role) return false;
  const allowed = PAGE_ROLES[path];
  if (!allowed) return true; // page not restricted (e.g. Dashboard)
  return allowed.includes(role as AppRole);
};

/** Returns true if the given role is allowed to perform the action. */
export const canDo = (role: string | undefined, action: ActionKey): boolean => {
  if (!role) return false;
  return (ACTIONS[action] as readonly string[]).includes(role);
};

/** Returns a list of accessible nav items for a given role. */
export const getNavItems = (role: string | undefined) =>
  NAV_ITEMS.filter(item => item.roles === null || (role && (item.roles as readonly string[]).includes(role)));

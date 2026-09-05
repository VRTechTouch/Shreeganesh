export type Permission =
  | "all"
  | "mandal.manage"
  | "members.view"
  | "members.manage"
  | "subusers.manage"
  | "finance.view"
  | "finance.create"
  | "reports.export";

export interface PermissionDefinition {
  id: Permission;
  labelEn: string;
  labelMr: string;
  descriptionEn: string;
  descriptionMr: string;
  category: "finance" | "members" | "administration";
}

export const AVAILABLE_PERMISSIONS: PermissionDefinition[] = [
  {
    id: "finance.view",
    labelEn: "View Finance & Ledger",
    labelMr: "हिशोब व वर्गणी पाहणे",
    descriptionEn: "Access to view Vargani donations, daily expenses, and ledgers",
    descriptionMr: "वर्गणी, देणग्या आणि दैनंदिन खर्चाची नोंद पाहण्याची परवानगी",
    category: "finance",
  },
  {
    id: "finance.create",
    labelEn: "Record Donations & Expenses",
    labelMr: "वर्गणी व खर्च नोंदवणे",
    descriptionEn: "Ability to record new donations, generate receipts, and log expenses",
    descriptionMr: "नवीन वर्गणी पावती फाडणे आणि खर्च नोंदवण्याची परवानगी",
    category: "finance",
  },
  {
    id: "members.view",
    labelEn: "View Committee Members",
    labelMr: "समिती सदस्य पाहणे",
    descriptionEn: "View the list and contact details of festival committee members",
    descriptionMr: "मंडळाच्या सर्व पदाधिकाऱ्यांची आणि सदस्यांची यादी पाहणे",
    category: "members",
  },
  {
    id: "members.manage",
    labelEn: "Manage Committee Members",
    labelMr: "समिती सदस्य व्यवस्थापन",
    descriptionEn: "Add, edit, assign positions, and delete committee members",
    descriptionMr: "नवीन सदस्य जोडणे, पद देणे किंवा बदलण्याची परवानगी",
    category: "members",
  },
  {
    id: "reports.export",
    labelEn: "Export Reports & CSV",
    labelMr: "अहवाल व CSV डाउनलोड",
    descriptionEn: "Download audit summaries and export financial tables to CSV/Excel",
    descriptionMr: "ऑडिट अहवाल आणि एक्सेल/CSV फाईल डाऊनलोड करण्याची परवानगी",
    category: "finance",
  },
  {
    id: "subusers.manage",
    labelEn: "Manage Sub-Users",
    labelMr: "उप-वापरकर्ते व्यवस्थापन",
    descriptionEn: "Create sub-user credentials and assign module permissions",
    descriptionMr: "नवीन उप-वापरकर्ते तयार करणे व त्यांना अधिकार देणे",
    category: "administration",
  },
];

export function hasPermission(
  userRole: string,
  userPermissions: string[] | string,
  requiredPermission: Permission
): boolean {
  if (userRole === "super_admin" || userRole === "mandal_admin") {
    return true;
  }

  let perms: string[] = [];
  if (Array.isArray(userPermissions)) {
    perms = userPermissions;
  } else if (typeof userPermissions === "string") {
    try {
      perms = JSON.parse(userPermissions);
    } catch {
      perms = [];
    }
  }

  if (perms.includes("all")) return true;
  return perms.includes(requiredPermission);
}

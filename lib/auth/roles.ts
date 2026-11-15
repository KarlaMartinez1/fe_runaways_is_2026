export type Role = "TENANT" | "OWNER" | "ADMIN";
export const roleLabels: Record<Role, string> = {
  TENANT: "Arrendatario",
  OWNER: "Arrendador",
  ADMIN: "Administrador",
};

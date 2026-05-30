export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
};
export type UserRole = "user" | "admin" | "sysadmin";

import { requireSuperAdmin } from "@/lib/authz";
import { listBackstageUsers } from "./data";
import { UsersList } from "./users-list";

export default async function UsersPage() {
  const session = await requireSuperAdmin();
  const users = await listBackstageUsers();

  return <UsersList users={users} currentUserId={session.user.id} />;
}

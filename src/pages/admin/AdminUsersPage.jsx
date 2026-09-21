import { useMemo, useState } from "react";
import { Pencil, Plus, Power, Trash2, UserCheck, Users } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import RowMenu from "@/components/admin/RowMenu";
import TableFilters from "@/components/admin/TableFilters";
import UserFormDialog from "@/components/admin/UserFormDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useReservations } from "@/hooks/useReservations";
import { useToast } from "@/hooks/useToast";
import { useUsers } from "@/hooks/useUsers";
import { getInitials, roleLabel } from "@/utils/format";

const roleFilter = [
  { value: "any", label: "All roles" },
  { value: "employee", label: "Employees" },
  { value: "admin", label: "Administrators" },
];
const statusFilter = [
  { value: "any", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// Adds a trailing count to each option, e.g. "Employees (6)".
const withCounts = (options, users, field) =>
  options.map((o) => ({
    value: o.value,
    label: `${o.label} (${o.value === "any" ? users.length : users.filter((u) => u[field] === o.value).length})`,
  }));

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const { users, addUser, updateUser, deleteUser } = useUsers();
  const { reservations } = useReservations();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("any");
  const [status, setStatus] = useState("any");
  const [form, setForm] = useState(null); // { user } — user null means "add"
  const [toDelete, setToDelete] = useState(null);

  const upcomingByUser = useMemo(() => {
    const map = {};
    reservations.forEach((r) => {
      if (r.status === "upcoming") map[r.userId] = (map[r.userId] ?? 0) + 1;
    });
    return map;
  }, [reservations]);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (role === "any" || u.role === role) &&
          (status === "any" || u.status === status) &&
          `${u.name} ${u.email} ${u.department}`.toLowerCase().includes(query.toLowerCase())
      ),
    [users, query, role, status]
  );

  const roleOptions = useMemo(() => withCounts(roleFilter, users, "role"), [users]);
  const statusOptions = useMemo(() => withCounts(statusFilter, users, "status"), [users]);

  const handleSubmit = (values) => {
    if (form.user) {
      updateUser(form.user.id, values);
      notify("User updated", { description: `${values.name} was saved.` });
    } else {
      addUser(values);
      notify("User added", { description: `${values.name} can now sign in.` });
    }
    setForm(null);
  };

  const toggleStatus = (u) => {
    const next = u.status === "active" ? "inactive" : "active";
    updateUser(u.id, { status: next });
    notify(next === "active" ? "User reactivated" : "User deactivated", {
      description: `${u.name} is now ${next}.`,
      variant: next === "active" ? "success" : "info",
    });
  };

  const requestDelete = (u) => {
    const count = upcomingByUser[u.id] ?? 0;
    if (count > 0) {
      notify("Can't delete this user yet", {
        description: `${u.name} has ${count} upcoming ${count === 1 ? "reservation" : "reservations"}. Cancel them first, or deactivate the account instead.`,
        variant: "danger",
      });
      return;
    }
    setToDelete(u);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        description="Manage who can sign in, what they can do, and whether their account is active."
        actions={
          <Button onClick={() => setForm({ user: null })}>
            <Plus /> Add user
          </Button>
        }
      />

      <TableFilters
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search name, email or department…"
        searchLabel="Search users"
        summary={`${filtered.length} of ${users.length} users`}
        filters={[
          { key: "role", label: "Role", value: role, onChange: setRole, options: roleOptions },
          { key: "status", label: "Status", value: status, onChange: setStatus, options: statusOptions },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users match" description="Try a different search or filter." />
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Job and department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Upcoming</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => {
                const isSelf = u.id === me.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar className="size-10">
                          <AvatarFallback className="bg-tint text-sm font-semibold text-foreground">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">
                            {u.name}
                            {isSelf && <span className="ml-2 text-sm font-normal text-muted-foreground">(you)</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{u.jobTitle}</p>
                      <p className="text-sm text-muted-foreground">{u.department}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "accent" : "neutral"}>{roleLabel(u.role)}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} />
                    </TableCell>
                    <TableCell>{upcomingByUser[u.id] ?? 0}</TableCell>
                    <TableCell>
                      <RowMenu
                        label={`Actions for ${u.name}`}
                        items={[
                          { label: "Edit user", icon: Pencil, onSelect: () => setForm({ user: u }) },
                          {
                            label: u.status === "active" ? "Deactivate account" : "Reactivate account",
                            icon: u.status === "active" ? Power : UserCheck,
                            hidden: isSelf,
                            onSelect: () => toggleStatus(u),
                          },
                          {
                            label: "Delete user",
                            icon: Trash2,
                            destructive: true,
                            hidden: isSelf,
                            separatorBefore: true,
                            onSelect: () => requestDelete(u),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {form && (
        <UserFormDialog
          open
          onOpenChange={(open) => !open && setForm(null)}
          user={form.user}
          users={users}
          isSelf={form.user?.id === me.id}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete ${toDelete?.name}?`}
        description="They will no longer be able to sign in. Their past reservations stay on record."
        confirmLabel="Delete user"
        cancelLabel="Keep user"
        onConfirm={() => {
          deleteUser(toDelete.id);
          notify("User deleted", { description: `${toDelete.name} was removed.`, variant: "danger" });
          setToDelete(null);
        }}
      />
    </div>
  );
}

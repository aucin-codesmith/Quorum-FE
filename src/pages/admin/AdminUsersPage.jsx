import { useState } from "react";
import { Pencil, Plus, Power, Trash2, UserCheck, Users } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DataPagination from "@/components/common/DataPagination";
import { ErrorState, TableSkeleton } from "@/components/common/QueryState";
import RowMenu from "@/components/admin/RowMenu";
import TableFilters from "@/components/admin/TableFilters";
import UserFormDialog from "@/components/admin/UserFormDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStats } from "@/hooks/useStats";
import { useToast } from "@/hooks/useToast";
import { useUserMutations, useUsers } from "@/hooks/useUsers";
import { errorMessage } from "@/lib/formErrors";
import { getInitials, roleLabel } from "@/utils/format";

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const { notify } = useToast();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("any");
  const [status, setStatus] = useState("any");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // { user } — user null means "add"
  const [toDelete, setToDelete] = useState(null);

  const q = useDebouncedValue(query.trim());
  const { users, meta, isLoading, isFetching, isError, error, refetch } = useUsers({
    page,
    limit: PAGE_SIZE,
    q,
    role: role === "any" ? undefined : role,
    status: status === "any" ? undefined : status,
    sort: "name",
  });
  const { stats } = useStats();
  const { addUser, updateUser, deleteUser } = useUserMutations();

  // If the current page no longer exists (e.g. its last row was deleted or filtered out), step back.
  // Adjusting state during render is React's supported pattern for state derived from other data.
  if (meta && page > meta.totalPages) setPage(meta.totalPages);

  // Option labels carry counts from the overview endpoint.
  const c = stats?.users;
  const withCount = (label, n) => (c ? `${label} (${n})` : label);
  const roleOptions = [
    { value: "any", label: withCount("All roles", c?.total) },
    { value: "employee", label: withCount("Employees", c && c.total - c.admins) },
    { value: "admin", label: withCount("Administrators", c?.admins) },
  ];
  const statusOptions = [
    { value: "any", label: withCount("All statuses", c?.total) },
    { value: "active", label: withCount("Active", c?.active) },
    { value: "inactive", label: withCount("Inactive", c && c.total - c.active) },
  ];

  // Thrown errors go back to the dialog, which shows them on the right field.
  const handleSubmit = async (values) => {
    if (form.user) {
      await updateUser(form.user.id, values);
      notify("User updated", { description: `${values.name} was saved.` });
    } else {
      await addUser(values);
      notify("User added", { description: `${values.name} can now sign in.` });
    }
    setForm(null);
  };

  const toggleStatus = async (u) => {
    const next = u.status === "active" ? "inactive" : "active";
    try {
      await updateUser(u.id, { status: next });
      notify(next === "active" ? "User reactivated" : "User deactivated", {
        description: `${u.name} is now ${next}.`,
        variant: next === "active" ? "success" : "info",
      });
    } catch (err) {
      notify("Could not update the user", { description: errorMessage(err), variant: "danger" });
    }
  };

  const requestDelete = (u) => {
    if (u.upcomingReservations > 0) {
      notify("Can't delete this user yet", {
        description: `${u.name} has ${u.upcomingReservations} upcoming ${u.upcomingReservations === 1 ? "reservation" : "reservations"}. Cancel them first, or deactivate the account instead.`,
        variant: "danger",
      });
      return;
    }
    setToDelete(u);
  };

  const confirmDelete = async () => {
    const u = toDelete;
    setToDelete(null);
    try {
      await deleteUser(u.id);
      notify("User deleted", { description: `${u.name} was removed.`, variant: "danger" });
    } catch (err) {
      // e.g. 409: past reservations still reference the user.
      notify("Could not delete the user", { description: errorMessage(err), variant: "danger" });
    }
  };

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(1);
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
        onQueryChange={resetPage(setQuery)}
        searchPlaceholder="Search name, email or department…"
        searchLabel="Search users"
        summary={meta ? `${meta.total} ${meta.total === 1 ? "user" : "users"}` : undefined}
        filters={[
          { key: "role", label: "Role", value: role, onChange: resetPage(setRole), options: roleOptions },
          { key: "status", label: "Status", value: status, onChange: resetPage(setStatus), options: statusOptions },
        ]}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} title="We couldn't load the users" />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users match" description="Try a different search or filter." />
      ) : (
        <div className="space-y-6">
          <Card className={`py-0 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
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
                {users.map((u) => {
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
                        <p className="text-foreground">{u.jobTitle || "—"}</p>
                        <p className="text-sm text-muted-foreground">{u.department}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "accent" : "neutral"}>{roleLabel(u.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={u.status} />
                      </TableCell>
                      <TableCell>{u.upcomingReservations}</TableCell>
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
          <DataPagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      {form && (
        <UserFormDialog
          open
          onOpenChange={(open) => !open && setForm(null)}
          user={form.user}
          isSelf={form.user?.id === me.id}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`Delete ${toDelete?.name}?`}
        description="They will no longer be able to sign in. A user with reservations on record cannot be deleted; deactivate the account instead."
        confirmLabel="Delete user"
        cancelLabel="Keep user"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Search, MoreVertical, Eye, Pencil, Plus, Trash2 } from "lucide-react";

/* ------------------------------ Types ------------------------------ */
type Role = "Admin" | "Manager" | "Staff" | "Viewer";
type Status = "Active" | "Suspended" | "Invited";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  createdAt: string; // ISO
};

type UserFormValues = Omit<User, "id" | "createdAt">;

/* ------------------------------ Seed Data ------------------------------ */
const seedUsers: User[] = [
  { id: "U-1001", name: "Nadia Rehman", email: "nadia@glaxit.com", role: "Admin",   status: "Active",    createdAt: "2025-04-02" },
  { id: "U-1002", name: "Hamza Ali",    email: "hamza@glaxit.com", role: "Manager", status: "Active",    createdAt: "2025-05-10" },
  { id: "U-1003", name: "Saba Khan",    email: "saba@glaxit.com",  role: "Staff",   status: "Invited",   createdAt: "2025-05-21" },
  { id: "U-1004", name: "Usman Tariq",  email: "usman@glaxit.com", role: "Viewer",  status: "Suspended", createdAt: "2025-06-04" },
  { id: "U-1005", name: "Ayesha Noor",  email: "ayesha@glaxit.com",role: "Manager", status: "Active",    createdAt: "2025-07-14" },
];

/* ------------------------------ Utils ------------------------------ */
const roleColor: Record<Role, string> = {
  Admin:   "bg-rose-500/15 text-rose-400 border-rose-500/30",
  Manager: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Staff:   "bg-sky-500/15 text-sky-400 border-sky-500/30",
  Viewer:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};
const statusColor: Record<Status, string> = {
  Active:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Suspended: "bg-red-500/15 text-red-400 border-red-500/30",
  Invited:   "bg-violet-500/15 text-violet-400 border-violet-500/30",
};
const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
const validateEmail = (email: string) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);

/* ------------------------------ User Form ------------------------------ */
function UserForm({ values, onChange }: { values: UserFormValues; onChange: (patch: Partial<UserFormValues>) => void; }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={values.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="eg. John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={values.email} onChange={(e) => onChange({ email: e.target.value })} placeholder="name@company.com" />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={values.role} onValueChange={(v) => onChange({ role: v as Role })}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
              <SelectItem value="Viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={values.status} onValueChange={(v) => onChange({ status: v as Status })}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Invited">Invited</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ View Modal ------------------------------ */
function ViewUserDialog({ user }: { user: User }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Read-only view of the selected user.</DialogDescription>
        </DialogHeader>
        <div className="mt-2 grid grid-cols-1 gap-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12"><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar>
            <div>
              <div className="text-lg font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><div className="text-xs text-muted-foreground">Role</div><Badge className={`mt-1 border ${roleColor[user.role]}`}>{user.role}</Badge></div>
            <div><div className="text-xs text-muted-foreground">Status</div><Badge className={`mt-1 border ${statusColor[user.status]}`}>{user.status}</Badge></div>
            <div><div className="text-xs text-muted-foreground">User ID</div><div className="mt-1 font-medium">{user.id}</div></div>
            <div><div className="text-xs text-muted-foreground">Created</div><div className="mt-1 font-medium">{new Date(user.createdAt).toLocaleDateString()}</div></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Edit Modal ------------------------------ */
function EditUserDialog({ user, onSave }: { user: User; onSave: (updated: User) => void; }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<UserFormValues>({ name: user.name, email: user.email, role: user.role, status: user.status });
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.name.trim()) return setErr("Name is required");
    if (!validateEmail(form.email)) return setErr("Valid email is required");
    setErr(null);
    onSave({ ...user, ...form });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user details and save changes.</DialogDescription>
        </DialogHeader>
        <UserForm values={form} onChange={(p) => setForm((f) => ({ ...f, ...p }))} />
        {err && <p className="text-sm text-red-500">{err}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Delete Confirm ------------------------------ */
function DeleteUserDialog({ onConfirm, children }: { onConfirm: () => void; children: React.ReactNode; }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone. This will permanently remove the user from your list.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ------------------------------ Actions Menu ------------------------------ */
function ActionsMenu({ user, onEdit, onDelete }: { user: User; onEdit: (u: User) => void; onDelete: (id: string) => void; }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-muted">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <ViewUserDialog user={user} />
        <EditUserDialog user={user} onSave={onEdit} />
        <DropdownMenuSeparator />
        <DeleteUserDialog onConfirm={() => onDelete(user.id)}>
          <DropdownMenuItem className="text-red-600 focus:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DeleteUserDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------ Main Component (Table) ------------------------------ */
export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof User>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const base = q ? users.filter((u) => [u.name, u.email, u.role, u.status].join(" ").toLowerCase().includes(q)) : users;
    const sorted = [...base].sort((a, b) => {
      const A = String(a[sortBy]).toLowerCase();
      const B = String(b[sortBy]).toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [users, query, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageData = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const toggleSort = (key: keyof User) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const handleCreate = (u: User) => setUsers((prev) => [u, ...prev]);
  const handleEdit = (updated: User) => setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  const handleDelete = (id: string) => setUsers((prev) => prev.filter((u) => u.id !== id));

  // Create Modal (inline to keep this file self-contained)
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<UserFormValues>({ name: "", email: "", role: "Viewer", status: "Invited" });
  const [createErr, setCreateErr] = useState<string | null>(null);
  const createUser = () => {
    if (!createForm.name.trim()) return setCreateErr("Name is required");
    if (!validateEmail(createForm.email)) return setCreateErr("Valid email is required");
    setCreateErr(null);
    const newUser: User = {
      id: `U-${Math.floor(1000 + Math.random() * 9000)}`,
      name: createForm.name.trim(),
      email: createForm.email.trim(),
      role: createForm.role,
      status: createForm.status,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    handleCreate(newUser);
    setCreateOpen(false);
    setCreateForm({ name: "", email: "", role: "Viewer", status: "Invited" });
    setPage(1);
  };

  const SortIcon = (key: keyof User) => (
    <span className="inline-block w-3 text-muted-foreground">{sortBy === key ? (sortDir === "asc" ? "↑" : "↓") : ""}</span>
  );

  return (
    <Card className="p-5 space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-96">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, role..."
              className="pl-8"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((n) => (<SelectItem key={n} value={String(n)}>{n} / page</SelectItem>))}
            </SelectContent>
          </Select>

          {/* Create User */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create User</DialogTitle>
                <DialogDescription>Add a new user to your workspace.</DialogDescription>
              </DialogHeader>
              <UserForm values={createForm} onChange={(p) => setCreateForm((f) => ({ ...f, ...p }))} />
              {createErr && <p className="text-sm text-red-500">{createErr}</p>}
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={createUser}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="w-full overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <TableRow>
              <TableHead className="w-[80px]">User</TableHead>
              <TableHead onClick={() => toggleSort("name")} className="cursor-pointer select-none">Name {SortIcon("name")}</TableHead>
              <TableHead onClick={() => toggleSort("email")} className="cursor-pointer select-none">Email {SortIcon("email")}</TableHead>
              <TableHead onClick={() => toggleSort("role")} className="cursor-pointer select-none">Role {SortIcon("role")}</TableHead>
              <TableHead onClick={() => toggleSort("status")} className="cursor-pointer select-none">Status {SortIcon("status")}</TableHead>
              <TableHead onClick={() => toggleSort("createdAt")} className="cursor-pointer select-none">Created {SortIcon("createdAt")}</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No users found.</TableCell>
              </TableRow>
            ) : (
              pageData.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Avatar className="h-9 w-9"><AvatarFallback>{initials(u.name)}</AvatarFallback></Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge className={`border ${roleColor[u.role]}`}>{u.role}</Badge></TableCell>
                  <TableCell><Badge className={`border ${statusColor[u.status]}`}>{u.status}</Badge></TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <ActionsMenu user={u} onEdit={handleEdit} onDelete={handleDelete} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableCaption className="text-muted-foreground">User count: {users.length}</TableCaption>
        </Table>
      </ScrollArea>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{(page - 1) * rowsPerPage + 1}</span>–
          <span className="font-medium">{Math.min(page * rowsPerPage, filtered.length)}</span> of
          <span className="font-medium"> {filtered.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1}>First</Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <div className="text-sm">Page {page} / {totalPages}</div>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</Button>
        </div>
      </div>
    </Card>
  );
}

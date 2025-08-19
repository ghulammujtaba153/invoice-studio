"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Search, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";

// 👉 NEW: Create modal moved to its own file
import CreateUserDialog from "@/components/admin/CreateUserDialog";

/* ------------------------------ Types (API) ------------------------------ */
type BackendUser = {
  _id: string;
  name: string;
  email: string;
  role?: string | null;     // "admin" | "user" | ...
  status?: string | null;   // "invited" | "active" | "suspended"
  image?: string | null;
  provider?: string | null; // "email" | "google"
  createdAt: string;        // ISO
};

type UsersPage = {
  users: BackendUser[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

/* ------------------------------ UI Utils ------------------------------ */
const initials = (name?: string) =>
  (name || "?").split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const badge = (bg: string, text: string, border: string) => `border ${bg} ${text} ${border}`;

const roleBadgeClass = (role?: string | null) => {
  const r = (role || "user").toLowerCase();
  switch (r) {
    case "admin":   return badge("bg-rose-500/15","text-rose-400","border-rose-500/30");
    case "user":    return badge("bg-indigo-500/15","text-indigo-400","border-indigo-500/30");
    default:        return badge("bg-muted","text-muted-foreground","border-border");
  }
};
const statusBadgeClass = (status?: string | null) => {
  const s = (status || "active").toLowerCase();
  switch (s) {
    case "active":    return badge("bg-emerald-500/15","text-emerald-400","border-emerald-500/30");
    case "invited":   return badge("bg-violet-500/15","text-violet-400","border-violet-500/30");
    case "suspended": return badge("bg-red-500/15","text-red-400","border-red-500/30");
    default:          return badge("bg-muted","text-muted-foreground","border-border");
  }
};
const titleCase = (v?: string | null) => (!v ? "—" : v.charAt(0).toUpperCase() + v.slice(1));

/* ------------------------------ View Dialog ------------------------------ */
function ViewUserDialog({ user }: { user: BackendUser }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted flex items-center">
          <Eye className="mr-2 h-4 w-4" /> View
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Read-only view of the selected user.</DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid gap-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-lg font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><div className="text-xs text-muted-foreground">Role</div><Badge className={`mt-1 ${roleBadgeClass(user.role)}`}>{titleCase(user.role)}</Badge></div>
            <div><div className="text-xs text-muted-foreground">Status</div><Badge className={`mt-1 ${statusBadgeClass(user.status)}`}>{titleCase(user.status)}</Badge></div>
            <div><div className="text-xs text-muted-foreground">User ID</div><div className="mt-1 font-medium">{user._id}</div></div>
            <div><div className="text-xs text-muted-foreground">Created</div><div className="mt-1 font-medium">{new Date(user.createdAt).toLocaleDateString()}</div></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Edit Dialog ------------------------------ */
function EditUserDialog({ user, onSave }: { user: BackendUser; onSave: (u: BackendUser) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "user",
    status: user.status || "active",
  });
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    if (!form.name.trim()) return setErr("Name is required");
    if (!/[^@\s]+@[^@\s]+\.[^@\s]+/.test(form.email)) return setErr("Valid email is required");
    setErr(null);
    onSave({ ...user, ...form });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted flex items-center">
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user details and save changes.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={String(form.role)} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                {/* optional extra roles for local-only editing */}
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={String(form.status)} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {err && <p className="text-sm text-red-500">{err}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ Delete Dialog ------------------------------ */
function DeleteUserDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted flex items-center text-red-600">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ------------------------------ Actions Menu ------------------------------ */
function ActionsMenu({ user, onEdit, onDelete }: { user: BackendUser; onEdit: (u: BackendUser) => void; onDelete: (id: string) => void; }) {
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
        <DeleteUserDialog onConfirm={() => onDelete(user._id)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------ Main (GET API wired) ------------------------------ */
type SortKey = "_id" | "name" | "email" | "role" | "status" | "createdAt";
type SortDir = "asc" | "desc";

export default function UserManagement() {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [rows, setRows] = useState<BackendUser[]>([]);
  const [pagination, setPagination] = useState<UsersPage["pagination"] | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // 👉 reloadKey to trigger refetch after invite success
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`/api/auth/users-all?page=${page}&limit=${limit}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load users (${res.status})`);
        const json = await res.json();
        if (!json?.success) throw new Error("API returned success=false");
        if (!mounted) return;
        const data: UsersPage = json.data;
        setRows(data.users);
        setPagination(data.pagination);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page, limit, reloadKey]); // <-- reloadKey added

  const tableRows = useMemo(() => {
    const q = query.toLowerCase().trim();
    const base = q
      ? rows.filter((u) =>
          [u.name, u.email, u.role || "", u.status || ""].join(" ").toLowerCase().includes(q)
        )
      : rows;
    const sorted = [...base].sort((a, b) => {
      const A = String(a[sortBy] ?? "").toLowerCase();
      const B = String(b[sortBy] ?? "").toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [rows, query, sortBy, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  // local-only edit/delete placeholders
  const onEditLocal = (updated: BackendUser) => setRows((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
  const onDeleteLocal = (id: string) => setRows((prev) => prev.filter((u) => u._id !== id));

  const SortIcon = (key: SortKey) => (
    <span className="inline-block w-3 text-muted-foreground">
      {sortBy === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </span>
  );

  const p = pagination;
  const pageInfo = `Page ${p?.currentPage ?? page} / ${p?.totalPages ?? 1}`;
  const totalUsers = p?.totalUsers ?? tableRows.length;

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
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder={`${limit} / page`} /></SelectTrigger>
            <SelectContent>
              {[2, 5, 10, 20, 50].map((n) => (<SelectItem key={n} value={String(n)}>{n} / page</SelectItem>))}
            </SelectContent>
          </Select>

          {/* 👉 Separate Create modal with API (invite) */}
          <CreateUserDialog
            onSuccess={() => {
              setPage(1);               // go to first page
              setReloadKey((k) => k + 1); // refetch
            }}
          />
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            ) : err ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-red-500">Error: {err}</TableCell>
              </TableRow>
            ) : tableRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No users found.</TableCell>
              </TableRow>
            ) : (
              tableRows.map((u) => (
                <TableRow key={u._id} className="hover:bg-muted/40">
                  <TableCell>
                    <Avatar className="h-9 w-9">
                      {u.image ? <AvatarImage src={u.image} alt={u.name} /> : null}
                      <AvatarFallback>{initials(u.name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge className={roleBadgeClass(u.role)}>{titleCase(u.role)}</Badge></TableCell>
                  <TableCell><Badge className={statusBadgeClass(u.status)}>{titleCase(u.status)}</Badge></TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <ActionsMenu user={u} onEdit={onEditLocal} onDelete={onDeleteLocal} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

          <TableCaption className="text-muted-foreground">Total users: {totalUsers}</TableCaption>
        </Table>
      </ScrollArea>

      {/* Pagination (server-driven) */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {p?.currentPage ?? page} / {p?.totalPages ?? 1} • {p?.limit ?? limit} per page
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={!p || p.currentPage <= 1}>First</Button>
          <Button variant="outline" size="sm" onClick={() => setPage((x) => Math.max(1, x - 1))} disabled={!p || !p.hasPrevPage}>Prev</Button>
          <div className="text-sm">Page {p?.currentPage ?? page}</div>
          <Button variant="outline" size="sm" onClick={() => setPage((x) => (p ? Math.min(p.totalPages, x + 1) : x + 1))} disabled={!p || !p.hasNextPage}>Next</Button>
          <Button variant="outline" size="sm" onClick={() => p && setPage(p.totalPages)} disabled={!p || (p && p.currentPage >= p.totalPages)}>Last</Button>
        </div>
      </div>
    </Card>
  );
}

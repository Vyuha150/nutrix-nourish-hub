import { useEffect, useMemo, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Eye, Mail, Shield, ShieldCheck, ShieldAlert, User, Users as UsersIcon, Loader2, RefreshCw } from "lucide-react";
import { inr } from "@/lib/format";
import { getCustomers, getOrders, getUsers, updateUserRole } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { CustomerStats, OrderRecord, AuthUser, UserRole } from "@/lib/types";
import { toast } from "sonner";

const segVariant: Record<CustomerStats["segment"], "default" | "secondary" | "outline" | "destructive"> = {
  VIP: "default", Regular: "secondary", New: "outline", "At-risk": "destructive",
};

const Customers = () => {
  useEffect(() => { document.title = "Customers & Users · Nutrix Admin"; }, []);
  const { user: currentUser, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState("customers");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [customerActiveIndex, setCustomerActiveIndex] = useState(-1);
  const customerSearchRef = useRef<HTMLDivElement>(null);

  const [userQuery, setUserQuery] = useState("");
  const [debouncedUserQuery, setDebouncedUserQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userActiveIndex, setUserActiveIndex] = useState(-1);
  const userSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
    }, 280);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserQuery(userQuery);
    }, 280);
    return () => clearTimeout(timer);
  }, [userQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customerSearchRef.current && !customerSearchRef.current.contains(e.target as Node)) {
        setCustomerDropdownOpen(false);
      }
      if (userSearchRef.current && !userSearchRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [view, setView] = useState<CustomerStats | null>(null);
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  // User Accounts & Roles
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ user: AuthUser; targetRole: UserRole } | null>(null);
  const [submittingRole, setSubmittingRole] = useState(false);

  const loadData = async () => {
    try {
      const [c, o] = await Promise.all([getCustomers(), getOrders()]);
      setCustomers(c);
      setOrders(o);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const u = await getUsers();
      setUsers(u);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to load user accounts";
      setUsersError(msg);
      toast.error(msg);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadUsers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const n = debouncedQ.toLowerCase().trim();
    return n ? customers.filter((c) => c.name.toLowerCase().includes(n) || c.email.toLowerCase().includes(n)) : customers;
  }, [debouncedQ, customers]);

  const customerSuggestions = useMemo(() => {
    const n = q.toLowerCase().trim();
    if (!n) return [];
    return customers
      .filter((c) => c.name.toLowerCase().includes(n) || c.email.toLowerCase().includes(n))
      .slice(0, 6);
  }, [q, customers]);

  const handleCustomerKeyDown = (e: React.KeyboardEvent) => {
    if (!customerDropdownOpen || customerSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCustomerActiveIndex((prev) => (prev + 1) % customerSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCustomerActiveIndex((prev) => (prev <= 0 ? customerSuggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter" && customerActiveIndex >= 0) {
      e.preventDefault();
      const selected = customerSuggestions[customerActiveIndex];
      setQ(selected.name);
      setDebouncedQ(selected.name);
      setCustomerDropdownOpen(false);
      setView(selected);
    } else if (e.key === "Escape") {
      setCustomerDropdownOpen(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const n = debouncedUserQuery.toLowerCase().trim();
    return n
      ? users.filter(
          (u) =>
            u.name.toLowerCase().includes(n) ||
            u.email.toLowerCase().includes(n) ||
            u.role.toLowerCase().includes(n)
        )
      : users;
  }, [debouncedUserQuery, users]);

  const userSuggestions = useMemo(() => {
    const n = userQuery.toLowerCase().trim();
    if (!n) return [];
    return users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(n) ||
          u.email.toLowerCase().includes(n) ||
          u.role.toLowerCase().includes(n)
      )
      .slice(0, 6);
  }, [userQuery, users]);

  const handleUserKeyDown = (e: React.KeyboardEvent) => {
    if (!userDropdownOpen || userSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setUserActiveIndex((prev) => (prev + 1) % userSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setUserActiveIndex((prev) => (prev <= 0 ? userSuggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter" && userActiveIndex >= 0) {
      e.preventDefault();
      const selected = userSuggestions[userActiveIndex];
      setUserQuery(selected.name);
      setDebouncedUserQuery(selected.name);
      setUserDropdownOpen(false);
    } else if (e.key === "Escape") {
      setUserDropdownOpen(false);
    }
  };

  const totalLtv = customers.reduce((s, c) => s + (c.ltv || 0), 0);
  const vip = customers.filter((c) => c.segment === "VIP").length;
  const atRisk = customers.filter((c) => c.segment === "At-risk").length;

  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = users.filter((u) => u.role === "customer").length;

  const customerOrders = (customer: CustomerStats) =>
    orders.filter(
      (o) =>
        (o.email && o.email.toLowerCase() === customer.email.toLowerCase()) ||
        o.customerId === customer.id ||
        (customer.userId && o.customerId === customer.userId)
    );

  const handleConfirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    setSubmittingRole(true);
    try {
      const updated = await updateUserRole(pendingRoleChange.user.id, pendingRoleChange.targetRole);
      toast.success(
        `Role for ${updated.name} updated to ${updated.role === "admin" ? "Administrator" : "Customer"}.`
      );

      // Live update user state
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role, updatedAt: updated.updatedAt } : u))
      );

      // Refresh customers to sync customer profile changes
      loadData();

      // If updating currently authenticated user, refresh auth session
      if (currentUser && currentUser.id === pendingRoleChange.user.id) {
        await refreshUser();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update user role";
      toast.error(msg);
    } finally {
      setSubmittingRole(false);
      setPendingRoleChange(null);
    }
  };

  const formatDate = (dateVal?: string | Date) => {
    if (!dateVal) return "—";
    try {
      return new Date(dateVal).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <AdminLayout
      title="Customers & User Accounts"
      description={
        usersLoading
          ? `Store Customers: ${customers.length} · Loading registered accounts…`
          : `Unique Store Customers: ${customers.length} · Registered Accounts: ${users.length} (${adminCount} admin${adminCount === 1 ? "" : "s"}, ${customerCount} customer${customerCount === 1 ? "" : "s"})`
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-2 w-[420px]">
            <TabsTrigger value="customers">
              Store Customers ({customers.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              Registered Accounts ({users.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: STORE CUSTOMERS */}
        <TabsContent value="customers" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div>
              <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                <UsersIcon className="w-4 h-4" /> Store Customers
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                All unique customers with store activity or a registered customer account · Used for sales, retention, and lifetime value (LTV) analytics.
              </p>
            </div>
            <Badge variant="outline" className="text-xs shrink-0 self-start sm:self-auto">
              {customers.length} Profiles
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Store Customers" value={customers.length.toString()} hint="All unique customer profiles" />
            <StatCard
              label="Avg LTV"
              value={inr(customers.length ? Math.round(totalLtv / customers.length) : 0)}
              delta={0}
            />
            <StatCard label="VIP" value={vip.toString()} hint="High-value accounts" />
            <StatCard label="At-risk" value={atRisk.toString()} hint="Re-engagement target" />
          </div>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div ref={customerSearchRef} className="relative max-w-sm mb-3">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers…"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setCustomerDropdownOpen(true);
                    setCustomerActiveIndex(-1);
                  }}
                  onFocus={() => setCustomerDropdownOpen(true)}
                  onKeyDown={handleCustomerKeyDown}
                  className="pl-8 h-9"
                />
                {customerDropdownOpen && q.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 rounded-lg border bg-popover text-popover-foreground shadow-md z-30 overflow-hidden text-xs max-h-72 overflow-y-auto divide-y">
                    {customerSuggestions.map((c, idx) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setQ(c.name);
                          setDebouncedQ(c.name);
                          setCustomerDropdownOpen(false);
                          setView(c);
                        }}
                        className={`p-2.5 px-3 hover:bg-muted/60 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                          idx === customerActiveIndex ? "bg-muted" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{c.email}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-semibold">{inr(c.ltv)}</div>
                          <div className="text-[10px] text-muted-foreground">{c.orders} orders · {c.segment}</div>
                        </div>
                      </div>
                    ))}
                    {customerSuggestions.length === 0 && (
                      <div className="p-3 text-center text-muted-foreground">No matching customers found</div>
                    )}
                  </div>
                )}
              </div>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Account Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">LTV</TableHead>
                      <TableHead>Last order</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((c) => {
                      const isRegistered =
                        c.isRegistered ??
                        Boolean(c.userId || users.some((u) => u.email.toLowerCase() === c.email.toLowerCase()));

                      return (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div className="font-medium">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{c.email}</div>
                          </TableCell>
                          <TableCell>
                            {isRegistered ? (
                              <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-600/30 text-[10px] px-1.5 py-0 gap-1 hover:bg-emerald-600/20">
                                <ShieldCheck className="w-3 h-3" /> Registered
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0">
                                Guest
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">{c.joined}</TableCell>
                          <TableCell className="text-right">{c.orders}</TableCell>
                          <TableCell className="text-right font-medium">{inr(c.ltv)}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{c.lastOrder}</TableCell>
                          <TableCell>
                            <Badge variant={segVariant[c.segment]}>{c.segment}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setView(c)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredCustomers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          No customers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: USER ACCOUNTS & ROLES */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div>
              <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Registered Accounts
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customers and administrators with login accounts · Used for authentication and role access management.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-600/30 text-xs">
                {adminCount} Admin{adminCount === 1 ? "" : "s"}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {customerCount} Customer{customerCount === 1 ? "" : "s"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Registered Accounts"
              value={usersLoading ? "…" : usersError ? "Error" : users.length.toString()}
              hint={usersError ? "Failed to load accounts" : "Active platform login accounts"}
            />
            <StatCard
              label="Administrators"
              value={usersLoading ? "…" : usersError ? "—" : adminCount.toString()}
              hint="Full operator privileges"
            />
            <StatCard
              label="Customers"
              value={usersLoading ? "…" : usersError ? "—" : customerCount.toString()}
              hint="Standard store user accounts"
            />
          </div>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div ref={userSearchRef} className="relative max-w-sm flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, or role…"
                    value={userQuery}
                    onChange={(e) => {
                      setUserQuery(e.target.value);
                      setUserDropdownOpen(true);
                      setUserActiveIndex(-1);
                    }}
                    onFocus={() => setUserDropdownOpen(true)}
                    onKeyDown={handleUserKeyDown}
                    className="pl-8 h-9"
                  />
                  {userDropdownOpen && userQuery.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 rounded-lg border bg-popover text-popover-foreground shadow-md z-30 overflow-hidden text-xs max-h-72 overflow-y-auto divide-y">
                      {userSuggestions.map((u, idx) => (
                        <div
                          key={u.id}
                          onClick={() => {
                            setUserQuery(u.name);
                            setDebouncedUserQuery(u.name);
                            setUserDropdownOpen(false);
                          }}
                          className={`p-2.5 px-3 hover:bg-muted/60 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                            idx === userActiveIndex ? "bg-muted" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-medium truncate">{u.name}</div>
                            <div className="text-[11px] text-muted-foreground truncate">{u.email}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-[10px] capitalize">
                              {u.role}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {userSuggestions.length === 0 && (
                        <div className="p-3 text-center text-muted-foreground">No matching users found</div>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadUsers}
                  disabled={usersLoading}
                  className="h-9 gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Account</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Role Management</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => {
                      const isSelf = currentUser?.id === u.id;
                      const isSoleAdmin = u.role === "admin" && adminCount <= 1;

                      return (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {u.name}
                                  {isSelf && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/5 text-primary">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">{u.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {u.role === "admin" ? (
                              <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-600/30 gap-1 hover:bg-emerald-600/20">
                                <ShieldCheck className="w-3 h-3" /> Admin
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <User className="w-3 h-3" /> Customer
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {formatDate(u.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            {u.role === "customer" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 text-xs text-emerald-700 border-emerald-600/30 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                onClick={() => setPendingRoleChange({ user: u, targetRole: "admin" })}
                              >
                                <Shield className="w-3.5 h-3.5" />
                                Promote to Admin
                              </Button>
                            ) : isSoleAdmin ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                title="Cannot demote the only remaining administrator"
                                className="h-8 gap-1.5 text-xs opacity-50 cursor-not-allowed"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Sole Admin
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={() => setPendingRoleChange({ user: u, targetRole: "customer" })}
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Demote to Customer
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {usersError ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center gap-2 text-destructive">
                            <ShieldAlert className="w-8 h-8 opacity-80" />
                            <p className="font-medium text-sm">Failed to load user accounts</p>
                            <p className="text-xs text-muted-foreground max-w-md">{usersError}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={loadUsers}
                              className="mt-2 h-8 gap-1.5 text-xs text-foreground"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          {usersLoading ? "Loading user accounts…" : "No user accounts found."}
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Role Change */}
      <AlertDialog
        open={!!pendingRoleChange}
        onOpenChange={(open) => {
          if (!open && !submittingRole) {
            setPendingRoleChange(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingRoleChange?.targetRole === "admin" ? "Promote User to Admin?" : "Demote Admin to Customer?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>
                {pendingRoleChange?.targetRole === "admin" ? (
                  <>
                    Are you sure you want to promote <strong>{pendingRoleChange?.user.name}</strong> (
                    {pendingRoleChange?.user.email}) to <strong>Administrator</strong>? They will be granted full access
                    to view analytics, modify products, manage orders, and update system settings.
                  </>
                ) : (
                  <>
                    Are you sure you want to demote <strong>{pendingRoleChange?.user.name}</strong> (
                    {pendingRoleChange?.user.email}) to <strong>Customer</strong>? Their administrative privileges will be
                    immediately revoked.
                  </>
                )}
              </span>
              {currentUser?.id === pendingRoleChange?.user.id && pendingRoleChange?.targetRole === "customer" && (
                <span className="block text-amber-600 dark:text-amber-400 font-medium">
                  Caution: You are about to demote your own account. You will lose access to the admin console immediately.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submittingRole}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmRoleChange();
              }}
              disabled={submittingRole}
              className={
                pendingRoleChange?.targetRole === "customer"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {submittingRole ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : pendingRoleChange?.targetRole === "admin" ? (
                "Promote to Admin"
              ) : (
                "Demote to Customer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Customer Orders Sheet View */}
      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {view && (
            <>
              <SheetHeader><SheetTitle>{view.name}</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {view.email}</div>
                  {(view.isRegistered ?? Boolean(view.userId || users.some((u) => u.email.toLowerCase() === view.email.toLowerCase()))) ? (
                    <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-600/30 text-[10px]">Registered Account</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">Guest Customer</Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Orders" value={view.orders.toString()} />
                  <StatCard label="LTV" value={inr(view.ltv)} />
                  <StatCard label="Segment" value={view.segment} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recent orders</p>
                  <div className="space-y-1.5">
                    {customerOrders(view).slice(0, 5).map((o) => (
                      <div key={o.id} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                        <span className="font-mono text-xs">{o.id}</span>
                        <Badge variant="secondary" className="capitalize text-[10px]">{o.status}</Badge>
                        <span className="font-medium">{inr(o.total)}</span>
                      </div>
                    ))}
                    {customerOrders(view).length === 0 && <p className="text-xs text-muted-foreground">No orders in current view.</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default Customers;

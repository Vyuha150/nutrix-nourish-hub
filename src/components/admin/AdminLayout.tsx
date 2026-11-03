import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, LogOut } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/context/AuthContext";
import { AdminSearchAutocomplete } from "./AdminSearchAutocomplete";

export function AdminLayout({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  const handleSignOut = () => {
    signOut();
    navigate("/signin");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b bg-background flex items-center gap-3 px-4 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
              <AdminSearchAutocomplete />
            </div>
            <div className="flex-1" />
            <Link
              to="/"
              className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Storefront
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div
                className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold"
                title={user?.email}
              >
                {initials}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign out"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import { ReactNode } from "react";
import { PromoBar } from "./PromoBar";
import { Header } from "./Header";
import { SubNav } from "./SubNav";
import { Footer } from "./Footer";

export const Layout = ({ children }: { children: ReactNode }) => (
  <main className="min-h-screen bg-background flex flex-col">
    <PromoBar />
    <Header />
    <SubNav />
    <div className="flex-1">{children}</div>
    <Footer />
  </main>
);

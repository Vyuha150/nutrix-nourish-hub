import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, delta, hint,
}: { label: string; value: string; delta?: number; hint?: string }) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold mt-2">{value}</p>
        <div className="flex items-center gap-2 mt-2 text-xs">
          {delta !== undefined && (
            <span className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-medium",
              positive ? "bg-leaf/15 text-forest" : "bg-destructive/10 text-destructive")}>
              {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

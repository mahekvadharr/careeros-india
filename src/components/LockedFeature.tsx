import { useState, type ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProUpgradeModal } from "./ProUpgradeModal";

export function LockedFeature({ title, description, preview, source = "locked" }: { title: string; description: string; preview?: ReactNode; source?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      {preview && <div className="pointer-events-none select-none blur-sm opacity-60">{preview}</div>}
      <div className={preview ? "absolute inset-0 grid place-items-center" : ""}>
        <div className="glass-card rounded-3xl p-7 max-w-md text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gold/15 grid place-items-center mb-3"><Lock className="h-5 w-5 text-gold" /></div>
          <h3 className="font-display text-2xl">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <Button className="mt-5 bg-gold text-gold-foreground hover:bg-gold/90" onClick={() => setOpen(true)}>
            <Sparkles className="h-4 w-4 mr-1" /> Unlock with CareerOS Pro
          </Button>
        </div>
      </div>
      <ProUpgradeModal open={open} onOpenChange={setOpen} source={source} />
    </div>
  );
}

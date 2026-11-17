"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/utils";
import type { PracticeParams } from "@/lib/types";

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  disabled?: boolean;
} & ({ packageId: string; practice?: never } | { practice: PracticeParams; packageId?: never });

/** Creates a quiz attempt on the server, then opens the quiz player. */
export function StartQuizButton({ children, packageId, practice, className, variant = "primary", size = "md", disabled }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = packageId
      ? await supabase.rpc("start_package_attempt", { p_package_id: packageId })
      : await supabase.rpc("start_practice", practice!);
    if (error || !data) {
      toast(friendlyError(error?.message), "error");
      setLoading(false);
      return;
    }
    router.push(`/student/quiz/${data}`);
  }

  return (
    <Button onClick={start} loading={loading} disabled={disabled} className={className} variant={variant} size={size}>
      {children}
    </Button>
  );
}

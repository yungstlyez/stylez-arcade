"use client";

import { useChronicles } from "@/components/chronicles/ChronicleProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function OpenTerminalOnMount() {
  const { openTerminal } = useChronicles();
  const router = useRouter();

  useEffect(() => {
    openTerminal();
    router.replace("/");
  }, [openTerminal, router]);

  return null;
}

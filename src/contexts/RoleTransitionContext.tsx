"use client";

import RoleTransition from "@/components/common/RoleTransition";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type AppRole = "BUYER" | "SELLER";

type StartTransitionArgs = {
  fromRole: AppRole;
  toRole: AppRole;
  targetPath: string;
  /** Minimum time (ms) the overlay must stay visible */
  minDurationMs?: number;
  /** Delay (ms) before starting navigation (lets animation start) */
  navigateAfterMs?: number;
};

type RoleTransitionContextValue = {
  startRoleTransition: (args: StartTransitionArgs) => void;
};

const RoleTransitionContext = createContext<RoleTransitionContextValue | null>(
  null
);

export function RoleTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [fromRole, setFromRole] = useState<AppRole>("BUYER");
  const [toRole, setToRole] = useState<AppRole>("SELLER");

  const startTimeRef = useRef<number | null>(null);
  const targetPathRef = useRef<string | null>(null);
  const minDurationRef = useRef<number>(2000);

  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (navigateTimeoutRef.current) {
      clearTimeout(navigateTimeoutRef.current);
      navigateTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const hideNow = useCallback(() => {
    clearTimers();
    setVisible(false);
    startTimeRef.current = null;
    targetPathRef.current = null;
  }, [clearTimers]);

  const startRoleTransition = useCallback(
    ({
      fromRole,
      toRole,
      targetPath,
      minDurationMs = 2000,
      navigateAfterMs = 400,
    }: StartTransitionArgs) => {
      clearTimers();

      setFromRole(fromRole);
      setToRole(toRole);
      setVisible(true);

      startTimeRef.current = Date.now();
      targetPathRef.current = targetPath;
      minDurationRef.current = minDurationMs;

      navigateTimeoutRef.current = setTimeout(() => {
        router.push(targetPath);
      }, navigateAfterMs);

      // Safety: if route never changes (network / error), hide eventually
      hideTimeoutRef.current = setTimeout(() => {
        hideNow();
      }, Math.max(minDurationMs + 2500, 4500));
    },
    [clearTimers, hideNow, router]
  );

  // When navigation completes (pathname changes), enforce minimum duration then hide.
  useEffect(() => {
    if (!visible) return;
    const targetPath = targetPathRef.current;
    if (!targetPath) return;

    // We consider navigation "done" when we are on the target path,
    // or when we entered the correct section (/chef vs non-/chef) based on toRole.
    const doneByExactPath = pathname === targetPath;
    const doneBySection =
      toRole === "SELLER" ? pathname.startsWith("/chef") : !pathname.startsWith("/chef");

    if (!doneByExactPath && !doneBySection) return;

    const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    const remaining = Math.max(0, (minDurationRef.current || 2000) - elapsed);

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    hideTimeoutRef.current = setTimeout(() => {
      hideNow();
    }, Math.max(remaining, 300));
  }, [pathname, toRole, visible, hideNow]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const value = useMemo<RoleTransitionContextValue>(
    () => ({ startRoleTransition }),
    [startRoleTransition]
  );

  return (
    <RoleTransitionContext.Provider value={value}>
      <RoleTransition isVisible={visible} fromRole={fromRole} toRole={toRole} />
      {children}
    </RoleTransitionContext.Provider>
  );
}

export function useRoleTransition() {
  const ctx = useContext(RoleTransitionContext);
  if (!ctx) {
    throw new Error("useRoleTransition must be used within RoleTransitionProvider");
  }
  return ctx;
}


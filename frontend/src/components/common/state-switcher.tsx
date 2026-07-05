"use client";

/**
 * Manual state-toggle primitives for previewing seeded UI variants.
 *
 * Many screens must show empty/ready/blocked/failed/etc. states. The switcher writes the
 * selected variant to a URL query param (default `state`) so server components can read it
 * from `searchParams` and render the matching seeded variant — no backend, no mutation.
 */

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

export interface StateOption {
  value: string;
  label: string;
}

export interface StateSwitcherProps {
  /** Query param the switcher controls. */
  param?: string;
  options: StateOption[];
  /** Value selected when the param is absent. */
  defaultValue?: string;
  label?: string;
  className?: string;
}

export function StateSwitcher({
  param = "state",
  options,
  defaultValue,
  label = "Preview state",
  className,
}: StateSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fallback = defaultValue ?? options[0]?.value;
  const active = searchParams.get(param) ?? fallback;

  function select(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === fallback) {
      next.delete(param);
    } else {
      next.set(param, value);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-text-muted text-xs font-medium">{label}</span>
      <div
        role="group"
        aria-label={label}
        className="bg-surface-one inline-flex w-fit flex-wrap gap-1 rounded-lg border border-[color:var(--border-subtle)] p-1"
      >
        {options.map((option) => {
          const selected = option.value === active;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => select(option.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                "focus-visible:ring-ring/50 outline-none focus-visible:ring-2",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "text-text-secondary hover:bg-surface-two hover:text-text-primary",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

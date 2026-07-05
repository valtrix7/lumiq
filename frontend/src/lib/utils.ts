// Re-export the canonical class-name helper so shadcn primitives that import
// `cn` from `@/lib/utils` and app code that imports from `@/lib/cn` stay in sync.
export { cn } from "@/lib/cn";

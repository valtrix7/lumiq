import { Suspense } from "react";
import { WorkspaceShell } from "@/components/shell/workspace-shell";

/**
 * Route-group layout for all authenticated workspace screens. Wraps every `(workspace)`
 * route in the mock shell (topbar, sidebar, role selector, mobile nav). The shell reads the
 * active role from the URL via `useSearchParams`, so it is wrapped in a Suspense boundary.
 */
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <WorkspaceShell>{children}</WorkspaceShell>
    </Suspense>
  );
}

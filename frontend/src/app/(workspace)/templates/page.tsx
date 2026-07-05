import type { Metadata } from "next";
import { WorkspaceContent, PageHeader } from "@/components/shell/layout-primitives";
import { StateSwitcher } from "@/components/common/state-switcher";
import { resolveStateParam } from "@/lib/state-param";
import { TemplatesScreen } from "@/components/commerce/templates-screen";
import { mockTemplates } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Inspect safe enhancement templates: typed step graphs, allowed vs blocked creative controls, appearance locks, version and status, provider policy, and provider-unavailable states. Seeded UI-only states.",
};

const STATE_VARIANTS = [
  { value: "seeded", label: "Seeded templates" },
  { value: "empty", label: "No templates" },
] as const;

interface TemplatesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Templates (US6 / T053). Renders seeded enhancement templates with typed safe step graphs, allowed
 * creative controls, appearance locks, provider policy, and provider-unavailable states through
 * `TemplatesScreen`, plus an empty variant via the `?state=` switcher. UI-only — no backend, no
 * mutation. Templates only expose appearance-preserving controls.
 */
export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const params = await searchParams;
  const variant = resolveStateParam(params, "state", "seeded");

  const templates = variant === "empty" ? [] : mockTemplates;

  return (
    <WorkspaceContent>
      <PageHeader
        eyebrow="Seeded templates · no live services"
        title="Templates"
        description="Safe typed step graphs and allowed creative controls that generation may apply without altering product appearance."
        actions={
          <StateSwitcher options={[...STATE_VARIANTS]} defaultValue="seeded" label="Preview state" />
        }
      />
      <TemplatesScreen templates={templates} />
    </WorkspaceContent>
  );
}

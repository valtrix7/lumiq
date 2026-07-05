import type { Metadata } from "next";
import { WorkspaceContent, PageHeader } from "@/components/shell/layout-primitives";
import { StateSwitcher } from "@/components/common/state-switcher";
import { resolveStateParam } from "@/lib/state-param";
import { CatalogScreen } from "@/components/commerce/catalog-screen";
import { mockCatalogSnapshots, mockProducts } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Inspect product truth: SKUs, price, inventory, media, URLs, allowed claims, incomplete states, and catalog snapshot history with B2 manifest proof. Seeded UI-only states.",
};

const STATE_VARIANTS = [
  { value: "seeded", label: "Seeded catalog" },
  { value: "empty", label: "Empty catalog" },
] as const;

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Catalog (US6 / T049). Renders seeded product truth, allowed claims, incomplete-product states,
 * and catalog snapshot history through `CatalogScreen`, plus an empty-catalog variant via the
 * `?state=` switcher. UI-only — no backend, no mutation. Product claims are the only facts
 * available to generation; unsupported claims surface a blocked state downstream.
 */
export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const variant = resolveStateParam(params, "state", "seeded");

  const products = variant === "empty" ? [] : mockProducts;
  const snapshots = variant === "empty" ? [] : mockCatalogSnapshots;

  return (
    <WorkspaceContent>
      <PageHeader
        eyebrow="Seeded catalog · no live services"
        title="Catalog"
        description="Products, allowed claims, completeness, and frozen catalog snapshots that ground every generated and published asset."
        actions={
          <StateSwitcher options={[...STATE_VARIANTS]} defaultValue="seeded" label="Preview state" />
        }
      />
      <CatalogScreen products={products} snapshots={snapshots} />
    </WorkspaceContent>
  );
}

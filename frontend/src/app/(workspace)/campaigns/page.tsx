import type { Metadata } from "next";
import { WorkspaceContent, PageHeader } from "@/components/shell/layout-primitives";
import { StateSwitcher } from "@/components/common/state-switcher";
import { resolveStateParam } from "@/lib/state-param";
import {
  CampaignsScreen,
  type CampaignCardData,
} from "@/components/commerce/campaigns-screen";
import {
  getAllowedClaim,
  getProduct,
  mockCampaigns,
} from "@/lib/mock-data";
import type { AllowedClaim, MockCampaign, MockProduct } from "@/lib/screen-types";

export const metadata: Metadata = {
  title: "Campaigns",
  description:
    "Inspect campaign offers, active products, validity windows, allowed campaign claims, publish destinations, expired states, and Start Session entry points. Seeded UI-only states.",
};

const STATE_VARIANTS = [
  { value: "seeded", label: "Seeded campaigns" },
  { value: "empty", label: "No campaigns" },
] as const;

/** Join a campaign with its active products and resolved allowed claims. */
function toCard(campaign: MockCampaign): CampaignCardData {
  const products = campaign.activeProductIds
    .map((productId) => getProduct(productId))
    .filter((product): product is MockProduct => Boolean(product));

  const allowedClaims = campaign.allowedClaimIds
    .map((claimId) => getAllowedClaim(claimId))
    .filter((claim): claim is AllowedClaim => Boolean(claim));

  return { campaign, products, allowedClaims };
}

interface CampaignsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Campaigns (US6 / T051). Renders seeded campaigns with offers, active products, validity windows,
 * allowed claims, expired state, and Start Session entry points through `CampaignsScreen`, plus an
 * empty variant via the `?state=` switcher. UI-only — no backend, no mutation.
 */
export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
  const params = await searchParams;
  const variant = resolveStateParam(params, "state", "seeded");

  const campaigns = variant === "empty" ? [] : mockCampaigns.map(toCard);

  return (
    <WorkspaceContent>
      <PageHeader
        eyebrow="Seeded campaigns · no live services"
        title="Campaigns"
        description="Offers, validity windows, and allowed campaign claims that ground session and publish copy."
        actions={
          <StateSwitcher options={[...STATE_VARIANTS]} defaultValue="seeded" label="Preview state" />
        }
      />
      <CampaignsScreen campaigns={campaigns} />
    </WorkspaceContent>
  );
}

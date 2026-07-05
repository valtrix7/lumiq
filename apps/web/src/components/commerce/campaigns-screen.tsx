/**
 * Campaigns screen (US6 — Commerce Campaigns, Offers, Claims).
 *
 * Presentational, server-component safe (no hooks / event handlers). Renders the campaign list and
 * per-campaign detail: active products, offer terms, validity window, allowed campaign claims,
 * publish destinations, expired/blocked states, and a Start Session entry point (disabled with a
 * reason when the campaign is not active). Offer copy is grounded in seeded campaign claims.
 *
 * UI-only — no fetch, no mutation. Dark-only, tokens only.
 */

import * as React from "react";
import Link from "next/link";
import { CalendarRange, Megaphone, PlayCircle, Send, ShoppingBag } from "lucide-react";
import type {
  AllowedClaim,
  CampaignStatus,
  MockCampaign,
  MockProduct,
  Severity,
} from "@/lib/screen-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DisabledReason,
  MonoMetadata,
  StateBanner,
  StatusBadge,
} from "@/components/common/status-primitives";
import { AllowedClaimRow } from "@/components/commerce/catalog-screen";

/* ------------------------------------------------------------------ *
 * Status mapping + formatting
 * ------------------------------------------------------------------ */

const CAMPAIGN_SEVERITY: Record<CampaignStatus, Severity> = {
  draft: "neutral",
  scheduled: "info",
  active: "success",
  expired: "danger",
  archived: "neutral",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Deterministic UTC date label — avoids locale/timezone hydration drift. */
function formatDay(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
}

/* ------------------------------------------------------------------ *
 * Row model — assembled server-side, fully serializable
 * ------------------------------------------------------------------ */

export interface CampaignCardData {
  campaign: MockCampaign;
  products: MockProduct[];
  allowedClaims: AllowedClaim[];
}

/* ------------------------------------------------------------------ *
 * Campaign card (list + detail in one)
 * ------------------------------------------------------------------ */

export function CampaignCard({ data }: { data: CampaignCardData }) {
  const { campaign, products, allowedClaims } = data;
  const isActive = campaign.status === "active";
  const isExpired = campaign.status === "expired";
  const hasClaims = allowedClaims.length > 0;

  const startReason = isExpired
    ? "Campaign ended — extend its validity window before starting a session against it."
    : "Only active campaigns can start a session.";

  return (
    <Card className="flex flex-col">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center gap-2">
          <Megaphone aria-hidden className="text-text-muted size-4" />
          <CardTitle className="text-base">{campaign.name}</CardTitle>
          <StatusBadge label={campaign.status} severity={CAMPAIGN_SEVERITY[campaign.status]} />
        </div>
        <div className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1">
            <CalendarRange aria-hidden className="size-3.5" />
            {formatDay(campaign.startsAt)} – {formatDay(campaign.endsAt)}
          </span>
          <MonoMetadata label="campaign_id" value={campaign.campaignId} muted />
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {isExpired ? (
          <StateBanner
            title="Campaign expired"
            message="This campaign's offer window has closed. Its offers and campaign claims no longer ground new generated copy."
            severity="danger"
          />
        ) : null}

        {/* Offer terms */}
        <div className="flex flex-col gap-1.5">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">Offer</span>
          <p className="text-text-secondary text-sm">{campaign.offerTerms}</p>
        </div>

        {/* Active products */}
        <div className="flex flex-col gap-2">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
            Active products ({products.length})
          </span>
          {products.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {products.map((product) => (
                <li key={product.productId} className="flex items-center gap-2 text-sm">
                  <ShoppingBag aria-hidden className="text-text-muted size-3.5 shrink-0" />
                  <span className="text-text-secondary">{product.name}</span>
                  <MonoMetadata label="sku" value={product.sku} muted />
                  <span className="text-text-muted text-xs tabular-nums">{product.priceLabel}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-muted text-xs">No products attached to this campaign.</p>
          )}
        </div>

        {/* Allowed campaign claims */}
        <div className="flex flex-col gap-2">
          <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
            Allowed campaign claims
          </span>
          {hasClaims ? (
            <ul className="flex flex-col gap-1.5">
              {allowedClaims.map((claim) => (
                <AllowedClaimRow key={claim.claimId} claim={claim} />
              ))}
            </ul>
          ) : (
            <p className="text-text-muted text-xs">
              No campaign claims — offer copy for this campaign would be blocked until claims are
              defined and active.
            </p>
          )}
        </div>

        {/* Publish destinations */}
        {campaign.publishDestinations.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-text-muted text-xs font-medium tracking-wide uppercase">
              Publish destinations
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {campaign.publishDestinations.map((destination) => (
                <span
                  key={destination}
                  className="text-text-secondary inline-flex items-center gap-1 rounded-full border border-[color:var(--border-subtle)] px-2 py-0.5 text-xs"
                >
                  <Send aria-hidden className="size-3" />
                  {destination}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <Separator />

        {/* Start Session entry point */}
        <div className="mt-auto">
          {isActive ? (
            <Button asChild>
              <Link href="/studio">
                <PlayCircle aria-hidden />
                Start session
              </Link>
            </Button>
          ) : (
            <DisabledReason reason={startReason}>
              <Button disabled aria-disabled>
                <PlayCircle aria-hidden />
                Start session
              </Button>
            </DisabledReason>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Empty state + composed screen
 * ------------------------------------------------------------------ */

export function CampaignsEmptyState() {
  return (
    <StateBanner
      title="No campaigns yet"
      message="Create a campaign to attach offers, validity windows, and allowed campaign claims that ground session copy."
      severity="neutral"
      icon={Megaphone}
    />
  );
}

export function CampaignsScreen({ campaigns }: { campaigns: CampaignCardData[] }) {
  if (campaigns.length === 0) {
    return <CampaignsEmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        {campaigns.map((data) => (
          <CampaignCard key={data.campaign.campaignId} data={data} />
        ))}
      </div>
      <p className="text-text-muted text-xs">
        Offer copy, prices, discounts, and shipping promises must resolve to an active, allowed
        campaign claim. Expired campaigns no longer ground new copy, and unsupported offers render a
        blocked state downstream.
      </p>
    </div>
  );
}

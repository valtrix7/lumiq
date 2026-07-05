/**
 * Seeded products, allowed claims, campaigns, and catalog snapshots.
 *
 * UI-only mock data for Catalog, Campaigns, Templates, Setup, and product-grounding UI.
 * Claims rendered in generated/publish copy must trace to these allowed claims. B2 object
 * keys begin with `tenants/{organization_id}/`. See data-model.md.
 */

import type {
  AllowedClaim,
  CatalogSnapshot,
  MockCampaign,
  MockProduct,
  MockTemplate,
} from "@/lib/screen-types";
import { DEMO_ORGANIZATION_ID } from "@/lib/mock-data/organization";

/* ------------------------------------------------------------------ *
 * Allowed claims
 * ------------------------------------------------------------------ */

export const ASTER_CROSSBODY_CLAIMS: AllowedClaim[] = [
  {
    claimId: "claim_aster_leather",
    claimText: "Full-grain Italian leather",
    source: "catalog",
    risk: "low",
    supportingField: "product.materials",
    status: "active",
  },
  {
    claimId: "claim_aster_strap",
    claimText: "Adjustable, removable crossbody strap",
    source: "catalog",
    risk: "low",
    supportingField: "product.features",
    status: "active",
  },
  {
    claimId: "claim_aster_handmade",
    claimText: "Hand-finished in small batches",
    source: "catalog",
    risk: "medium",
    supportingField: "product.description",
    status: "active",
  },
  {
    claimId: "claim_aster_spring_offer",
    claimText: "15% off during the Spring Drop",
    source: "campaign",
    risk: "restricted",
    supportingField: "campaign.offerTerms",
    status: "active",
  },
  {
    claimId: "claim_aster_free_ship",
    claimText: "Free shipping over $150",
    source: "campaign",
    risk: "restricted",
    supportingField: "campaign.offerTerms",
    status: "active",
  },
  {
    claimId: "claim_aster_waterproof",
    claimText: "Fully waterproof",
    source: "manual",
    risk: "restricted",
    supportingField: "unsupported",
    status: "blocked",
  },
];

/* ------------------------------------------------------------------ *
 * Products
 * ------------------------------------------------------------------ */

export const DEMO_PRODUCT_ID = "prod_aster_crossbody";

export const mockProducts: MockProduct[] = [
  {
    productId: DEMO_PRODUCT_ID,
    organizationId: DEMO_ORGANIZATION_ID,
    sku: "ASTER-CB-001",
    name: "Aster Crossbody Bag",
    productUrl: "https://shop.aster-atelier.example/products/aster-crossbody",
    priceLabel: "$168.00",
    inventoryLabel: "In stock · 42 units",
    mediaRefs: ["asset_prod_aster_front", "asset_prod_aster_detail"],
    allowedClaims: ASTER_CROSSBODY_CLAIMS,
    completeness: "complete",
    snapshotIncluded: true,
  },
  {
    productId: "prod_aster_wallet",
    organizationId: DEMO_ORGANIZATION_ID,
    sku: "ASTER-WL-004",
    name: "Aster Bifold Wallet",
    productUrl: "https://shop.aster-atelier.example/products/aster-bifold",
    priceLabel: "$72.00",
    inventoryLabel: "In stock · 120 units",
    mediaRefs: ["asset_prod_wallet_front"],
    allowedClaims: [
      {
        claimId: "claim_wallet_leather",
        claimText: "Full-grain leather",
        source: "catalog",
        risk: "low",
        supportingField: "product.materials",
        status: "active",
      },
      {
        claimId: "claim_wallet_rfid",
        claimText: "RFID-blocking lining",
        source: "catalog",
        risk: "medium",
        supportingField: "product.features",
        status: "active",
      },
    ],
    completeness: "complete",
    snapshotIncluded: true,
  },
  {
    productId: "prod_aster_tote",
    organizationId: DEMO_ORGANIZATION_ID,
    sku: "ASTER-TT-007",
    name: "Aster Market Tote",
    productUrl: "https://shop.aster-atelier.example/products/aster-tote",
    priceLabel: "$140.00",
    inventoryLabel: "Low stock · 6 units",
    mediaRefs: [],
    allowedClaims: [],
    completeness: "missing-media",
    snapshotIncluded: false,
  },
  {
    productId: "prod_aster_belt",
    organizationId: DEMO_ORGANIZATION_ID,
    sku: "ASTER-BL-002",
    name: "Aster Woven Belt",
    productUrl: "",
    priceLabel: "$58.00",
    inventoryLabel: "In stock · 88 units",
    mediaRefs: ["asset_prod_belt_front"],
    allowedClaims: [],
    completeness: "missing-url",
    snapshotIncluded: false,
  },
  {
    productId: "prod_aster_scarf",
    organizationId: DEMO_ORGANIZATION_ID,
    sku: "ASTER-SC-011",
    name: "Aster Silk Scarf",
    productUrl: "https://shop.aster-atelier.example/products/aster-scarf",
    priceLabel: "$48.00",
    inventoryLabel: "In stock · 64 units",
    mediaRefs: ["asset_prod_scarf_front"],
    allowedClaims: [
      {
        claimId: "claim_scarf_silk",
        claimText: "100% mulberry silk",
        source: "catalog",
        risk: "low",
        supportingField: "product.materials",
        status: "active",
      },
    ],
    completeness: "missing-claims",
    snapshotIncluded: true,
  },
  {
    productId: "prod_aster_card",
    organizationId: DEMO_ORGANIZATION_ID,
    sku: "ASTER-CC-009",
    name: "Aster Card Holder",
    productUrl: "https://shop.aster-atelier.example/products/aster-card",
    priceLabel: "$36.00",
    inventoryLabel: "Draft",
    mediaRefs: [],
    allowedClaims: [],
    completeness: "draft",
    snapshotIncluded: false,
  },
];

/* ------------------------------------------------------------------ *
 * Campaigns
 * ------------------------------------------------------------------ */

export const DEMO_CAMPAIGN_ID = "camp_spring_drop";

export const mockCampaigns: MockCampaign[] = [
  {
    campaignId: DEMO_CAMPAIGN_ID,
    organizationId: DEMO_ORGANIZATION_ID,
    name: "Spring Drop 2026",
    status: "active",
    activeProductIds: [DEMO_PRODUCT_ID, "prod_aster_wallet", "prod_aster_scarf"],
    offerTerms: "15% off sitewide, free shipping over $150.",
    startsAt: "2026-06-01T00:00:00.000Z",
    endsAt: "2026-07-15T23:59:59.000Z",
    allowedClaimIds: ["claim_aster_spring_offer", "claim_aster_free_ship"],
    publishDestinations: ["TikTok", "Instagram Reels", "YouTube Shorts"],
  },
  {
    campaignId: "camp_winter_clearance",
    organizationId: DEMO_ORGANIZATION_ID,
    name: "Winter Clearance 2025",
    status: "expired",
    activeProductIds: ["prod_aster_wallet", "prod_aster_belt"],
    offerTerms: "Up to 30% off select items.",
    startsAt: "2025-12-01T00:00:00.000Z",
    endsAt: "2026-01-15T23:59:59.000Z",
    allowedClaimIds: [],
    publishDestinations: ["Instagram Reels"],
  },
];

/* ------------------------------------------------------------------ *
 * Catalog snapshots (frozen commerce facts for a session)
 * ------------------------------------------------------------------ */

export const DEMO_CATALOG_SNAPSHOT_ID = "snap_01aster_spring";

export const mockCatalogSnapshots: CatalogSnapshot[] = [
  {
    catalogSnapshotId: DEMO_CATALOG_SNAPSHOT_ID,
    organizationId: DEMO_ORGANIZATION_ID,
    createdAt: "2026-06-26T14:02:11.000Z",
    productCount: 6,
    offerCount: 2,
    claimCount: 14,
    manifestAssetId: "asset_snap_aster_manifest",
    manifestB2Key: `tenants/${DEMO_ORGANIZATION_ID}/catalog-snapshots/snap_01aster_spring/manifest.json`,
    sha256: "9f2c8b7a4e1d5c0f6b3a2e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b",
    status: "ready",
  },
  {
    catalogSnapshotId: "snap_01aster_winter",
    organizationId: DEMO_ORGANIZATION_ID,
    createdAt: "2025-12-02T09:14:00.000Z",
    productCount: 4,
    offerCount: 1,
    claimCount: 6,
    manifestAssetId: "asset_snap_winter_manifest",
    manifestB2Key: `tenants/${DEMO_ORGANIZATION_ID}/catalog-snapshots/snap_01aster_winter/manifest.json`,
    sha256: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    status: "stale",
  },
];

/* ------------------------------------------------------------------ *
 * Templates (safe typed step graphs + allowed creative controls)
 *
 * Templates only expose appearance-preserving controls. Steps that could change product
 * color/material/shape are never present; restricted creative controls render as not-allowed.
 * These drive the Templates screen (US6) and are referenced by generation runs.
 * ------------------------------------------------------------------ */

export const DEMO_TEMPLATE_ID = "clean_product_reveal_v1";

export const mockTemplates: MockTemplate[] = [
  {
    templateId: DEMO_TEMPLATE_ID,
    organizationId: DEMO_ORGANIZATION_ID,
    name: "Clean Product Reveal",
    version: "v1",
    status: "active",
    category: "Product reveal",
    description:
      "Stabilize, reframe to vertical, apply a neutral grade, and add caption overlays grounded in allowed claims. Product appearance is never altered.",
    stepGraphId: "stepgraph_clean_reveal_v1",
    steps: [
      { stepId: "s1", label: "Ingest mezzanine", kind: "ingest", detail: "Decode raw mezzanine; no re-encode of source.", safe: true },
      { stepId: "s2", label: "Stabilize", kind: "stabilize", detail: "Motion stabilization within safe crop bounds.", safe: true },
      { stepId: "s3", label: "Reframe 9:16", kind: "reframe", detail: "Subject-aware reframe; product kept fully in frame.", safe: true },
      { stepId: "s4", label: "Neutral grade", kind: "color-grade", detail: "Exposure/contrast only — product hue is locked.", safe: true },
      { stepId: "s5", label: "Audio level", kind: "audio", detail: "Loudness normalization to platform target.", safe: true },
      { stepId: "s6", label: "Caption overlay", kind: "caption", detail: "Captions drawn only from allowed claims.", safe: true },
      { stepId: "s7", label: "Package variants", kind: "package", detail: "Emit 9:16 publish variant + thumbnail + manifest.", safe: true },
    ],
    allowedControls: [
      { controlId: "c_grade", label: "Neutral exposure / contrast", allowed: true, detail: "Bounded tone adjustment; no hue shift." },
      { controlId: "c_reframe", label: "Subject-aware reframe", allowed: true, detail: "Keeps the product fully in frame." },
      { controlId: "c_caption", label: "Caption from allowed claims", allowed: true, detail: "Caption text limited to grounded claims." },
      { controlId: "c_recolor", label: "Recolor product", allowed: false, detail: "Blocked — would change product color/material." },
      { controlId: "c_reshape", label: "Reshape / retouch product", allowed: false, detail: "Blocked — would change buyer expectations." },
      { controlId: "c_bg_swap", label: "Background replacement", allowed: false, detail: "Routed to review — can imply false context." },
    ],
    provider: "genblaze",
    providerPolicy:
      "Genblaze video-enhance-1 · appearance lock on · unsupported claims and background swaps route to human review.",
    providerReadiness: "mocked",
    appearanceLocked: true,
  },
  {
    templateId: "offer_callout_v2",
    organizationId: DEMO_ORGANIZATION_ID,
    name: "Offer Callout",
    version: "v2",
    status: "active",
    category: "Offer callout",
    description:
      "Highlight a campaign offer with a lower-third overlay. Offer text must map to an active, allowed campaign claim or the step is blocked.",
    stepGraphId: "stepgraph_offer_callout_v2",
    steps: [
      { stepId: "s1", label: "Ingest mezzanine", kind: "ingest", detail: "Decode raw mezzanine.", safe: true },
      { stepId: "s2", label: "Reframe 9:16", kind: "reframe", detail: "Subject-aware reframe.", safe: true },
      { stepId: "s3", label: "Offer lower-third", kind: "overlay", detail: "Overlay text bound to an allowed campaign claim.", safe: true },
      { stepId: "s4", label: "Caption overlay", kind: "caption", detail: "Captions from allowed claims only.", safe: true },
      { stepId: "s5", label: "Package variants", kind: "package", detail: "Emit publish variant + manifest.", safe: true },
    ],
    allowedControls: [
      { controlId: "c_offer", label: "Offer lower-third", allowed: true, detail: "Bound to active campaign offer claim." },
      { controlId: "c_caption", label: "Caption from allowed claims", allowed: true, detail: "Grounded claims only." },
      { controlId: "c_price_freeform", label: "Free-form price / discount text", allowed: false, detail: "Blocked — prices must come from campaign claims." },
    ],
    provider: "genblaze",
    providerPolicy:
      "Genblaze video-enhance-1 · offer text must resolve to an active campaign claim; otherwise blocked.",
    providerReadiness: "mocked",
    appearanceLocked: true,
  },
  {
    templateId: "lifestyle_scene_v1",
    organizationId: DEMO_ORGANIZATION_ID,
    name: "Lifestyle Scene",
    version: "v1",
    status: "provider-unavailable",
    category: "Lifestyle",
    description:
      "Place the product into a styled lifestyle scene. Background generation is gated and currently unavailable while the scene provider is degraded.",
    stepGraphId: "stepgraph_lifestyle_v1",
    steps: [
      { stepId: "s1", label: "Ingest mezzanine", kind: "ingest", detail: "Decode raw mezzanine.", safe: true },
      { stepId: "s2", label: "Subject isolate", kind: "reframe", detail: "Isolate product subject.", safe: true },
      { stepId: "s3", label: "Scene background", kind: "overlay", detail: "Generated background — routed to review.", safe: false },
      { stepId: "s4", label: "Package variants", kind: "package", detail: "Emit publish variant + manifest.", safe: true },
    ],
    allowedControls: [
      { controlId: "c_scene", label: "Generated scene background", allowed: false, detail: "Provider unavailable; review-gated when enabled." },
      { controlId: "c_recolor", label: "Recolor product", allowed: false, detail: "Blocked — appearance lock." },
    ],
    provider: "genblaze-scene",
    providerPolicy:
      "Scene provider degraded · template disabled until provider readiness returns; appearance lock on.",
    providerReadiness: "degraded",
    appearanceLocked: true,
  },
  {
    templateId: "raw_passthrough_v0",
    organizationId: DEMO_ORGANIZATION_ID,
    name: "Raw Passthrough (draft)",
    version: "v0",
    status: "draft",
    category: "Utility",
    description:
      "Draft template that packages the mezzanine with no enhancement. Not yet published for use in sessions.",
    stepGraphId: "stepgraph_raw_passthrough_v0",
    steps: [
      { stepId: "s1", label: "Ingest mezzanine", kind: "ingest", detail: "Decode raw mezzanine.", safe: true },
      { stepId: "s2", label: "Package variant", kind: "package", detail: "Emit a single publish variant + manifest.", safe: true },
    ],
    allowedControls: [
      { controlId: "c_caption", label: "Caption from allowed claims", allowed: true, detail: "Grounded claims only." },
    ],
    provider: "genblaze",
    providerPolicy: "Draft — not selectable in sessions until published.",
    providerReadiness: "mocked",
    appearanceLocked: true,
  },
];

/* ------------------------------------------------------------------ *
 * Lookups
 * ------------------------------------------------------------------ */

export function getTemplate(templateId: string): MockTemplate | undefined {
  return mockTemplates.find((t) => t.templateId === templateId);
}

export function getProduct(productId: string): MockProduct | undefined {
  return mockProducts.find((p) => p.productId === productId);
}

export function getCampaign(campaignId: string): MockCampaign | undefined {
  return mockCampaigns.find((c) => c.campaignId === campaignId);
}

export function getCatalogSnapshot(snapshotId: string): CatalogSnapshot | undefined {
  return mockCatalogSnapshots.find((s) => s.catalogSnapshotId === snapshotId);
}

export function getAllowedClaim(claimId: string): AllowedClaim | undefined {
  for (const product of mockProducts) {
    const found = product.allowedClaims.find((claim) => claim.claimId === claimId);
    if (found) return found;
  }
  return ASTER_CROSSBODY_CLAIMS.find((claim) => claim.claimId === claimId);
}

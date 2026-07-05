import type { Metadata } from "next";
import { WorkspaceContent, PageHeader, Section } from "@/components/shell/layout-primitives";
import { StateSwitcher } from "@/components/common/state-switcher";
import { resolveStateParam } from "@/lib/state-param";
import { StudioPreflight, type PreflightBlocker } from "@/components/studio/studio-preflight";
import { StudioControlRoom } from "@/components/studio/studio-control-room";
import { CandidateCard, StudioTimeline, type TimelineMarker } from "@/components/studio/studio-timeline";
import { StateBanner } from "@/components/common/status-primitives";
import {
  ASTER_CROSSBODY_CLAIMS,
  DEMO_CAMPAIGN_ID,
  DEMO_PRODUCT_ID,
  DEMO_SESSION_ID,
  getCampaign,
  getCatalogSnapshot,
  getDemoOrganization,
  getGenerationRun,
  getMoment,
  getProduct,
  mockSessions,
  mockSignals,
} from "@/lib/mock-data";
import type { MockMoment, MockSession } from "@/lib/screen-types";

export const metadata: Metadata = {
  title: "Live Studio",
  description:
    "Preflight readiness, live source preview, signal detection, candidate progress, product context, budget/policy, and the capture-to-review timeline. Seeded UI-only states.",
};

/* ------------------------------------------------------------------ *
 * State variants
 * ------------------------------------------------------------------ */

const STUDIO_VARIANTS = [
  { value: "live", label: "Live" },
  { value: "preflight", label: "Preflight" },
  { value: "candidate", label: "Candidate" },
  { value: "enhancing", label: "Enhancing" },
  { value: "review-ready", label: "Review ready" },
  { value: "budget-blocked", label: "Budget blocked" },
  { value: "provider-unavailable", label: "Provider down" },
  { value: "duplicate-suppressed", label: "Duplicate" },
  { value: "failed", label: "Failed" },
] as const;

const TIMELINE_DURATION_MS = 460_000;

interface StudioPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Live Studio (US3). Renders preflight, live detecting, candidate, enhancing, review-ready,
 * budget-blocked, provider-unavailable, duplicate-suppressed, and generation-failed states from
 * seeded session, signal, moment, and generation-run data. UI-only — no backend services.
 */
export default async function StudioPage({ searchParams }: StudioPageProps) {
  const params = await searchParams;
  const variant = resolveStateParam(params, "state", "live");

  const org = getDemoOrganization();
  const demoSession = mockSessions.find((s) => s.sessionId === DEMO_SESSION_ID) ?? mockSessions[0];
  const blockedSession =
    mockSessions.find((s) => s.budgetSummary.status === "danger") ?? demoSession;
  const snapshot = org.catalogSnapshotId ? getCatalogSnapshot(org.catalogSnapshotId) : undefined;
  const campaign = getCampaign(DEMO_CAMPAIGN_ID);
  const product = getProduct(DEMO_PRODUCT_ID);

  const demoSignals = mockSignals.filter((s) => s.sessionId === demoSession.sessionId);
  const blockedSignals = mockSignals.filter((s) => s.sessionId === blockedSession.sessionId);

  const candidateMoment = getMoment("mom_aster_candidate_live");
  const failedMoment = getMoment("mom_aster_offer_failed");
  const failedRun = getGenerationRun("run_02aster_failed");
  const reviewReadyMoment = getMoment("mom_aster_reveal");

  const markers: TimelineMarker[] = demoSignals.map((signal) => ({
    id: signal.signalId,
    label: signal.reason,
    timelineMs: signal.timelineMs,
    severity: signal.severity,
  }));

  const switcher = (
    <StateSwitcher options={[...STUDIO_VARIANTS]} defaultValue="live" label="Preview state" />
  );

  const header = (
    <PageHeader
      eyebrow="Seeded session · no live services"
      title="Live Studio"
      description="Monitor preflight readiness, live signals, candidate progress, and the capture-to-review chain."
      actions={switcher}
    />
  );

  /* ----- Preflight & provider-unavailable ----- */
  if (variant === "preflight" || variant === "provider-unavailable") {
    const providerDown = variant === "provider-unavailable";
    const blocker: PreflightBlocker | undefined = providerDown
      ? {
          title: "Generation provider unavailable",
          message:
            "The generation provider is not reachable. Capture can proceed, but enhancement is blocked until the provider recovers.",
          severity: "danger",
        }
      : undefined;
    const preflightOrg = providerDown ? { ...org, providerReadiness: "missing" as const } : org;
    return (
      <WorkspaceContent>
        {header}
        <StudioPreflight
          session={demoSession}
          org={preflightOrg}
          snapshot={snapshot}
          campaign={campaign}
          blocker={blocker}
        />
      </WorkspaceContent>
    );
  }

  /* ----- Control-room states ----- */
  let session: MockSession = demoSession;
  let signalsForRoom = demoSignals;
  let live = true;
  let controlsDisabledReason: string | undefined;
  let banner: { title: string; message: string; severity: "info" | "warning" | "danger" } | undefined;
  let candidate:
    | { moment: MockMoment; activeStepId: string; failed?: boolean; failedRun?: typeof failedRun }
    | undefined;

  switch (variant) {
    case "candidate":
      if (candidateMoment) candidate = { moment: candidateMoment, activeStepId: "candidate" };
      break;
    case "enhancing":
      if (failedMoment) candidate = { moment: failedMoment, activeStepId: "enhancing" };
      break;
    case "failed":
      if (failedMoment)
        candidate = { moment: failedMoment, activeStepId: "enhancing", failed: true, failedRun };
      banner = {
        title: "Generation failed",
        message: "A Genblaze enhancement run failed on a provider timeout. Retry is available.",
        severity: "danger",
      };
      break;
    case "review-ready":
      if (reviewReadyMoment)
        candidate = { moment: reviewReadyMoment, activeStepId: "review_ready" };
      break;
    case "duplicate-suppressed":
      banner = {
        title: "Duplicate suppressed",
        message:
          "A near-identical reveal within the dedupe window was suppressed — no second capture was authorized.",
        severity: "info",
      };
      break;
    case "budget-blocked":
      session = blockedSession;
      signalsForRoom = blockedSignals;
      live = false;
      controlsDisabledReason =
        "Auto-capture paused — session budget cap reached. Raise the cap to resume generation.";
      banner = {
        title: "Budget cap reached",
        message:
          "This session has spent its full budget. Generation requests are blocked until the cap is raised.",
        severity: "danger",
      };
      break;
    default:
      break;
  }

  return (
    <WorkspaceContent>
      {header}

      {banner ? (
        <StateBanner title={banner.title} message={banner.message} severity={banner.severity} />
      ) : null}

      <StudioControlRoom
        session={session}
        signals={signalsForRoom}
        product={product}
        claims={ASTER_CROSSBODY_CLAIMS}
        live={live}
        controlsDisabledReason={controlsDisabledReason}
      />

      {candidate ? (
        <Section title="Candidate progress">
          <CandidateCard
            moment={candidate.moment}
            activeStepId={candidate.activeStepId}
            failed={candidate.failed}
            failedRun={candidate.failedRun ?? undefined}
          />
        </Section>
      ) : null}

      <StudioTimeline markers={markers} durationMs={TIMELINE_DURATION_MS} />
    </WorkspaceContent>
  );
}

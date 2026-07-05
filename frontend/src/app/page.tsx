import { PublicShell } from "@/components/shell/layout-primitives";
import {
  ClosingCta,
  MarketingHero,
  ProofPathSection,
  TrustSection,
  WorkflowSection,
} from "@/components/marketing/marketing-sections";

/**
 * Lumiq landing page — public, no authentication, no workspace shell.
 *
 * Identifies Lumiq as a Live Commerce Moment Vault and explains the raw → published lineage
 * on the first screen. UI-only: all proof artifacts are seeded mock data.
 */
export default function Home() {
  return (
    <PublicShell>
      <MarketingHero />
      <ProofPathSection />
      <WorkflowSection />
      <TrustSection />
      <ClosingCta />
    </PublicShell>
  );
}

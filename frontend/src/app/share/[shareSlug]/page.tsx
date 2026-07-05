import type { Metadata } from "next";
import { ShareShell } from "@/components/shell/layout-primitives";
import { SharePage, ShareStatusChip } from "@/components/share/share-page";
import { getPublishPackage, getSharePage } from "@/lib/mock-data";

interface ShareRouteProps {
  params: Promise<{ shareSlug: string }>;
}

export async function generateMetadata({ params }: ShareRouteProps): Promise<Metadata> {
  const { shareSlug } = await params;
  const share = getSharePage(shareSlug);
  const pkg = share ? getPublishPackage(share.publishPackageId) : undefined;

  if (share?.state === "public" && pkg) {
    return { title: `${pkg.title} · Share`, description: pkg.description };
  }
  return { title: "Share", description: "A Lumiq share link." };
}

/**
 * Public share route — resolves a seeded share slug to its state (public, private/access-denied,
 * revoked, expired) and renders the matching view. Unknown slugs render the unavailable state.
 * No authentication, no workspace shell, UI-only seeded data.
 */
export default async function ShareSlugPage({ params }: ShareRouteProps) {
  const { shareSlug } = await params;
  const share = getSharePage(shareSlug);

  return (
    <ShareShell visibilitySlot={<ShareStatusChip share={share} />}>
      <SharePage share={share} slug={shareSlug} />
    </ShareShell>
  );
}

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminAdsQuery, useReviewAdminAdMutation } from "../api/ads.query";
import type { AdCampaign } from "../api/ads";
import { handleApiError } from "../api/client";
import { ApproveButton, PageHeader, Panel, RejectButton, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { ConfirmModal } from "../components/ui/confirm-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { formatMoney, formatNumber } from "../data";

const tooltipStyle = { backgroundColor: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" };

export function AdManagement({ accessToken }: { accessToken: string }) {
  const [selectedAd, setSelectedAd] = useState<AdCampaign | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    ad: AdCampaign;
    action: "approve" | "reject" | "hold" | "pause" | "resume" | "cancel";
  } | null>(null);
  const allQuery = useAdminAdsQuery(accessToken, { limit: 50 });
  const pendingQuery = useAdminAdsQuery(accessToken, { status: "pending", limit: 50 });
  const heldQuery = useAdminAdsQuery(accessToken, { status: "held", limit: 50 });
  const activeQuery = useAdminAdsQuery(accessToken, { status: "active", limit: 50 });
  const approvedQuery = useAdminAdsQuery(accessToken, { status: "approved", limit: 50 });
  const pausedQuery = useAdminAdsQuery(accessToken, { status: "paused", limit: 50 });
  const reviewMutation = useReviewAdminAdMutation(accessToken);

  const allAds = allQuery.data?.items ?? [];
  const approvalAds = [...(pendingQuery.data?.items ?? []), ...(heldQuery.data?.items ?? [])];
  const activeAds = [
    ...(activeQuery.data?.items ?? []),
    ...(approvedQuery.data?.items ?? []),
    ...(pausedQuery.data?.items ?? []),
  ];
  const revenue = buildRevenue(allAds);
  const isReviewing = reviewMutation.isPending;

  const runAction = (
    ad: AdCampaign,
    action: "approve" | "reject" | "hold" | "pause" | "resume" | "cancel",
  ) => {
    setPendingAction({ ad, action });
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    const { ad, action } = pendingAction;
    reviewMutation
      .mutateAsync({ adId: ad.id, action })
      .then(() => {
        setPendingAction(null);
        toast.success(`Ad campaign ${action}d.`);
      })
      .catch((error) => toast.error(handleApiError(error, "Ad action failed.")));
  };

  return (
    <div>
      <PageHeader title="Ad Management" subtitle="Manage advertisers, campaigns and ad revenue" />
      <Tabs defaultValue="advertisers">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="advertisers">Advertisers</TabsTrigger>
          <TabsTrigger value="approvals">Campaign Approvals</TabsTrigger>
          <TabsTrigger value="active">Active Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="advertisers" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Business Name</TableHead>
                  <TableHead className="text-[#A0A0A0]">Contact Email</TableHead>
                  <TableHead className="text-[#A0A0A0]">Total Spend</TableHead>
                  <TableHead className="text-[#A0A0A0]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allQuery.isLoading && <LoadingRow colSpan={4} label="Loading advertisers..." />}
                {!allQuery.isLoading && allAds.length === 0 && <EmptyRow colSpan={4} label="No ad campaigns found." />}
                {allAds.map((ad, i) => (
                  <TableRow key={ad.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell className="text-white">{businessName(ad)}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{ad.owner?.email || "No email"}</TableCell>
                    <TableCell className="text-white">{formatMoney(ad.metrics.spendUsd || ad.budgetUsd)}</TableCell>
                    <TableCell><StatusPill status={statusLabel(ad.status)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="approvals" className="mt-4">
          {pendingQuery.isLoading || heldQuery.isLoading ? (
            <Panel>
              <div className="flex items-center justify-center gap-2 py-10 text-[#A0A0A0]">
                <Loader2 className="size-4 animate-spin text-[#84CC16]" />
                Loading campaign approvals...
              </div>
            </Panel>
          ) : approvalAds.length === 0 ? (
            <Panel>
              <div className="py-10 text-center text-[#A0A0A0]">No campaigns are waiting for review.</div>
            </Panel>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {approvalAds.map((ad) => (
                <div key={ad.id} className="rounded-xl bg-[#1A1A1A] border border-white/5 overflow-hidden">
                  <div className="aspect-video">
                    <ImageWithFallback src={ad.mediaUrl || ""} alt={campaignTitle(ad)} className="size-full object-cover" />
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-white">{campaignTitle(ad)}</p>
                    <p className="text-sm text-[#A0A0A0]">Budget: <span className="text-white">{formatMoney(ad.budgetUsd)}</span></p>
                    <p className="text-sm text-[#A0A0A0]">Audience: {audienceText(ad)}</p>
                    <p className="text-sm text-[#A0A0A0]">Area: {areaText(ad)}</p>
                    <div className="flex gap-2 pt-2">
                      <ApproveButton className="flex-1" disabled={isReviewing} onClick={() => runAction(ad, "approve")}>Approve</ApproveButton>
                      <RejectButton className="flex-1" disabled={isReviewing} onClick={() => runAction(ad, "reject")}>Reject</RejectButton>
                      <Button size="sm" variant="outline" className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 bg-transparent" disabled={isReviewing} onClick={() => runAction(ad, "hold")}>Hold</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          {activeQuery.isLoading || approvedQuery.isLoading || pausedQuery.isLoading ? (
            <Panel>
              <div className="flex items-center justify-center gap-2 py-10 text-[#A0A0A0]">
                <Loader2 className="size-4 animate-spin text-[#84CC16]" />
                Loading campaigns...
              </div>
            </Panel>
          ) : activeAds.length === 0 ? (
            <Panel>
              <div className="py-10 text-center text-[#A0A0A0]">No active campaigns.</div>
            </Panel>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {activeAds.map((ad) => (
                <CampaignCard
                  key={ad.id}
                  ad={ad}
                  isReviewing={isReviewing}
                  onDetails={() => setSelectedAd(ad)}
                  onAction={runAction}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Panel title="Ad Revenue Report" className="mt-6">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenue}>
            <defs>
              <linearGradient id="adFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#84CC16" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#84CC16" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="revenue" stroke="#84CC16" strokeWidth={2} fill="url(#adFill)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <Sheet open={!!selectedAd} onOpenChange={(open) => !open && setSelectedAd(null)}>
        <SheetContent className="bg-[#1A1A1A] border-white/10 text-white w-full sm:max-w-xl overflow-y-auto">
          {selectedAd && (
            <>
              <SheetHeader>
                <SheetTitle className="text-white">{campaignTitle(selectedAd)}</SheetTitle>
                <SheetDescription className="text-[#A0A0A0]">Campaign details and performance</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6 space-y-5">
                <AdMedia ad={selectedAd} className="rounded-xl overflow-hidden bg-black aspect-video" controls />

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Status", statusLabel(selectedAd.status)],
                    ["Advertiser", businessName(selectedAd)],
                    ["Email", selectedAd.owner?.email || "No email"],
                    ["Budget", formatMoney(selectedAd.budgetUsd)],
                    ["Spend", formatMoney(selectedAd.metrics.spendUsd || selectedAd.budgetUsd)],
                    ["Days", `${selectedAd.days}`],
                    ["Audience", audienceText(selectedAd)],
                    ["Area", areaText(selectedAd)],
                    ["Impressions", formatNumber(selectedAd.metrics.impressions)],
                    ["Clicks", formatNumber(selectedAd.metrics.clicks)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-white/5 p-3">
                      <p className="text-[#A0A0A0] text-xs">{label}</p>
                      <p className="mt-1 text-white text-sm break-words">{value}</p>
                    </div>
                  ))}
                </div>

                {selectedAd.description && (
                  <div>
                    <p className="text-white text-sm font-semibold">Description</p>
                    <p className="mt-2 rounded-lg bg-white/5 p-3 text-sm text-[#D4D4D4]">{selectedAd.description}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {selectedAd.destinationUrl && (
                    <Button
                      variant="outline"
                      className="border-white/15 text-white hover:bg-white/5 bg-transparent"
                      onClick={() => window.open(selectedAd.destinationUrl!, "_blank", "noopener,noreferrer")}
                    >
                      Open Destination <ExternalLink className="size-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 bg-transparent"
                    disabled={isReviewing}
                    onClick={() => runAction(selectedAd, selectedAd.status === "paused" ? "resume" : "pause")}
                  >
                    {selectedAd.status === "paused" ? "Resume" : "Pause"}
                  </Button>
                  <RejectButton disabled={isReviewing} onClick={() => runAction(selectedAd, "cancel")}>Cancel</RejectButton>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <ConfirmModal
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={`${getActionLabel(pendingAction?.action)} Campaign`}
        description={`${getActionLabel(pendingAction?.action)} "${pendingAction ? campaignTitle(pendingAction.ad) : "this campaign"}"? This change will be recorded in admin audit logs.`}
        confirmText={isReviewing ? "Working..." : getActionLabel(pendingAction?.action)}
        variant={pendingAction?.action === "approve" || pendingAction?.action === "resume" ? "default" : "destructive"}
        onConfirm={confirmAction}
      />
    </div>
  );
}

function CampaignCard({
  ad,
  isReviewing,
  onDetails,
  onAction,
}: {
  ad: AdCampaign;
  isReviewing: boolean;
  onDetails: () => void;
  onAction: (ad: AdCampaign, action: "approve" | "reject" | "hold" | "pause" | "resume" | "cancel") => void;
}) {
  return (
    <div className="rounded-xl bg-[#1A1A1A] border border-white/5 overflow-hidden">
      <AdMedia ad={ad} className="aspect-video bg-black" controls />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-white truncate">{campaignTitle(ad)}</p>
            <p className="text-sm text-[#A0A0A0] truncate">{businessName(ad)}</p>
          </div>
          <StatusPill status={statusLabel(ad.status)} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <Metric label="Views" value={formatNumber(ad.metrics.impressions)} />
          <Metric label="Clicks" value={formatNumber(ad.metrics.clicks)} />
          <Metric label="Spend" value={formatMoney(ad.metrics.spendUsd || ad.budgetUsd)} />
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="flex-1 border-white/15 text-white hover:bg-white/5 bg-transparent" onClick={onDetails}>
            Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 bg-transparent"
            disabled={isReviewing}
            onClick={() => onAction(ad, ad.status === "paused" ? "resume" : "pause")}
          >
            {ad.status === "paused" ? "Resume" : "Pause"}
          </Button>
          <RejectButton disabled={isReviewing} onClick={() => onAction(ad, "cancel")}>Cancel</RejectButton>
        </div>
      </div>
    </div>
  );
}

function AdMedia({ ad, className, controls = false }: { ad: AdCampaign; className?: string; controls?: boolean }) {
  if (isVideoUrl(ad.mediaUrl)) {
    return (
      <div className={className}>
        <video src={ad.mediaUrl || undefined} className="size-full object-cover" controls={controls} playsInline preload="metadata" />
      </div>
    );
  }

  return (
    <div className={className}>
      <ImageWithFallback src={ad.mediaUrl || ""} alt={campaignTitle(ad)} className="size-full object-cover" />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 p-2">
      <p className="text-[#A0A0A0] text-xs">{label}</p>
      <p className="text-white text-sm truncate">{value}</p>
    </div>
  );
}

function LoadingRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow className="border-white/5 hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-8 text-center text-[#A0A0A0]">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin text-[#84CC16]" />
          {label}
        </div>
      </TableCell>
    </TableRow>
  );
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow className="border-white/5 hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-8 text-center text-[#A0A0A0]">{label}</TableCell>
    </TableRow>
  );
}

function campaignTitle(ad: AdCampaign) {
  return ad.title || ad.category || "Ad campaign";
}

function businessName(ad: AdCampaign) {
  return ad.owner?.displayName || ad.owner?.username || ad.title || ad.category || "Advertiser";
}

function statusLabel(status: AdCampaign["status"]) {
  const labels: Record<AdCampaign["status"], string> = {
    draft: "Pending",
    pending: "Pending",
    approved: "Active",
    active: "Active",
    paused: "Paused",
    held: "Pending",
    rejected: "Rejected",
    completed: "Completed",
    cancelled: "Canceled",
  };
  return labels[status];
}

function audienceText(ad: AdCampaign) {
  const labels: Record<AdCampaign["audienceType"], string> = {
    same_interest: "Same interest users",
    interest_in_topic: "Interested in topic",
    all_users: "All users",
  };
  return `${labels[ad.audienceType]} · ${formatNumber(ad.targetUsers)} users`;
}

function areaText(ad: AdCampaign) {
  if (ad.areaType === "city") return ad.city || "City";
  if (ad.areaType === "country") return ad.country || "Country";
  return "Worldwide";
}

function isVideoUrl(url: string | null) {
  if (!url) return false;
  const value = url.toLowerCase().split("?")[0];
  return value.endsWith(".mp4") || value.endsWith(".mov") || value.endsWith(".webm") || value.includes("/video/");
}

function buildRevenue(ads: AdCampaign[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const totals = new Map(months.map((month) => [month, 0]));

  ads.forEach((ad) => {
    const month = new Date(ad.createdAt).toLocaleString("en-US", { month: "short" });
    if (totals.has(month)) {
      totals.set(month, (totals.get(month) ?? 0) + (ad.metrics.spendUsd || ad.budgetUsd));
    }
  });

  return months.map((month) => ({ month, revenue: totals.get(month) ?? 0 }));
}

function getActionLabel(action?: "approve" | "reject" | "hold" | "pause" | "resume" | "cancel") {
  if (action === "approve") return "Approve";
  if (action === "reject") return "Reject";
  if (action === "hold") return "Hold";
  if (action === "pause") return "Pause";
  if (action === "resume") return "Resume";
  if (action === "cancel") return "Cancel";
  return "Confirm";
}

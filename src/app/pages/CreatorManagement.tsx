import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminCreatorAnalyticsQuery,
  useApproveCreatorApplicationMutation,
  useCreatorApplicationsQuery,
  useHoldCreatorApplicationMutation,
  useRejectCreatorApplicationMutation,
} from "../api/creators.query";
import type { CreatorApplication } from "../api/creators";
import { handleApiError } from "../api/client";
import { ApproveButton, PageHeader, Panel, RejectButton, StatCard, StatusPill } from "../components/shared";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import { formatMoney, formatNumber } from "../data";

const tooltipStyle = { backgroundColor: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" };

function displayName(application: CreatorApplication) {
  return application.user.profile?.displayName || application.fullName || application.user.email || "Creator";
}

function avatarFallback(application: CreatorApplication) {
  return displayName(application).slice(0, 1).toUpperCase();
}

function adminStatus(status: CreatorApplication["status"]) {
  if (status === "approved") return "Active";
  if (status === "rejected") return "Rejected";
  if (status === "held") return "Held";
  return "Pending";
}

function Performance({ accessToken, creator, onBack }: { accessToken: string; creator: CreatorApplication; onBack: () => void }) {
  const analyticsQuery = useAdminCreatorAnalyticsQuery(accessToken, creator.user.id, '28d');
  const analytics = analyticsQuery.data;
  const summary = analytics?.summary;

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="text-[#A0A0A0] hover:text-white mb-4 -ml-2">
        <ArrowLeft className="size-4" /> Back to creators
      </Button>
      <PageHeader title={`${displayName(creator)} — Performance`} subtitle="Individual creator analytics" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Earnings" value={formatMoney(summary?.earningsUsd ?? 0)} change={`${formatMoney(summary?.availableEarningsUsd ?? 0)} available`} positive />
        <StatCard label="Followers" value={formatNumber(summary?.followers ?? 0)} change={`+${formatNumber(summary?.newFollowers ?? 0)} in 28d`} positive />
        <StatCard label="Engagement Rate" value={`${summary?.engagementRate ?? 0}%`} change={`${formatNumber(summary?.views ?? 0)} views`} positive />
      </div>
      <Panel title="Earnings Over Time">
        {analyticsQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-[#A0A0A0]">
            <Loader2 className="size-4 animate-spin text-[#84CC16]" />
            Loading analytics...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={(analytics?.trend ?? []).map((item) => ({ ...item, day: item.date.slice(5) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="#A0A0A0" tick={{ fontSize: 11 }} />
              <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(132,204,22,0.08)" }} />
              <Bar dataKey="views" fill="#84CC16" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>
    </div>
  );
}

export function CreatorManagement({ accessToken }: { accessToken: string }) {
  const [perf, setPerf] = useState<CreatorApplication | null>(null);
  const [selected, setSelected] = useState<CreatorApplication | null>(null);
  const [reviewState, setReviewState] = useState<{
    action: "approve" | "reject" | "hold";
    application: CreatorApplication;
    reason: string;
  } | null>(null);
  const pendingQuery = useCreatorApplicationsQuery(accessToken, "pending");
  const heldQuery = useCreatorApplicationsQuery(accessToken, "held");
  const activeQuery = useCreatorApplicationsQuery(accessToken, "approved");
  const rejectedQuery = useCreatorApplicationsQuery(accessToken, "rejected");
  const approveMutation = useApproveCreatorApplicationMutation(accessToken);
  const rejectMutation = useRejectCreatorApplicationMutation(accessToken);
  const holdMutation = useHoldCreatorApplicationMutation(accessToken);
  const isReviewing = approveMutation.isPending || rejectMutation.isPending || holdMutation.isPending;
  const pendingCreators = pendingQuery.data?.items ?? [];
  const heldCreators = heldQuery.data?.items ?? [];
  const activeCreators = activeQuery.data?.items ?? [];
  const rejectedCreators = rejectedQuery.data?.items ?? [];

  const reviewApplication = (
    action: "approve" | "reject" | "hold",
    application: CreatorApplication,
  ) => {
    setReviewState({ action, application, reason: application.adminReason || "" });
  };

  const submitReview = () => {
    if (!reviewState || isReviewing) return;
    const { action, application, reason } = reviewState;
    const mutation =
      action === "approve" ? approveMutation : action === "reject" ? rejectMutation : holdMutation;
    const successMessage =
      action === "approve"
        ? "Creator application approved."
        : action === "reject"
          ? "Creator application rejected."
          : "Creator application held.";
    if (action !== "approve" && !reason.trim()) {
      toast.error(action === "reject" ? "Reject reason is required." : "Hold reason is required.");
      return;
    }

    const payload = action === "approve" ? application.id : { id: application.id, reason: reason?.trim() || undefined };

    mutation
      .mutateAsync(payload as never)
      .then(() => {
        setSelected(null);
        setReviewState(null);
        toast.success(successMessage);
      })
      .catch((error) => {
        toast.error(handleApiError(error, "Creator review failed."));
      });
  };

  if (perf) return <Performance accessToken={accessToken} creator={perf} onBack={() => setPerf(null)} />;

  return (
    <div>
      <PageHeader title="Creator Management" subtitle="Review applications and manage active creators" />
      <Tabs defaultValue="pending">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="pending">Pending Review ({pendingCreators.length})</TabsTrigger>
          <TabsTrigger value="held">On Hold ({heldCreators.length})</TabsTrigger>
          <TabsTrigger value="active">Active Creators ({activeCreators.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCreators.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <CreatorApplicationTable
            applications={pendingCreators}
            isLoading={pendingQuery.isLoading}
            emptyText="No pending applications."
            isReviewing={isReviewing}
            onSelect={setSelected}
            onPerformance={setPerf}
            onReview={reviewApplication}
          />
        </TabsContent>

        <TabsContent value="held" className="mt-4">
          <CreatorApplicationTable
            applications={heldCreators}
            isLoading={heldQuery.isLoading}
            emptyText="No held applications."
            isReviewing={isReviewing}
            onSelect={setSelected}
            onPerformance={setPerf}
            onReview={reviewApplication}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <CreatorApplicationTable
            applications={activeCreators}
            isLoading={activeQuery.isLoading}
            emptyText="No active creators."
            isReviewing={isReviewing}
            onSelect={setSelected}
            onPerformance={setPerf}
            onReview={reviewApplication}
          />
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <CreatorApplicationTable
            applications={rejectedCreators}
            isLoading={rejectedQuery.isLoading}
            emptyText="No rejected applications."
            isReviewing={isReviewing}
            onSelect={setSelected}
            onPerformance={setPerf}
            onReview={reviewApplication}
          />
        </TabsContent>
      </Tabs>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="bg-[#1A1A1A] border-white/10 text-white w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-white">Creator Application</SheetTitle>
                <SheetDescription className="text-[#A0A0A0]">Review applicant information and documents</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6 space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarImage src={selected.user.profile?.photoUrl} />
                    <AvatarFallback>{avatarFallback(selected)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white text-lg">{displayName(selected)}</p>
                    <p className="text-[#A0A0A0] text-sm">{selected.email}</p>
                    <div className="mt-1"><StatusPill status={adminStatus(selected.status)} /></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Full Name", selected.fullName],
                    ["DOB", selected.dateOfBirth || "Not provided"],
                    ["Occupation", selected.occupation || "Not provided"],
                    ["Category", selected.contentCategory],
                    ["Language", selected.contentLanguage],
                    ["Country", selected.country],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-white/5 p-3">
                      <p className="text-[#A0A0A0] text-xs">{label}</p>
                      <p className="mt-1 text-white text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-white text-sm font-semibold">Application Reason</p>
                  <p className="mt-2 rounded-lg bg-white/5 p-3 text-sm text-[#D4D4D4]">{selected.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <DocumentPreview label="ID Front" url={selected.idFrontUrl} />
                  <DocumentPreview label="ID Back" url={selected.idBackUrl} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <ApproveButton disabled={isReviewing} onClick={() => reviewApplication("approve", selected)}>Approve</ApproveButton>
                  <RejectButton disabled={isReviewing} onClick={() => reviewApplication("reject", selected)}>Reject</RejectButton>
                  <Button
                    variant="outline"
                    className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 bg-transparent"
                    disabled={isReviewing}
                    onClick={() => reviewApplication("hold", selected)}
                  >
                    Hold
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <Dialog open={!!reviewState} onOpenChange={(open) => !open && setReviewState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewState?.action === "approve"
                ? "Approve Creator"
                : reviewState?.action === "reject"
                  ? "Reject Creator"
                  : "Hold Creator"}
            </DialogTitle>
            <DialogDescription>
              {reviewState?.action === "approve"
                ? "Confirm that this creator application is valid and ready for monetization tools."
                : "Add a clear reason so the review decision is traceable."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
              <div className="text-white">{reviewState ? displayName(reviewState.application) : "Creator"}</div>
              <div className="text-[#A0A0A0]">{reviewState?.application.email}</div>
            </div>
            {reviewState?.action !== "approve" && (
              <Textarea
                value={reviewState?.reason ?? ""}
                onChange={(event) => setReviewState((current) => (current ? { ...current, reason: event.target.value } : current))}
                placeholder={reviewState?.action === "reject" ? "Reject reason" : "Hold reason"}
                className="min-h-24 bg-[#111] border-white/10"
              />
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-white/10 bg-transparent hover:bg-white/5" onClick={() => setReviewState(null)}>
                Cancel
              </Button>
              <Button
                className={
                  reviewState?.action === "reject"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : reviewState?.action === "hold"
                      ? "bg-amber-500 text-black hover:bg-amber-500/90"
                      : "bg-[#84CC16] text-black hover:bg-[#84CC16]/90"
                }
                disabled={isReviewing}
                onClick={submitReview}
              >
                {isReviewing ? "Working..." : reviewState?.action === "approve" ? "Approve" : reviewState?.action === "reject" ? "Reject" : "Hold"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreatorApplicationTable({
  applications,
  isLoading,
  emptyText,
  isReviewing,
  onSelect,
  onPerformance,
  onReview,
}: {
  applications: CreatorApplication[];
  isLoading: boolean;
  emptyText: string;
  isReviewing: boolean;
  onSelect: (application: CreatorApplication) => void;
  onPerformance: (application: CreatorApplication) => void;
  onReview: (action: "approve" | "reject" | "hold", application: CreatorApplication) => void;
}) {
  return (
    <Panel>
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[#A0A0A0]">Creator</TableHead>
            <TableHead className="text-[#A0A0A0]">Category</TableHead>
            <TableHead className="text-[#A0A0A0]">Country</TableHead>
            <TableHead className="text-[#A0A0A0]">Status</TableHead>
            <TableHead className="text-[#A0A0A0]">Applied</TableHead>
            <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableCell colSpan={6} className="py-8 text-center text-[#A0A0A0]">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin text-[#84CC16]" />
                  Loading creator applications...
                </div>
              </TableCell>
            </TableRow>
          )}
          {!isLoading && applications.length === 0 && (
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableCell colSpan={6} className="py-8 text-center text-[#A0A0A0]">
                {emptyText}
              </TableCell>
            </TableRow>
          )}
          {applications.map((application, index) => (
            <TableRow
              key={application.id}
              onClick={() => application.status === "approved" ? onPerformance(application) : onSelect(application)}
              className={`border-white/5 cursor-pointer hover:bg-white/5 ${index % 2 ? "bg-white/[0.02]" : ""}`}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={application.user.profile?.photoUrl} />
                    <AvatarFallback>{avatarFallback(application)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-white">{displayName(application)}</span>
                    <p className="text-[#A0A0A0] text-xs">{application.user.email || application.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-[#A0A0A0]">{application.contentCategory}</TableCell>
              <TableCell className="text-white">{application.country}</TableCell>
              <TableCell><StatusPill status={adminStatus(application.status)} /></TableCell>
              <TableCell className="text-[#A0A0A0]">{new Date(application.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/15 text-white hover:bg-white/5 bg-transparent"
                    onClick={() => onSelect(application)}
                  >
                    Review
                  </Button>
                  {application.status === "approved" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#84CC16]/40 text-[#84CC16] hover:bg-[#84CC16]/10 bg-transparent"
                      onClick={() => onPerformance(application)}
                    >
                      Analytics
                    </Button>
                  ) : (
                    <ApproveButton disabled={isReviewing} onClick={() => onReview("approve", application)}>
                      Approve
                    </ApproveButton>
                  )}
                  {application.status !== "rejected" && (
                    <RejectButton disabled={isReviewing} onClick={() => onReview("reject", application)}>
                      Reject
                    </RejectButton>
                  )}
                  {application.status !== "held" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 bg-transparent"
                      disabled={isReviewing}
                      onClick={() => onReview("hold", application)}
                    >
                      Hold
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  );
}

function DocumentButton({ label, url }: { label: string; url?: string }) {
  if (!url) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-[#A0A0A0]">
        {label}: Not uploaded
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="justify-between border-white/15 bg-transparent text-white hover:bg-white/5"
      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
    >
      {label}
      <ExternalLink className="size-4" />
    </Button>
  );
}

function DocumentPreview({ label, url }: { label: string; url?: string }) {
  if (!url) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-white text-sm font-semibold mb-2">{label}</p>
        <div className="aspect-[1.58/1] rounded-lg border border-dashed border-white/15 bg-black/20 flex items-center justify-center text-sm text-[#A0A0A0]">
          Not uploaded
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="group rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:bg-white/[0.07] transition-colors"
      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-white text-sm font-semibold">{label}</p>
        <ExternalLink className="size-4 text-[#A0A0A0] group-hover:text-white" />
      </div>
      <div className="aspect-[1.58/1] overflow-hidden rounded-lg bg-black/30 border border-white/10">
        <img src={url} alt={label} className="size-full object-cover" />
      </div>
    </button>
  );
}

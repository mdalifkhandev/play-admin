import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useModerationReportsQuery, useReviewModerationReportMutation } from "../api/moderation.query";
import type { ModerationAction, ModerationReport, ModerationTargetType } from "../api/moderation";
import { handleApiError } from "../api/client";
import { PageHeader, Panel, StatusPill } from "../components/shared";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { ConfirmModal } from "../components/ui/confirm-modal";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const targetLabels: Record<ModerationTargetType, string> = {
  reel: "Reels",
  comment: "Comments",
  user: "Users",
  profile: "Profiles",
  live_stream: "Live Streams",
};

export function ContentModeration({ accessToken }: { accessToken: string }) {
  return (
    <div>
      <PageHeader title="Content Moderation" subtitle="Review reported content and enforce guidelines" />
      <Tabs defaultValue="reel">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="reel">Reported Reels</TabsTrigger>
          <TabsTrigger value="comment">Reported Comments</TabsTrigger>
          <TabsTrigger value="user">Reported Users</TabsTrigger>
          <TabsTrigger value="profile">Reported Profiles</TabsTrigger>
          <TabsTrigger value="log">Violation Log</TabsTrigger>
        </TabsList>

        {(["reel", "comment", "user", "profile"] as const).map((targetType) => (
          <TabsContent key={targetType} value={targetType} className="mt-4">
            {targetType === "reel" ? (
              <ReportedReels accessToken={accessToken} targetType={targetType} />
            ) : (
              <ReportedTable accessToken={accessToken} targetType={targetType} />
            )}
          </TabsContent>
        ))}

        <TabsContent value="log" className="mt-4">
          <ViolationLog accessToken={accessToken} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportedReels({ accessToken, targetType }: { accessToken: string; targetType: ModerationTargetType }) {
  const query = useModerationReportsQuery(accessToken, { targetType, status: "pending", limit: 50 });
  const reviewMutation = useReviewModerationReportMutation(accessToken);
  const items = query.data?.items ?? [];

  if (query.isLoading) return <LoadingPanel label="Loading reported reels..." />;
  if (items.length === 0) return <EmptyPanel label="No reported reels." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {items.map((report) => (
        <div key={report.id} className="rounded-xl bg-[#1A1A1A] border border-white/5 overflow-hidden">
          <div className="relative aspect-video">
            <ImageWithFallback src={report.content?.thumbnailUrl || report.content?.mediaUrl || ""} alt={report.reason} className="size-full object-cover" />
            <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0">{report.reportCount} reports</Badge>
            <Badge className="absolute top-2 left-2 bg-black/60 text-white border-0 backdrop-blur">{report.reason}</Badge>
          </div>
          <div className="p-4">
            <p className="text-white text-sm">{report.content?.title || "Reported reel"}</p>
            <p className="text-[#A0A0A0] text-xs mb-3">Owner: {report.owner?.displayName || report.owner?.email || "Unknown"}</p>
            <ActionButtons report={report} isLoading={reviewMutation.isPending} onAction={(action) => review(reviewMutation, report, action)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportedTable({ accessToken, targetType }: { accessToken: string; targetType: ModerationTargetType }) {
  const query = useModerationReportsQuery(accessToken, { targetType, status: "pending", limit: 50 });
  const reviewMutation = useReviewModerationReportMutation(accessToken);
  const items = query.data?.items ?? [];

  return (
    <Panel>
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[#A0A0A0]">{targetLabels[targetType]}</TableHead>
            <TableHead className="text-[#A0A0A0]">Owner</TableHead>
            <TableHead className="text-[#A0A0A0]">Reason</TableHead>
            <TableHead className="text-[#A0A0A0]">Reports</TableHead>
            <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {query.isLoading && (
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableCell colSpan={5} className="py-8 text-center text-[#A0A0A0]">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin text-[#84CC16]" />
                  Loading reports...
                </div>
              </TableCell>
            </TableRow>
          )}
          {!query.isLoading && items.length === 0 && (
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableCell colSpan={5} className="py-8 text-center text-[#A0A0A0]">
                No pending {targetLabels[targetType].toLowerCase()} reports.
              </TableCell>
            </TableRow>
          )}
          {items.map((report, i) => (
            <TableRow key={report.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
              <TableCell className="text-white max-w-xs truncate">{report.content?.title || report.targetId}</TableCell>
              <TableCell className="text-[#A0A0A0]">{report.owner?.displayName || report.owner?.email || "Unknown"}</TableCell>
              <TableCell><Badge variant="outline" className="border-red-500/30 text-red-400">{report.reason}</Badge></TableCell>
              <TableCell className="text-white">{report.reportCount}</TableCell>
              <TableCell className="text-right">
                <ActionButtons report={report} isLoading={reviewMutation.isPending} onAction={(action) => review(reviewMutation, report, action)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  );
}

function ViolationLog({ accessToken }: { accessToken: string }) {
  const query = useModerationReportsQuery(accessToken, { status: "resolved", limit: 50 });
  const items = query.data?.items ?? [];

  return (
    <Panel>
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[#A0A0A0]">User</TableHead>
            <TableHead className="text-[#A0A0A0]">Type</TableHead>
            <TableHead className="text-[#A0A0A0]">Date</TableHead>
            <TableHead className="text-[#A0A0A0]">Action Taken</TableHead>
            <TableHead className="text-[#A0A0A0]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {query.isLoading && (
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableCell colSpan={5} className="py-8 text-center text-[#A0A0A0]">
                <Loader2 className="inline size-4 animate-spin text-[#84CC16]" /> Loading log...
              </TableCell>
            </TableRow>
          )}
          {!query.isLoading && items.length === 0 && (
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableCell colSpan={5} className="py-8 text-center text-[#A0A0A0]">No violation log yet.</TableCell>
            </TableRow>
          )}
          {items.map((report, i) => (
            <TableRow key={report.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
              <TableCell className="text-white">{report.owner?.displayName || report.owner?.email || "Unknown"}</TableCell>
              <TableCell className="text-[#A0A0A0]">{report.targetType}</TableCell>
              <TableCell className="text-[#A0A0A0]">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-[#A0A0A0]">{report.action}</TableCell>
              <TableCell><StatusPill status={report.action === "ban" ? "Banned" : report.action === "warn" ? "Warned" : "Completed"} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  );
}

function ActionButtons({
  report,
  isLoading,
  onAction,
}: {
  report: ModerationReport;
  isLoading: boolean;
  onAction: (action: ModerationAction) => void;
}) {
  const isUserTarget = report.targetType === "user" || report.targetType === "profile";
  const [confirmState, setConfirmState] = useState<{ open: boolean; action: ModerationAction | null }>({ open: false, action: null });

  const handleActionClick = (action: ModerationAction) => {
    if (action === "keep") {
      onAction(action);
    } else {
      setConfirmState({ open: true, action });
    }
  };

  const actionLabels: Record<ModerationAction, string> = {
    remove: isUserTarget ? "Suspend" : "Remove",
    warn: "Warn",
    ban: "Ban",
    keep: "Ignore",
    suspend: "Suspend"
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button size="sm" className="bg-red-500 text-white hover:bg-red-500/90" disabled={isLoading} onClick={() => handleActionClick("remove")}>
          {actionLabels.remove}
        </Button>
        <Button size="sm" variant="outline" className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 bg-transparent" disabled={isLoading} onClick={() => handleActionClick("warn")}>Warn</Button>
        <Button size="sm" variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10 bg-transparent" disabled={isLoading} onClick={() => handleActionClick("ban")}>Ban</Button>
        <Button size="sm" variant="outline" className="border-white/15 text-[#A0A0A0] hover:bg-white/5 bg-transparent" disabled={isLoading} onClick={() => handleActionClick("keep")}>Ignore</Button>
      </div>

      <ConfirmModal
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState({ ...confirmState, open })}
        title={`Confirm ${confirmState.action ? actionLabels[confirmState.action] : ""}`}
        description={`Are you sure you want to ${confirmState.action ? actionLabels[confirmState.action].toLowerCase() : ""} this?`}
        onConfirm={() => confirmState.action && onAction(confirmState.action)}
        variant={confirmState.action === 'warn' ? 'default' : 'destructive'}
      />
    </>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <Panel>
      <div className="flex items-center justify-center gap-2 py-10 text-[#A0A0A0]">
        <Loader2 className="size-4 animate-spin text-[#84CC16]" />
        {label}
      </div>
    </Panel>
  );
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <Panel>
      <div className="py-10 text-center text-[#A0A0A0]">{label}</div>
    </Panel>
  );
}

function review(
  mutation: ReturnType<typeof useReviewModerationReportMutation>,
  report: ModerationReport,
  action: ModerationAction,
) {
  mutation
    .mutateAsync({ reportId: report.id, action })
    .then(() => toast.success("Moderation action completed."))
    .catch((error) => toast.error(handleApiError(error, "Moderation action failed.")));
}

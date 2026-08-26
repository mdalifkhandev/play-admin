import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminWithdrawalsQuery,
  useApproveAdminWithdrawalMutation,
  useCompleteAdminWithdrawalMutation,
  useRejectAdminWithdrawalMutation,
  useRetryAdminWithdrawalMutation,
} from "../api/withdrawals.query";
import type { AdminWithdrawal, WithdrawalStatus } from "../api/withdrawals";
import { handleApiError } from "../api/client";
import { ApproveButton, PageHeader, Panel, Pagination, RejectButton, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { formatMoney, kycSubmissions } from "../data";

const PAGE_SIZE = 10;

function displayCreator(withdrawal: AdminWithdrawal) {
  if (typeof withdrawal.user === "string") return withdrawal.user;
  return (
    withdrawal.user.profile?.displayName ||
    withdrawal.user.profile?.username ||
    withdrawal.user.email ||
    withdrawal.user._id ||
    withdrawal.user.id ||
    "Creator"
  );
}

function displayMethod(withdrawal: AdminWithdrawal) {
  return withdrawal.stripeTransferId ? "Stripe Transfer" : "Stripe Connect";
}

function displayStatus(status: AdminWithdrawal["status"]) {
  if (status === "pending") return "Pending";
  if (status === "approved") return "Approved";
  if (status === "processing") return "Processing";
  if (status === "completed") return "Completed";
  if (status === "rejected") return "Rejected";
  if (status === "failed") return "Failed";
  return status;
}

type ReviewAction = "approve" | "reject" | "retry" | "complete";

function displayReviewAction(action?: ReviewAction) {
  if (action === "approve") return "Approve";
  if (action === "reject") return "Reject";
  if (action === "retry") return "Retry";
  if (action === "complete") return "Complete";
  return "Review";
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

export function Withdrawals({ accessToken }: { accessToken: string }) {
  const [pendingPage, setPendingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyStatus, setHistoryStatus] = useState<WithdrawalStatus>("all");
  const [reviewState, setReviewState] = useState<{
    withdrawal: AdminWithdrawal;
    action: ReviewAction;
    note: string;
    stripeTransferId: string;
  } | null>(null);
  const pendingParams = useMemo(
    () => ({ status: "pending" as WithdrawalStatus, page: pendingPage, limit: PAGE_SIZE }),
    [pendingPage],
  );
  const historyParams = useMemo(
    () => ({ status: historyStatus, page: historyPage, limit: PAGE_SIZE }),
    [historyPage, historyStatus],
  );
  const pendingQuery = useAdminWithdrawalsQuery(accessToken, pendingParams);
  const historyQuery = useAdminWithdrawalsQuery(accessToken, historyParams);
  const approveMutation = useApproveAdminWithdrawalMutation(accessToken);
  const rejectMutation = useRejectAdminWithdrawalMutation(accessToken);
  const retryMutation = useRetryAdminWithdrawalMutation(accessToken);
  const completeMutation = useCompleteAdminWithdrawalMutation(accessToken);
  const isReviewing =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    retryMutation.isPending ||
    completeMutation.isPending;

  const approveWithdrawal = (withdrawal: AdminWithdrawal) => {
    setReviewState({ withdrawal, action: "approve", note: withdrawal.adminNotes || "", stripeTransferId: "" });
  };

  const rejectWithdrawal = (withdrawal: AdminWithdrawal) => {
    setReviewState({ withdrawal, action: "reject", note: withdrawal.adminNotes || "", stripeTransferId: "" });
  };

  const retryWithdrawal = (withdrawal: AdminWithdrawal) => {
    setReviewState({ withdrawal, action: "retry", note: withdrawal.adminNotes || "", stripeTransferId: "" });
  };

  const completeWithdrawal = (withdrawal: AdminWithdrawal) => {
    setReviewState({
      withdrawal,
      action: "complete",
      note: withdrawal.adminNotes || "",
      stripeTransferId: withdrawal.stripeTransferId || "",
    });
  };

  const submitReview = () => {
    if (!reviewState || isReviewing) return;

    if (reviewState.action === "reject" && !reviewState.note.trim()) {
      toast.error("Reject reason is required.");
      return;
    }

    const note = reviewState.note.trim() || undefined;
    const mutation = (() => {
      if (reviewState.action === "approve") {
        return approveMutation.mutateAsync({
          requestId: reviewState.withdrawal.id,
          adminNotes: note,
        });
      }
      if (reviewState.action === "retry") {
        return retryMutation.mutateAsync({
          requestId: reviewState.withdrawal.id,
          adminNotes: note,
        });
      }
      if (reviewState.action === "complete") {
        return completeMutation.mutateAsync({
          requestId: reviewState.withdrawal.id,
          stripeTransferId: reviewState.stripeTransferId.trim() || undefined,
          adminNotes: note,
        });
      }
      return rejectMutation.mutateAsync({
        requestId: reviewState.withdrawal.id,
        reason: reviewState.note.trim(),
      });
    })();

    mutation
      .then(() => {
        const successMessage =
          reviewState.action === "approve"
            ? "Withdrawal approved and transfer started."
            : reviewState.action === "retry"
              ? "Withdrawal retry completed."
              : reviewState.action === "complete"
                ? "Withdrawal marked completed."
                : "Withdrawal rejected and balance refunded.";
        toast.success(successMessage);
        setReviewState(null);
      })
      .catch((error) =>
        toast.error(
          handleApiError(
            error,
            `Failed to ${reviewState.action} withdrawal.`,
          ),
        ),
      );
  };

  return (
    <div>
      <PageHeader title="Withdrawal Management" subtitle="Process payouts and verify creator identities" />
      <Tabs defaultValue="pending">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="pending">
            Pending Requests ({pendingQuery.data?.pagination.total ?? 0})
          </TabsTrigger>
          {/* <TabsTrigger value="kyc">KYC Verification</TabsTrigger> */}
          <TabsTrigger value="history">
            History ({historyQuery.data?.pagination.total ?? 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingQuery.isError && (
            <Panel className="mb-4 border-red-500/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-red-400">
                  {handleApiError(pendingQuery.error, "Pending withdrawal requests could not be loaded.")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-transparent text-white hover:bg-white/5"
                  onClick={() => pendingQuery.refetch()}
                >
                  Retry
                </Button>
              </div>
            </Panel>
          )}
          <WithdrawalTable
            withdrawals={pendingQuery.data?.items ?? []}
            isLoading={pendingQuery.isLoading}
            emptyText="No pending withdrawal requests."
            isReviewing={isReviewing}
            showActions
            onApprove={approveWithdrawal}
            onReject={rejectWithdrawal}
            onRetry={retryWithdrawal}
            onComplete={completeWithdrawal}
          />
          {pendingQuery.data && pendingQuery.data.pagination.totalPages > 1 && (
            <Pagination
              page={pendingQuery.data.pagination.page}
              total={pendingQuery.data.pagination.totalPages}
              onChange={setPendingPage}
            />
          )}
        </TabsContent>

        <TabsContent value="kyc" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {kycSubmissions.map((k) => (
              <div key={k.id} className="rounded-xl bg-[#1A1A1A] border border-white/5 overflow-hidden">
                <div className="aspect-video bg-black/40">
                  <ImageWithFallback src={k.doc} alt="ID document" className="size-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-white">{k.creator}</p>
                  <p className="text-sm text-[#A0A0A0] mb-3">Submitted {k.date}</p>
                  <div className="flex gap-2">
                    <ApproveButton className="flex-1">Approve</ApproveButton>
                    <RejectButton className="flex-1">Reject</RejectButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="flex justify-end mb-3">
            <div className="w-44">
              <Select
                value={historyStatus}
                onValueChange={(value) => {
                  setHistoryStatus(value as WithdrawalStatus);
                  setHistoryPage(1);
                }}
              >
                <SelectTrigger className="bg-[#141414] border-white/10 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {historyQuery.isError && (
            <Panel className="mb-4 border-red-500/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-red-400">
                  {handleApiError(historyQuery.error, "Withdrawal history could not be loaded.")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-transparent text-white hover:bg-white/5"
                  onClick={() => historyQuery.refetch()}
                >
                  Retry
                </Button>
              </div>
            </Panel>
          )}
          <WithdrawalTable
            withdrawals={historyQuery.data?.items ?? []}
            isLoading={historyQuery.isLoading}
            emptyText="No withdrawal history found."
            isReviewing={isReviewing}
            showActions
            onApprove={approveWithdrawal}
            onReject={rejectWithdrawal}
            onRetry={retryWithdrawal}
            onComplete={completeWithdrawal}
          />
          {historyQuery.data && historyQuery.data.pagination.totalPages > 1 && (
            <Pagination
              page={historyQuery.data.pagination.page}
              total={historyQuery.data.pagination.totalPages}
              onChange={setHistoryPage}
            />
          )}
        </TabsContent>
      </Tabs>
      <Dialog open={!!reviewState} onOpenChange={(open) => !open && setReviewState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewState ? `${displayReviewAction(reviewState.action)} Withdrawal` : "Review Withdrawal"}</DialogTitle>
            <DialogDescription>
              {reviewState?.action === "approve"
                ? "Confirm this payout request. Stripe transfer will be started when approved."
                : reviewState?.action === "retry"
                  ? "Retry the failed Stripe payout. The creator balance stays held unless you reject it."
                  : reviewState?.action === "complete"
                    ? "Use this only after you have verified the payout externally."
                    : "Confirm rejection. The creator balance will be refunded after rejection."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-[#A0A0A0]">
              <div className="text-white">{reviewState ? displayCreator(reviewState.withdrawal) : "Creator"}</div>
              <div>{reviewState ? formatMoney(reviewState.withdrawal.amountUsd) : "$0.00"}</div>
              {reviewState?.withdrawal.failureReason && (
                <div className="mt-2 text-red-300">Failure: {reviewState.withdrawal.failureReason}</div>
              )}
            </div>
            {reviewState?.action === "complete" && (
              <input
                value={reviewState.stripeTransferId}
                onChange={(event) =>
                  setReviewState((current) =>
                    current ? { ...current, stripeTransferId: event.target.value } : current,
                  )
                }
                placeholder="Stripe transfer id or external reference"
                className="h-10 w-full rounded-md border border-white/10 bg-[#111] px-3 text-sm text-white outline-none"
              />
            )}
            <Textarea
              value={reviewState?.note ?? ""}
              onChange={(event) => setReviewState((current) => (current ? { ...current, note: event.target.value } : current))}
              placeholder={reviewState?.action === "reject" ? "Reject reason" : "Admin note (optional)"}
              className="min-h-24 bg-[#111] border-white/10"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-white/10 bg-transparent hover:bg-white/5" onClick={() => setReviewState(null)}>
                Cancel
              </Button>
              <Button
                className={
                  reviewState?.action === "reject"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-[#84CC16] text-black hover:bg-[#84CC16]/90"
                }
                disabled={isReviewing}
                onClick={submitReview}
              >
                {isReviewing ? "Working..." : reviewState?.action === "reject" ? "Reject" : reviewState?.action === "retry" ? "Retry" : reviewState?.action === "complete" ? "Complete" : "Approve"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WithdrawalTable({
  withdrawals,
  isLoading,
  emptyText,
  isReviewing,
  showActions,
  onApprove,
  onReject,
  onRetry,
  onComplete,
}: {
  withdrawals: AdminWithdrawal[];
  isLoading: boolean;
  emptyText: string;
  isReviewing: boolean;
  showActions: boolean;
  onApprove: (withdrawal: AdminWithdrawal) => void;
  onReject: (withdrawal: AdminWithdrawal) => void;
  onRetry: (withdrawal: AdminWithdrawal) => void;
  onComplete: (withdrawal: AdminWithdrawal) => void;
}) {
  return (
    <Panel>
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[#A0A0A0]">Creator</TableHead>
            <TableHead className="text-[#A0A0A0]">Amount</TableHead>
            <TableHead className="text-[#A0A0A0]">Coins</TableHead>
            <TableHead className="text-[#A0A0A0]">Requested</TableHead>
            <TableHead className="text-[#A0A0A0]">Method</TableHead>
            <TableHead className="text-[#A0A0A0]">Status</TableHead>
            <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableCell colSpan={7} className="py-8 text-center text-[#A0A0A0]">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin text-[#84CC16]" />
                  Loading withdrawal requests...
                </div>
              </TableCell>
            </TableRow>
          )}
          {!isLoading && withdrawals.length === 0 && (
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableCell colSpan={7} className="py-8 text-center text-[#A0A0A0]">
                {emptyText}
              </TableCell>
            </TableRow>
          )}
          {withdrawals.map((withdrawal, i) => (
            <TableRow key={withdrawal.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
              <TableCell className="text-white">
                <div>
                  <p>{displayCreator(withdrawal)}</p>
                  {typeof withdrawal.user !== "string" && withdrawal.user.email && (
                    <p className="text-xs text-[#A0A0A0]">{withdrawal.user.email}</p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-white">{formatMoney(withdrawal.amountUsd)}</TableCell>
              <TableCell className="text-[#A0A0A0]">Earnings</TableCell>
              <TableCell className="text-[#A0A0A0]">{formatDate(withdrawal.createdAt)}</TableCell>
              <TableCell className="text-[#A0A0A0]">{displayMethod(withdrawal)}</TableCell>
              <TableCell><StatusPill status={displayStatus(withdrawal.status)} /></TableCell>
              <TableCell className="text-right">
                {showActions && withdrawal.status === "pending" ? (
                  <div className="flex justify-end gap-2">
                    <ApproveButton disabled={isReviewing} onClick={() => onApprove(withdrawal)}>
                      Approve
                    </ApproveButton>
                    <RejectButton disabled={isReviewing} onClick={() => onReject(withdrawal)}>
                      Reject
                    </RejectButton>
                  </div>
                ) : showActions && withdrawal.status === "failed" ? (
                  <div className="flex justify-end gap-2">
                    <ApproveButton disabled={isReviewing} onClick={() => onRetry(withdrawal)}>
                      Retry
                    </ApproveButton>
                    <RejectButton disabled={isReviewing} onClick={() => onReject(withdrawal)}>
                      Reject
                    </RejectButton>
                  </div>
                ) : showActions && (withdrawal.status === "approved" || withdrawal.status === "processing") ? (
                  <div className="flex justify-end gap-2">
                    <ApproveButton disabled={isReviewing} onClick={() => onComplete(withdrawal)}>
                      Complete
                    </ApproveButton>
                    <RejectButton disabled={isReviewing} onClick={() => onReject(withdrawal)}>
                      Reject
                    </RejectButton>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 bg-transparent text-[#A0A0A0] hover:bg-white/5"
                    disabled
                  >
                    No action
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  );
}

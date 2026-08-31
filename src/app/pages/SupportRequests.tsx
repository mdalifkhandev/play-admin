import { useMemo, useState } from "react";
import { Loader2, MessageSquareReply } from "lucide-react";
import { toast } from "sonner";
import { handleApiError } from "../api/client";
import {
  useAdminSupportRequestDetailQuery,
  useAdminSupportRequestsQuery,
  useReplyAdminSupportRequestMutation,
  useUpdateAdminSupportRequestMutation,
} from "../api/supportRequests.query";
import type { AdminSupportRequest, SupportPriority, SupportRequestStatus } from "../api/supportRequests";
import { PageHeader, Panel, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";

const PAGE_SIZE = 20;
const STATUSES: SupportRequestStatus[] = ["open", "in_progress", "resolved", "closed"];
const PRIORITIES: SupportPriority[] = ["low", "normal", "high", "urgent"];

export function SupportRequests({ accessToken }: { accessToken: string }) {
  const [status, setStatus] = useState<SupportRequestStatus | "all">("all");
  const [selectedRequest, setSelectedRequest] = useState<AdminSupportRequest | null>(null);
  const [reply, setReply] = useState("");
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  const params = useMemo(
    () => ({ page: 1, limit: PAGE_SIZE, ...(status !== "all" ? { status } : {}) }),
    [status],
  );
  const requestsQuery = useAdminSupportRequestsQuery(accessToken, params);
  const detailQuery = useAdminSupportRequestDetailQuery(accessToken, selectedRequest?.id);
  const replyMutation = useReplyAdminSupportRequestMutation(accessToken);
  const updateMutation = useUpdateAdminSupportRequestMutation(accessToken);

  const requests = requestsQuery.data?.items ?? [];
  const activeRequest = detailQuery.data?.request ?? selectedRequest;
  const messages = detailQuery.data?.messages ?? [];
  const isReplying = replyMutation.isPending;

  const sendReply = async () => {
    if (!selectedRequest || !reply.trim() || isReplying) return;

    try {
      await replyMutation.mutateAsync({ requestId: selectedRequest.id, message: reply.trim() });
      setReply("");
      toast.success("Support reply sent.");
    } catch (error) {
      toast.error(handleApiError(error, "Support reply could not be sent."));
    }
  };

  const updateRequest = async (
    request: AdminSupportRequest,
    field: "status" | "priority",
    value: SupportRequestStatus | SupportPriority,
  ) => {
    setUpdatingField(`${request.id}-${field}`);
    try {
      await updateMutation.mutateAsync({ requestId: request.id, input: { [field]: value } });
      toast.success("Support request updated.");
    } catch (error) {
      toast.error(handleApiError(error, "Support request could not be updated."));
    } finally {
      setUpdatingField(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Support Requests" subtitle="Review user tickets and reply from admin dashboard" />

      <Panel>
        <div className="mb-4 max-w-xs">
          <Select value={status} onValueChange={(value) => setStatus(value as SupportRequestStatus | "all")}>
            <SelectTrigger className="bg-[#141414] border-white/10 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
              <SelectItem value="all">All requests</SelectItem>
              {STATUSES.map((item) => (
                <SelectItem key={item} value={item}>{formatStatus(item)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[#A0A0A0]">Ticket</TableHead>
              <TableHead className="text-[#A0A0A0]">Category</TableHead>
              <TableHead className="text-[#A0A0A0]">Status</TableHead>
              <TableHead className="text-[#A0A0A0]">Priority</TableHead>
              <TableHead className="text-[#A0A0A0]">Last Message</TableHead>
              <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requestsQuery.isLoading && (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={6} className="py-10 text-center text-[#A0A0A0]">
                  <Loader2 className="inline size-4 animate-spin text-[#84CC16]" /> Loading support requests...
                </TableCell>
              </TableRow>
            )}

            {!requestsQuery.isLoading && requests.length === 0 && (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={6} className="py-10 text-center text-[#A0A0A0]">No support requests found.</TableCell>
              </TableRow>
            )}

            {requests.map((request, index) => (
              <TableRow key={request.id} className={`border-white/5 hover:bg-white/5 ${index % 2 ? "bg-white/[0.02]" : ""}`}>
                <TableCell className="text-white">
                  <p className="font-medium">{request.subject}</p>
                  <p className="text-xs text-[#A0A0A0]">{request.ticketNumber}</p>
                </TableCell>
                <TableCell className="text-[#A0A0A0] capitalize">{request.category}</TableCell>
                <TableCell><StatusPill status={formatStatus(request.status)} /></TableCell>
                <TableCell className="text-[#A0A0A0] capitalize">{request.priority}</TableCell>
                <TableCell className="text-[#A0A0A0]">{new Date(request.lastMessageAt).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90" onClick={() => setSelectedRequest(request)}>
                    <MessageSquareReply className="mr-1 size-4" /> Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Dialog open={Boolean(selectedRequest)} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto bg-[#1A1A1A] border-white/10 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{activeRequest?.subject ?? "Support request"}</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              {activeRequest?.ticketNumber} · User {activeRequest?.requesterUserId}
            </DialogDescription>
          </DialogHeader>

          {detailQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-[#A0A0A0]">
              <Loader2 className="size-4 animate-spin text-[#84CC16]" /> Loading ticket...
            </div>
          ) : activeRequest ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  value={activeRequest.status}
                  onValueChange={(value) => updateRequest(activeRequest, "status", value as SupportRequestStatus)}
                  disabled={Boolean(updatingField)}
                >
                  <SelectTrigger className="bg-[#141414] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                    {STATUSES.map((item) => <SelectItem key={item} value={item}>{formatStatus(item)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select
                  value={activeRequest.priority}
                  onValueChange={(value) => updateRequest(activeRequest, "priority", value as SupportPriority)}
                  disabled={Boolean(updatingField)}
                >
                  <SelectTrigger className="bg-[#141414] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                    {PRIORITIES.map((item) => <SelectItem key={item} value={item}>{formatStatus(item)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-[#101010] p-4">
                {messages.map((message) => {
                  const isStaff = message.senderType === "staff";
                  return (
                    <div key={message.id} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[82%] rounded-xl px-4 py-3 ${isStaff ? "bg-[#84CC16] text-black" : "bg-white/10 text-white"}`}>
                        <p className="text-xs font-semibold opacity-70">{isStaff ? "Staff" : "User"}</p>
                        <p className="mt-1 text-sm">{message.message}</p>
                        <p className="mt-2 text-[10px] opacity-60">{new Date(message.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeRequest.status !== "closed" ? (
                <div className="space-y-3">
                  <Textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    rows={4}
                    className="bg-[#141414] border-white/10 text-white"
                    placeholder="Write admin reply..."
                  />
                  <div className="flex justify-end">
                    <Button className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90" disabled={!reply.trim() || isReplying} onClick={sendReply}>
                      {isReplying && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Send Reply
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-[#A0A0A0]">This support request is closed.</p>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatStatus(status: string) {
  if (status === "in_progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

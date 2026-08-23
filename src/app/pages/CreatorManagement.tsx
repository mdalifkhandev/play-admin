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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { creatorEarningsGraph, formatMoney, formatNumber } from "../data";

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
  if (status === "held") return "Pending";
  return "Pending";
}

function Performance({ creator, onBack }: { creator: CreatorApplication; onBack: () => void }) {
  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="text-[#A0A0A0] hover:text-white mb-4 -ml-2">
        <ArrowLeft className="size-4" /> Back to creators
      </Button>
      <PageHeader title={`${displayName(creator)} — Performance`} subtitle="Individual creator analytics" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Earnings" value={formatMoney(0)} change="0%" positive />
        <StatCard label="Followers" value={formatNumber(0)} change="0%" positive />
        <StatCard label="Engagement Rate" value="0%" change="0%" positive />
      </div>
      <Panel title="Earnings Over Time">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={creatorEarningsGraph}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <YAxis stroke="#A0A0A0" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(132,204,22,0.08)" }} />
            <Bar dataKey="earnings" fill="#84CC16" radius={[6, 6, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

export function CreatorManagement({ accessToken }: { accessToken: string }) {
  const [perf, setPerf] = useState<CreatorApplication | null>(null);
  const [selected, setSelected] = useState<CreatorApplication | null>(null);
  const pendingQuery = useCreatorApplicationsQuery(accessToken, "pending");
  const activeQuery = useCreatorApplicationsQuery(accessToken, "approved");
  const approveMutation = useApproveCreatorApplicationMutation(accessToken);
  const rejectMutation = useRejectCreatorApplicationMutation(accessToken);
  const holdMutation = useHoldCreatorApplicationMutation(accessToken);
  const isReviewing = approveMutation.isPending || rejectMutation.isPending || holdMutation.isPending;
  const pendingCreators = pendingQuery.data?.items ?? [];
  const activeCreators = activeQuery.data?.items ?? [];

  const reviewApplication = (
    action: "approve" | "reject" | "hold",
    application: CreatorApplication,
  ) => {
    const mutation =
      action === "approve" ? approveMutation : action === "reject" ? rejectMutation : holdMutation;
    const successMessage =
      action === "approve"
        ? "Creator application approved."
        : action === "reject"
          ? "Creator application rejected."
          : "Creator application held.";

    const payload = action === "approve" ? application.id : { id: application.id };

    mutation
      .mutateAsync(payload as never)
      .then(() => {
        setSelected(null);
        toast.success(successMessage);
      })
      .catch((error) => {
        toast.error(handleApiError(error, "Creator review failed."));
      });
  };

  if (perf) return <Performance creator={perf} onBack={() => setPerf(null)} />;

  return (
    <div>
      <PageHeader title="Creator Management" subtitle="Review applications and manage active creators" />
      <Tabs defaultValue="pending">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="pending">Pending Applications</TabsTrigger>
          <TabsTrigger value="active">Active Creators</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Creator</TableHead>
                  <TableHead className="text-[#A0A0A0]">Category</TableHead>
                  <TableHead className="text-[#A0A0A0]">Country</TableHead>
                  <TableHead className="text-[#A0A0A0]">Applied</TableHead>
                  <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingQuery.isLoading && (
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableCell colSpan={5} className="py-8 text-center text-[#A0A0A0]">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin text-[#84CC16]" />
                        Loading applications...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!pendingQuery.isLoading && pendingCreators.length === 0 && (
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableCell colSpan={5} className="py-8 text-center text-[#A0A0A0]">
                      No pending applications.
                    </TableCell>
                  </TableRow>
                )}
                {pendingCreators.map((c, i) => (
                  <TableRow
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={`border-white/5 cursor-pointer hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8"><AvatarImage src={c.user.profile?.photoUrl} /><AvatarFallback>{avatarFallback(c)}</AvatarFallback></Avatar>
                        <span className="text-white">{displayName(c)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#A0A0A0]">{c.contentCategory}</TableCell>
                    <TableCell className="text-white">{c.country}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                        <ApproveButton disabled={isReviewing} onClick={() => reviewApplication("approve", c)}>Approve</ApproveButton>
                        <RejectButton disabled={isReviewing} onClick={() => reviewApplication("reject", c)}>Reject</RejectButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Creator</TableHead>
                  <TableHead className="text-[#A0A0A0]">Category</TableHead>
                  <TableHead className="text-[#A0A0A0]">Country</TableHead>
                  <TableHead className="text-[#A0A0A0]">Status</TableHead>
                  <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeQuery.isLoading && (
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableCell colSpan={5} className="py-8 text-center text-[#A0A0A0]">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin text-[#84CC16]" />
                        Loading creators...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!activeQuery.isLoading && activeCreators.length === 0 && (
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableCell colSpan={5} className="py-8 text-center text-[#A0A0A0]">
                      No active creators.
                    </TableCell>
                  </TableRow>
                )}
                {activeCreators.map((c, i) => (
                  <TableRow key={c.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8"><AvatarImage src={c.user.profile?.photoUrl} /><AvatarFallback>{avatarFallback(c)}</AvatarFallback></Avatar>
                        <span className="text-white">{displayName(c)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{c.contentCategory}</TableCell>
                    <TableCell className="text-white">{c.country}</TableCell>
                    <TableCell><StatusPill status={adminStatus(c.status)} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="border-white/15 text-white hover:bg-white/5 bg-transparent" onClick={() => setPerf(c)}>
                          View Performance
                        </Button>
                        <RejectButton disabled={isReviewing} onClick={() => reviewApplication("hold", c)}>Hold</RejectButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
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
                  <DocumentButton label="ID Front" url={selected.idFrontUrl} />
                  <DocumentButton label="ID Back" url={selected.idBackUrl} />
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
    </div>
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

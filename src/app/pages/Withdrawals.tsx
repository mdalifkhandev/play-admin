import { ApproveButton, PageHeader, Panel, RejectButton, StatusPill } from "../components/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { formatMoney, kycSubmissions, withdrawalHistory, withdrawalRequests } from "../data";

export function Withdrawals() {
  return (
    <div>
      <PageHeader title="Withdrawal Management" subtitle="Process payouts and verify creator identities" />
      <Tabs defaultValue="pending">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Creator</TableHead>
                  <TableHead className="text-[#A0A0A0]">Amount</TableHead>
                  <TableHead className="text-[#A0A0A0]">Requested</TableHead>
                  <TableHead className="text-[#A0A0A0]">Method</TableHead>
                  <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalRequests.map((w, i) => (
                  <TableRow key={w.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell className="text-white">{w.creator}</TableCell>
                    <TableCell className="text-white">{formatMoney(w.amount)}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{w.date}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{w.method}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ApproveButton>Approve</ApproveButton>
                        <RejectButton>Reject</RejectButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
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
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Date</TableHead>
                  <TableHead className="text-[#A0A0A0]">Creator</TableHead>
                  <TableHead className="text-[#A0A0A0]">Amount</TableHead>
                  <TableHead className="text-[#A0A0A0]">Status</TableHead>
                  <TableHead className="text-[#A0A0A0]">Reference ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalHistory.map((h, i) => (
                  <TableRow key={h.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell className="text-[#A0A0A0]">{h.date}</TableCell>
                    <TableCell className="text-white">{h.creator}</TableCell>
                    <TableCell className="text-white">{formatMoney(h.amount)}</TableCell>
                    <TableCell><StatusPill status={h.status} /></TableCell>
                    <TableCell className="text-[#A0A0A0]">{h.ref}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

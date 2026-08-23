import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageHeader, Panel, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { coinPackages, coinTransactions, giftCatalog } from "../data";

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button size="sm" className="bg-[#84CC16] text-black font-bold hover:bg-[#84CC16]/90" onClick={onClick}>
      <Plus className="size-4" /> {label}
    </Button>
  );
}

export function CoinGift() {
  const [packages, setPackages] = useState(coinPackages);
  const [gifts, setGifts] = useState(giftCatalog);
  const [creatorShare, setCreatorShare] = useState("70");
  const [conversion, setConversion] = useState("100");

  const platformShare = Math.max(0, 100 - (parseInt(creatorShare) || 0));

  return (
    <div>
      <PageHeader title="Coin & Gift Management" subtitle="Configure virtual currency, gifts and revenue rules" />
      <Tabs defaultValue="packages">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="packages">Coin Packages</TabsTrigger>
          <TabsTrigger value="gifts">Gift Catalog</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Settings</TabsTrigger>
          <TabsTrigger value="logs">Transaction Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="mt-4">
          <Panel action={<AddButton label="Add New Package" onClick={() => toast.success("New coin package added")} />}>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Coin Amount</TableHead>
                  <TableHead className="text-[#A0A0A0]">Price</TableHead>
                  <TableHead className="text-[#A0A0A0]">Status</TableHead>
                  <TableHead className="text-[#A0A0A0]">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((p, i) => (
                  <TableRow key={p.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell className="text-white">{p.coins.toLocaleString()} Coins</TableCell>
                    <TableCell>
                      <div className="flex items-center bg-[#141414] border border-white/10 rounded-md h-9 px-3 w-32">
                        <span className="text-[#A0A0A0] mr-1">$</span>
                        <input
                          value={p.price}
                          onChange={(e) =>
                            setPackages((ps) => ps.map((x) => (x.id === p.id ? { ...x, price: e.target.value } : x)))
                          }
                          inputMode="decimal"
                          className="bg-transparent outline-none text-white w-full"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusPill status={p.active ? "Active" : "Cancelled"} />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={p.active}
                        onCheckedChange={(v) => setPackages((ps) => ps.map((x) => (x.id === p.id ? { ...x, active: v } : x)))}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="gifts" className="mt-4">
          <Panel action={<AddButton label="Add New Gift" onClick={() => toast.success("New gift added")} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {gifts.map((g) => (
                <div key={g.id} className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl leading-none">{g.icon}</span>
                    <Switch
                      checked={g.active}
                      onCheckedChange={(v) => setGifts((gs) => gs.map((x) => (x.id === g.id ? { ...x, active: v } : x)))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#A0A0A0] text-xs">Gift Name</Label>
                    <Input
                      value={g.name}
                      onChange={(e) => setGifts((gs) => gs.map((x) => (x.id === g.id ? { ...x, name: e.target.value } : x)))}
                      className="bg-[#141414] border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#A0A0A0] text-xs">Coin Cost</Label>
                    <div className="flex items-center bg-[#141414] border border-white/10 rounded-md h-9 px-3">
                      <input
                        value={g.cost}
                        onChange={(e) =>
                          setGifts((gs) => gs.map((x) => (x.id === g.id ? { ...x, cost: Number(e.target.value) || 0 } : x)))
                        }
                        inputMode="numeric"
                        className="bg-transparent outline-none text-white w-full"
                      />
                      <span className="text-[#A0A0A0] ml-1 text-sm">coins</span>
                    </div>
                  </div>
                  <StatusPill status={g.active ? "Active" : "Cancelled"} />
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <Panel title="Revenue Settings">
            <div className="max-w-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#A0A0A0]">Creator Share %</Label>
                  <div className="flex items-center bg-[#141414] border border-white/10 rounded-md h-9 px-3">
                    <input
                      value={creatorShare}
                      onChange={(e) => setCreatorShare(e.target.value)}
                      inputMode="numeric"
                      className="bg-transparent outline-none text-white w-full"
                    />
                    <span className="text-[#A0A0A0] ml-1">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#A0A0A0]">Platform Share %</Label>
                  <div className="flex items-center bg-[#141414] border border-white/10 rounded-md h-9 px-3">
                    <input
                      value={platformShare}
                      readOnly
                      className="bg-transparent outline-none text-[#84CC16] w-full"
                    />
                    <span className="text-[#A0A0A0] ml-1">%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#A0A0A0]">Diamond-to-Cash Conversion Rate</Label>
                <div className="flex items-center bg-[#141414] border border-white/10 rounded-md h-9 px-3">
                  <input
                    value={conversion}
                    onChange={(e) => setConversion(e.target.value)}
                    inputMode="numeric"
                    className="bg-transparent outline-none text-white w-full"
                  />
                  <span className="text-[#A0A0A0] ml-2 whitespace-nowrap text-sm">Diamonds = $1.00</span>
                </div>
              </div>
              <Button
                className="bg-[#84CC16] text-black font-bold hover:bg-[#84CC16]/90"
                onClick={() => toast.success("Revenue settings saved")}
              >
                Save Settings
              </Button>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Panel>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Username</TableHead>
                  <TableHead className="text-[#A0A0A0]">Transaction Type</TableHead>
                  <TableHead className="text-[#A0A0A0]">Amount</TableHead>
                  <TableHead className="text-[#A0A0A0]">Date</TableHead>
                  <TableHead className="text-[#A0A0A0]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coinTransactions.map((t, i) => (
                  <TableRow key={t.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell className="text-white">{t.user}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{t.type}</TableCell>
                    <TableCell className="text-white">{t.amount}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{t.date}</TableCell>
                    <TableCell><StatusPill status={t.status} /></TableCell>
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

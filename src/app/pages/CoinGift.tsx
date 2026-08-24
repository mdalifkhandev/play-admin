import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit3, Loader2, Plus, Trash2 } from "lucide-react";
import { PageHeader, Panel, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import {
  useAdminCoinPackagesQuery,
  useAdminCoinSettingsQuery,
  useAdminCoinTransactionsQuery,
  useAdminGiftsQuery,
  useCreateAdminCoinPackageMutation,
  useCreateAdminGiftMutation,
  useDeleteAdminCoinPackageMutation,
  useDeleteAdminGiftMutation,
  useUpdateAdminCoinPackageMutation,
  useUpdateAdminCoinSettingsMutation,
  useUpdateAdminGiftMutation,
} from "../api/coinGift.query";
import { handleApiError } from "../api/client";
import type { AdminCoinPackage, AdminGift } from "../api/coinGift";

function AddButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <Button size="sm" className="bg-[#84CC16] text-black font-bold hover:bg-[#84CC16]/90" onClick={onClick} disabled={disabled}>
      <Plus className="size-4" /> {label}
    </Button>
  );
}

export function CoinGift({ accessToken }: { accessToken: string }) {
  const packagesQuery = useAdminCoinPackagesQuery(accessToken);
  const giftsQuery = useAdminGiftsQuery(accessToken);
  const settingsQuery = useAdminCoinSettingsQuery(accessToken);
  const transactionsQuery = useAdminCoinTransactionsQuery(accessToken, { page: 1, limit: 50 });

  const createPackageMutation = useCreateAdminCoinPackageMutation(accessToken);
  const updatePackageMutation = useUpdateAdminCoinPackageMutation(accessToken);
  const deletePackageMutation = useDeleteAdminCoinPackageMutation(accessToken);
  const createGiftMutation = useCreateAdminGiftMutation(accessToken);
  const updateGiftMutation = useUpdateAdminGiftMutation(accessToken);
  const deleteGiftMutation = useDeleteAdminGiftMutation(accessToken);
  const updateSettingsMutation = useUpdateAdminCoinSettingsMutation(accessToken);

  const [packageDrafts, setPackageDrafts] = useState<Record<string, AdminCoinPackage>>({});
  const [giftDrafts, setGiftDrafts] = useState<Record<string, AdminGift>>({});
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<AdminCoinPackage | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<AdminCoinPackage | null>(null);
  const [giftToDelete, setGiftToDelete] = useState<AdminGift | null>(null);
  const [packageActionId, setPackageActionId] = useState<string | null>(null);
  const [packageActionType, setPackageActionType] = useState<'save' | 'popular' | 'delete' | null>(null);
  const [giftActionId, setGiftActionId] = useState<string | null>(null);
  const [packageForm, setPackageForm] = useState({
    coins: "100",
    price: "0.99",
  });
  const [creatorShare, setCreatorShare] = useState("70");
  const [conversion, setConversion] = useState("100");

  const packages = packagesQuery.data ?? [];
  const gifts = giftsQuery.data ?? [];
  const transactions = transactionsQuery.data?.items ?? [];
  const platformShare = Math.max(0, 100 - (parseInt(creatorShare) || 0));

  useEffect(() => {
    setPackageDrafts(Object.fromEntries(packages.map((p) => [p.id, p])));
  }, [packages]);

  useEffect(() => {
    setGiftDrafts(Object.fromEntries(gifts.map((g) => [g.id, g])));
  }, [gifts]);

  useEffect(() => {
    if (settingsQuery.data) {
      setConversion(String(settingsQuery.data.coinsPerDollar));
    }
  }, [settingsQuery.data]);

  const savePackage = (id: string, input?: Partial<AdminCoinPackage>) => {
    const draft = packageDrafts[id];
    if (!draft && !input) return;
    setPackageActionId(id);
    setPackageActionType('save');
    updatePackageMutation.mutate(
      { packageId: id, input: input ?? draft },
      {
        onSuccess: () => toast.success("Coin package saved"),
        onError: () => toast.error("Coin package could not be saved"),
        onSettled: () => {
          setPackageActionId(null);
          setPackageActionType(null);
        },
      },
    );
  };

  const openAddPackageModal = () => {
    setEditingPackage(null);
    setPackageForm({
      coins: "100",
      price: "0.99",
    });
    setPackageModalOpen(true);
  };

  const openEditPackageModal = (pkg: AdminCoinPackage) => {
    setEditingPackage(pkg);
    setPackageForm({
      coins: String(pkg.coins),
      price: String(pkg.price),
    });
    setPackageModalOpen(true);
  };

  const updateGiftDraft = (id: string, input: Partial<AdminGift>) => {
    setGiftDrafts((current) => ({
      ...current,
      [id]: { ...current[id], ...input },
    }));
  };

  const saveGift = (id: string, input?: Partial<AdminGift>) => {
    const draft = giftDrafts[id];
    if (!draft && !input) return;
    setGiftActionId(id);
    updateGiftMutation.mutate(
      { giftId: id, input: input ?? draft },
      {
        onSuccess: () => toast.success("Gift saved"),
        onError: () => toast.error("Gift could not be saved"),
        onSettled: () => setGiftActionId(null),
      },
    );
  };

  const saveSettings = () => {
    updateSettingsMutation.mutate(
      {
        coinsPerDollar: Number(conversion) || 100,
        minWithdrawalCoins: settingsQuery.data?.minWithdrawalCoins ?? 1000,
        maxWithdrawalCoins: settingsQuery.data?.maxWithdrawalCoins ?? 500000,
      },
      {
        onSuccess: () => toast.success("Revenue settings saved"),
        onError: () => toast.error("Revenue settings could not be saved"),
      },
    );
  };

  const savePackageModal = () => {
    const coins = Number(packageForm.coins);
    const price = Number(packageForm.price);

    if (!Number.isFinite(coins) || coins <= 0) {
      toast.error("Coin amount must be greater than 0");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Dollar amount is invalid");
      return;
    }

    if (editingPackage) {
      setPackageActionId(editingPackage.id);
      setPackageActionType('save');
      updatePackageMutation.mutate(
        {
          packageId: editingPackage.id,
          input: {
            coins,
            price,
          },
        },
        {
          onSuccess: async () => {
            toast.success("Coin package saved");
            setPackageModalOpen(false);
            setEditingPackage(null);
            await packagesQuery.refetch();
          },
          onError: (error) => {
            toast.error(handleApiError(error, "Coin package could not be saved"));
          },
          onSettled: () => {
            setPackageActionId(null);
            setPackageActionType(null);
          },
        },
      );
      return;
    }

    setPackageActionId("new");
    setPackageActionType('save');
    createPackageMutation.mutate(
      {
        name: `Coin Package ${packages.length + 1}`,
        coins,
        price,
        currency: "usd",
        isActive: true,
        isPopular: false,
        sortOrder: packages.length + 1,
      },
      {
        onSuccess: async () => {
          toast.success("New coin package added");
          setPackageModalOpen(false);
          await packagesQuery.refetch();
        },
        onError: (error) => {
          toast.error(handleApiError(error, "Coin package could not be added"));
        },
        onSettled: () => {
          setPackageActionId(null);
          setPackageActionType(null);
        },
      },
    );
  };

  const addGift = () => {
    setGiftActionId("new");
    createGiftMutation.mutate(
      {
        name: `Gift ${gifts.length + 1}`,
        code: `gift-${Date.now()}`,
        icon: "gift",
        coinPrice: 10,
        isActive: true,
        sortOrder: gifts.length + 1,
      },
      {
        onSuccess: async () => {
          toast.success("New gift added");
          await giftsQuery.refetch();
        },
        onError: (error) => {
          toast.error(handleApiError(error, "Gift could not be added"));
        },
        onSettled: () => setGiftActionId(null),
      },
    );
  };

  const deletePackage = () => {
    if (!packageToDelete) return;
    setPackageActionId(packageToDelete.id);
    setPackageActionType('delete');
    deletePackageMutation.mutate(packageToDelete.id, {
      onSuccess: async () => {
        toast.success("Coin package deleted");
        setPackageToDelete(null);
        await packagesQuery.refetch();
      },
      onError: (error) => {
        toast.error(handleApiError(error, "Coin package could not be deleted"));
      },
      onSettled: () => {
        setPackageActionId(null);
        setPackageActionType(null);
      },
    });
  };

  const deleteGift = () => {
    if (!giftToDelete) return;
    setGiftActionId(giftToDelete.id);
    deleteGiftMutation.mutate(giftToDelete.id, {
      onSuccess: async () => {
        toast.success("Gift deleted");
        setGiftToDelete(null);
        await giftsQuery.refetch();
      },
      onError: (error) => {
        toast.error(handleApiError(error, "Gift could not be deleted"));
      },
      onSettled: () => setGiftActionId(null),
    });
  };

  const makePackagePopular = async (pkg: AdminCoinPackage) => {
    setPackageActionId(pkg.id);
    setPackageActionType('popular');
    try {
      await updatePackageMutation.mutateAsync({
        packageId: pkg.id,
        input: { isPopular: true },
      });

      const otherPopularPackages = packages.filter((item) => item.id !== pkg.id && item.isPopular);
      await Promise.all(
        otherPopularPackages.map((item) =>
          updatePackageMutation.mutateAsync({
            packageId: item.id,
            input: { isPopular: false },
          }),
        ),
      );

      toast.success("Popular package updated");
      await packagesQuery.refetch();
    } catch (error) {
      toast.error(handleApiError(error, "Popular package could not be updated"));
    } finally {
      setPackageActionId(null);
      setPackageActionType(null);
    }
  };

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
          <Panel
            action={
              <AddButton
                label={createPackageMutation.isPending ? "Adding..." : "Add New Package"}
                disabled={packageActionId === "new"}
                onClick={openAddPackageModal}
              />
            }
          >
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Coin Amount</TableHead>
                  <TableHead className="text-[#A0A0A0]">Price</TableHead>
                  <TableHead className="text-[#A0A0A0]">Popular</TableHead>
                  <TableHead className="text-[#A0A0A0]">Status</TableHead>
                  <TableHead className="text-[#A0A0A0]">Active</TableHead>
                  <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packagesQuery.isLoading ? (
                  <LoadingRow colSpan={6} label="Loading coin packages..." />
                ) : packages.length === 0 ? (
                  <EmptyRow colSpan={6} label="No coin packages found." />
                ) : packages.map((p, i) => {
                  const isPackageActionLoading = packageActionId === p.id;
                  const isPopularLoading = isPackageActionLoading && packageActionType === 'popular';
                  const isPackageSaving = isPackageActionLoading && packageActionType === 'save';
                  const isPackageDeleting = isPackageActionLoading && packageActionType === 'delete';
                  return (
                    <TableRow key={p.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                      <TableCell className="text-white">{p.coins.toLocaleString()} Coins</TableCell>
                      <TableCell className="text-white">${p.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className={
                            p.isPopular
                              ? "border-[#84CC16]/40 bg-[#84CC16]/10 text-[#84CC16] hover:bg-[#84CC16]/15"
                              : "border-white/10 bg-transparent hover:bg-white/5"
                          }
                          disabled={isPopularLoading || p.isPopular}
                          onClick={() => makePackagePopular(p)}
                        >
                          {isPopularLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                          {isPopularLoading ? "Updating..." : p.isPopular ? "Popular" : "Make Popular"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <StatusPill status={p.isActive ? "Active" : "Cancelled"} />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={p.isActive}
                          disabled={isPackageSaving}
                          onCheckedChange={(v) => savePackage(p.id, { isActive: v })}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/10 bg-transparent hover:bg-white/5"
                          disabled={isPackageSaving || isPackageDeleting}
                          onClick={() => openEditPackageModal(p)}
                        >
                          {isPackageSaving ? <Loader2 className="size-4 animate-spin" /> : <Edit3 className="size-4" />}
                          {isPackageSaving ? "Saving..." : "Edit"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/40 text-red-400 hover:bg-red-500/10 bg-transparent"
                          disabled={isPackageDeleting}
                          onClick={() => setPackageToDelete(p)}
                        >
                          {isPackageDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                          {isPackageDeleting ? "Deleting..." : "Delete"}
                        </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="gifts" className="mt-4">
          <Panel
            action={
              <AddButton
                label={createGiftMutation.isPending ? "Adding..." : "Add New Gift"}
                disabled={giftActionId === "new"}
                onClick={addGift}
              />
            }
          >
            {giftsQuery.isLoading ? (
              <div className="py-10 text-center text-[#A0A0A0]">
                <Loader2 className="mx-auto mb-2 size-5 animate-spin text-[#84CC16]" />
                Loading gifts...
              </div>
            ) : gifts.length === 0 ? (
              <div className="py-10 text-center text-[#A0A0A0]">No gifts found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {gifts.map((g) => {
                  const draft = giftDrafts[g.id] ?? g;
                  const isGiftActionLoading = giftActionId === g.id;
                  return (
                    <div key={g.id} className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-4xl leading-none">{g.icon}</span>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={g.isActive}
                            disabled={isGiftActionLoading}
                            onCheckedChange={(v) => saveGift(g.id, { isActive: v })}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8 border-red-500/40 text-red-400 hover:bg-red-500/10 bg-transparent"
                            disabled={isGiftActionLoading}
                            onClick={() => setGiftToDelete(g)}
                          >
                            {isGiftActionLoading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#A0A0A0] text-xs">Gift Name</Label>
                        <Input
                          value={draft.name}
                          onChange={(e) => updateGiftDraft(g.id, { name: e.target.value })}
                          onBlur={() => saveGift(g.id)}
                          className="bg-[#141414] border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#A0A0A0] text-xs">Coin Cost</Label>
                        <div className="flex items-center bg-[#141414] border border-white/10 rounded-md h-9 px-3">
                          <input
                            value={draft.coinPrice}
                            onChange={(e) => updateGiftDraft(g.id, { coinPrice: Number(e.target.value) || 0 })}
                            onBlur={() => saveGift(g.id)}
                            inputMode="numeric"
                            className="bg-transparent outline-none text-white w-full"
                          />
                          <span className="text-[#A0A0A0] ml-1 text-sm">coins</span>
                        </div>
                      </div>
                      <StatusPill status={g.isActive ? "Active" : "Cancelled"} />
                    </div>
                  );
                })}
              </div>
            )}
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
                disabled={updateSettingsMutation.isPending || settingsQuery.isLoading}
                onClick={saveSettings}
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
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
                {transactionsQuery.isLoading ? (
                  <LoadingRow colSpan={5} label="Loading transactions..." />
                ) : transactions.length === 0 ? (
                  <EmptyRow colSpan={5} label="No transactions found." />
                ) : transactions.map((t, i) => (
                  <TableRow key={t.id} className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell className="text-white">{t.user}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{t.type}</TableCell>
                    <TableCell className="text-white">{t.coins.toLocaleString()} coins</TableCell>
                    <TableCell className="text-[#A0A0A0]">{formatDate(t.createdAt)}</TableCell>
                    <TableCell><StatusPill status={formatStatus(t.status)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>
      </Tabs>

      <Dialog open={packageModalOpen} onOpenChange={setPackageModalOpen}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{editingPackage ? "Edit Coin Package" : "Add Coin Package"}</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Set how many coins the user gets and how much they pay.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Coin Amount</Label>
              <div className="flex items-center bg-[#141414] border border-white/10 rounded-md h-10 px-3">
                <Input
                  value={packageForm.coins}
                  onChange={(event) => setPackageForm((current) => ({ ...current, coins: event.target.value }))}
                  inputMode="numeric"
                  className="bg-transparent border-0 p-0 text-white focus-visible:ring-0"
                />
                <span className="text-[#A0A0A0] ml-2 whitespace-nowrap text-sm">Coins</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Dollar Amount</Label>
              <div className="flex items-center bg-[#141414] border border-white/10 rounded-md h-10 px-3">
                <span className="text-[#A0A0A0] mr-2">$</span>
                <Input
                  value={packageForm.price}
                  onChange={(event) => setPackageForm((current) => ({ ...current, price: event.target.value }))}
                  inputMode="decimal"
                  className="bg-transparent border-0 p-0 text-white focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10 bg-transparent hover:bg-white/5"
              onClick={() => setPackageModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#84CC16] text-black font-bold hover:bg-[#84CC16]/90"
              disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
              onClick={savePackageModal}
            >
              {packageActionType === 'save' ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!packageToDelete} onOpenChange={(open) => !open && setPackageToDelete(null)}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Coin Package</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              This will permanently delete {packageToDelete?.coins.toLocaleString()} coins for $
              {packageToDelete?.price.toFixed(2)}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10 bg-transparent hover:bg-white/5"
              onClick={() => setPackageToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10 bg-transparent"
              disabled={packageActionId === packageToDelete?.id && packageActionType === 'delete'}
              onClick={deletePackage}
            >
              {packageActionId === packageToDelete?.id && packageActionType === 'delete' ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!giftToDelete} onOpenChange={(open) => !open && setGiftToDelete(null)}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Gift</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              This will permanently delete {giftToDelete?.name}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10 bg-transparent hover:bg-white/5"
              onClick={() => setGiftToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10 bg-transparent"
              disabled={giftActionId === giftToDelete?.id}
              onClick={deleteGift}
            >
              {giftActionId === giftToDelete?.id ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoadingRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow className="border-white/5 hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-10 text-center text-[#A0A0A0]">
        <Loader2 className="mx-auto mb-2 size-5 animate-spin text-[#84CC16]" />
        {label}
      </TableCell>
    </TableRow>
  );
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow className="border-white/5 hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-10 text-center text-[#A0A0A0]">
        {label}
      </TableCell>
    </TableRow>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatStatus(status: string) {
  if (status === "completed") return "Active";
  if (status === "pending") return "Pending";
  if (status === "failed") return "Suspended";
  return status;
}

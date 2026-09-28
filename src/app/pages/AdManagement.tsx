import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Clock,
  Edit3,
  ExternalLink,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAdminAdPackagesQuery,
  useAdminAdCategoriesQuery,
  useAdminAdsQuery,
  useCreateAdminAdPackageMutation,
  useCreateAdminAdCategoryMutation,
  useDeleteAdminAdPackageMutation,
  useDeleteAdminAdCategoryMutation,
  useReviewAdminAdMutation,
  useUpdateAdminAdPackageMutation,
  useUpdateAdminAdCategoryMutation,
} from "../api/ads.query";
import { useAdminPlatformSettingsQuery, useUpdateAdminPlatformSettingsMutation } from "../api/settings.query";
import type { AdCampaign, AdPackage, AdCategory } from "../api/ads";
import { handleApiError } from "../api/client";
import { ApproveButton, PageHeader, Panel, RejectButton, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { ConfirmModal } from "../components/ui/confirm-modal";
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
import { Textarea } from "../components/ui/textarea";
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

  const packagesQuery = useAdminAdPackagesQuery(accessToken);
  const createPackageMutation = useCreateAdminAdPackageMutation(accessToken);
  const updatePackageMutation = useUpdateAdminAdPackageMutation(accessToken);
  const deletePackageMutation = useDeleteAdminAdPackageMutation(accessToken);

  const categoriesQuery = useAdminAdCategoriesQuery(accessToken);
  const createCategoryMutation = useCreateAdminAdCategoryMutation(accessToken);
  const updateCategoryMutation = useUpdateAdminAdCategoryMutation(accessToken);
  const deleteCategoryMutation = useDeleteAdminAdCategoryMutation(accessToken);

  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<AdPackage | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<AdPackage | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<AdCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon: "",
    description: "",
    isActive: true,
    sortOrder: "1",
  });
  const [packageForm, setPackageForm] = useState({
    name: "",
    days: "7",
    priceUsd: "10",
    targetUsers: "500",
    description: "",
    isPopular: false,
    isActive: true,
    sortOrder: "1",
  });

  const settingsQuery = useAdminPlatformSettingsQuery(accessToken);
  const updateSettingsMutation = useUpdateAdminPlatformSettingsMutation(accessToken);

  const [adMobForm, setAdMobForm] = useState({
    androidAppId: "",
    iosAppId: "",
    androidNativeAdId: "",
    iosNativeAdId: "",
  });

  const onAdMobTabClick = () => {
    if (settingsQuery.data?.adMobConfig) {
      setAdMobForm({
        androidAppId: settingsQuery.data.adMobConfig.androidAppId || "ca-app-pub-3940256099942544~3347511713",
        iosAppId: settingsQuery.data.adMobConfig.iosAppId || "ca-app-pub-3940256099942544~1458002511",
        androidNativeAdId: settingsQuery.data.adMobConfig.androidNativeAdId || "ca-app-pub-3940256099942544/2247696110",
        iosNativeAdId: settingsQuery.data.adMobConfig.iosNativeAdId || "ca-app-pub-3940256099942544/3986624511",
      });
    } else {
      setAdMobForm({
        androidAppId: "ca-app-pub-3940256099942544~3347511713",
        iosAppId: "ca-app-pub-3940256099942544~1458002511",
        androidNativeAdId: "ca-app-pub-3940256099942544/2247696110",
        iosNativeAdId: "ca-app-pub-3940256099942544/3986624511",
      });
    }
  };

  const saveAdMobConfig = () => {
    updateSettingsMutation
      .mutateAsync({
        adMobConfig: {
          androidAppId: adMobForm.androidAppId,
          iosAppId: adMobForm.iosAppId,
          androidNativeAdId: adMobForm.androidNativeAdId,
          iosNativeAdId: adMobForm.iosNativeAdId,
        },
      })
      .then(() => toast.success("AdMob settings saved successfully."))
      .catch((err) => toast.error(handleApiError(err, "Failed to save AdMob settings.")));
  };


  const packages = packagesQuery.data ?? [];

  const openCreatePackageModal = () => {
    setEditingPackage(null);
    setPackageForm({
      name: "",
      days: "7",
      priceUsd: "10",
      targetUsers: "500",
      description: "",
      isPopular: false,
      isActive: true,
      sortOrder: String((packages.length || 0) + 1),
    });
    setPackageModalOpen(true);
  };

  const openEditPackageModal = (pkg: AdPackage) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      days: String(pkg.days),
      priceUsd: String(pkg.priceUsd),
      targetUsers: String(pkg.targetUsers),
      description: pkg.description ?? "",
      isPopular: pkg.isPopular,
      isActive: pkg.isActive,
      sortOrder: String(pkg.sortOrder ?? 0),
    });
    setPackageModalOpen(true);
  };

  const savePackage = () => {
    const name = packageForm.name.trim();
    const days = parseInt(packageForm.days, 10);
    const priceUsd = parseFloat(packageForm.priceUsd);
    const targetUsers = parseInt(packageForm.targetUsers, 10);
    const sortOrder = parseInt(packageForm.sortOrder, 10) || 0;

    if (!name) {
      toast.error("Please enter a package name.");
      return;
    }
    if (isNaN(days) || days <= 0 || days > 365) {
      toast.error("Please enter valid duration in days (1 to 365).");
      return;
    }
    if (isNaN(priceUsd) || priceUsd <= 0) {
      toast.error("Please enter a valid price in USD.");
      return;
    }
    if (isNaN(targetUsers) || targetUsers <= 0) {
      toast.error("Please enter target user reach (e.g. 500).");
      return;
    }

    const payload = {
      name,
      days,
      priceUsd,
      targetUsers,
      description: packageForm.description.trim() || undefined,
      isPopular: packageForm.isPopular,
      isActive: packageForm.isActive,
      sortOrder,
    };

    if (editingPackage) {
      updatePackageMutation
        .mutateAsync({ packageId: editingPackage.id, payload })
        .then(() => {
          toast.success("Ad package updated successfully.");
          setPackageModalOpen(false);
          setEditingPackage(null);
        })
        .catch((error) => toast.error(handleApiError(error, "Failed to update package.")));
    } else {
      createPackageMutation
        .mutateAsync(payload)
        .then(() => {
          toast.success("Ad package created successfully.");
          setPackageModalOpen(false);
        })
        .catch((error) => toast.error(handleApiError(error, "Failed to create package.")));
    }
  };

  const togglePackageActive = (pkg: AdPackage) => {
    updatePackageMutation
      .mutateAsync({
        packageId: pkg.id,
        payload: { isActive: !pkg.isActive },
      })
      .then(() => {
        toast.success(`Package "${pkg.name}" is now ${!pkg.isActive ? "active" : "inactive"}.`);
      })
      .catch((error) => toast.error(handleApiError(error, "Failed to update status.")));
  };

  const deletePackage = () => {
    if (!packageToDelete) return;
    deletePackageMutation
      .mutateAsync(packageToDelete.id)
      .then(() => {
        toast.success("Ad package deleted.");
        setPackageToDelete(null);
      })
      .catch((error) => toast.error(handleApiError(error, "Failed to delete package.")));
  };

  const categories = categoriesQuery.data ?? [];

  const openCreateCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      icon: "",
      description: "",
      isActive: true,
      sortOrder: String((categories.length || 0) + 1),
    });
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: AdCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      icon: cat.icon || "",
      description: cat.description || "",
      isActive: cat.isActive,
      sortOrder: String(cat.sortOrder ?? 0),
    });
    setCategoryModalOpen(true);
  };

  const saveCategory = () => {
    if (!categoryForm.name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      icon: categoryForm.icon.trim() || undefined,
      description: categoryForm.description.trim() || undefined,
      isActive: categoryForm.isActive,
      sortOrder: Number(categoryForm.sortOrder) || 0,
    };

    if (editingCategory) {
      updateCategoryMutation
        .mutateAsync({
          categoryId: editingCategory.id,
          payload,
        })
        .then(() => {
          toast.success("Category updated successfully.");
          setCategoryModalOpen(false);
        })
        .catch((error) => toast.error(handleApiError(error, "Failed to update category.")));
    } else {
      createCategoryMutation
        .mutateAsync(payload)
        .then(() => {
          toast.success("Category created successfully.");
          setCategoryModalOpen(false);
        })
        .catch((error) => toast.error(handleApiError(error, "Failed to create category.")));
    }
  };

  const toggleCategoryActive = (cat: AdCategory) => {
    updateCategoryMutation
      .mutateAsync({
        categoryId: cat.id,
        payload: { isActive: !cat.isActive },
      })
      .then(() => {
        toast.success(`Category "${cat.name}" is now ${!cat.isActive ? "visible" : "hidden"}.`);
      })
      .catch((error) => toast.error(handleApiError(error, "Failed to update category status.")));
  };

  const deleteCategory = () => {
    if (!categoryToDelete) return;
    deleteCategoryMutation
      .mutateAsync(categoryToDelete.id)
      .then(() => {
        toast.success("Category deleted.");
        setCategoryToDelete(null);
      })
      .catch((error) => toast.error(handleApiError(error, "Failed to delete category.")));
  };

  return (
    <div>
      <PageHeader title="Ad Management" subtitle="Manage advertisers, campaigns, pricing packages and ad revenue" />
      <Tabs defaultValue="advertisers">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="advertisers">Advertisers</TabsTrigger>
          <TabsTrigger value="approvals">Campaign Approvals</TabsTrigger>
          <TabsTrigger value="active">Active Campaigns</TabsTrigger>
          <TabsTrigger value="packages">Pricing Packages</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="admob" onClick={onAdMobTabClick}>AdMob Config</TabsTrigger>
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

        <TabsContent value="packages" className="mt-4">
          <Panel>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-white text-base font-semibold">Ad Pricing Packages</h3>
                <p className="text-sm text-[#A0A0A0]">
                  Configure duration, budget (USD), and target user reach shown to advertisers in the mobile app.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-[#84CC16] text-black font-bold hover:bg-[#84CC16]/90 gap-2 shrink-0"
                onClick={openCreatePackageModal}
              >
                <Plus className="size-4" /> Add Package
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Package Name</TableHead>
                  <TableHead className="text-[#A0A0A0]">Duration</TableHead>
                  <TableHead className="text-[#A0A0A0]">Price (USD)</TableHead>
                  <TableHead className="text-[#A0A0A0]">Target Reach</TableHead>
                  <TableHead className="text-[#A0A0A0]">Badge</TableHead>
                  <TableHead className="text-[#A0A0A0]">Status</TableHead>
                  <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packagesQuery.isLoading && <LoadingRow colSpan={7} label="Loading pricing packages..." />}
                {!packagesQuery.isLoading && packages.length === 0 && (
                  <EmptyRow colSpan={7} label="No pricing packages created yet. Click 'Add Package' to create one." />
                )}
                {packages.map((pkg, i) => (
                  <TableRow
                    key={pkg.id}
                    className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}
                  >
                    <TableCell>
                      <div>
                        <p className="text-white font-medium">{pkg.name}</p>
                        {pkg.description ? (
                          <p className="text-xs text-[#A0A0A0] line-clamp-1 max-w-xs">{pkg.description}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Clock className="size-3.5 text-[#84CC16]" /> {pkg.days} Days
                      </span>
                    </TableCell>
                    <TableCell className="text-white font-semibold">{formatMoney(pkg.priceUsd)}</TableCell>
                    <TableCell className="text-[#D4D4D4]">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-3.5 text-[#A0A0A0]" /> {formatNumber(pkg.targetUsers)} users
                      </span>
                    </TableCell>
                    <TableCell>
                      {pkg.isPopular ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#84CC16]/20 text-[#84CC16] border border-[#84CC16]/30">
                          <Sparkles className="size-3" /> Popular
                        </span>
                      ) : (
                        <span className="text-xs text-[#666]">Standard</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusPill status={pkg.isActive ? "Active" : "Paused"} />
                        <Switch
                          checked={pkg.isActive}
                          onCheckedChange={() => togglePackageActive(pkg)}
                          disabled={updatePackageMutation.isPending}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-white hover:bg-white/10"
                          onClick={() => openEditPackageModal(pkg)}
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          onClick={() => setPackageToDelete(pkg)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Panel>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-white text-base font-semibold">Ad Categories</h3>
                <p className="text-sm text-[#A0A0A0]">
                  Create and manage ad categories. You can toggle active/hidden anytime. Only active categories appear in the mobile app.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-[#84CC16] text-black font-bold hover:bg-[#84CC16]/90 gap-2 shrink-0"
                onClick={openCreateCategoryModal}
              >
                <Plus className="size-4" /> Add Category
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">Category Name</TableHead>
                  <TableHead className="text-[#A0A0A0]">Slug</TableHead>
                  <TableHead className="text-[#A0A0A0]">Description</TableHead>
                  <TableHead className="text-[#A0A0A0]">Sort Order</TableHead>
                  <TableHead className="text-[#A0A0A0]">Visibility</TableHead>
                  <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriesQuery.isLoading && <LoadingRow colSpan={6} label="Loading categories..." />}
                {!categoriesQuery.isLoading && categories.length === 0 && (
                  <EmptyRow colSpan={6} label="No categories created yet. Click 'Add Category' to create one." />
                )}
                {categories.map((cat, i) => (
                  <TableRow
                    key={cat.id}
                    className={`border-white/5 hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-[#84CC16] text-xs font-bold">
                          {cat.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#A0A0A0] text-xs font-mono">{cat.slug}</TableCell>
                    <TableCell className="text-[#AAA] text-xs max-w-xs truncate">
                      {cat.description || "—"}
                    </TableCell>
                    <TableCell className="text-[#D4D4D4]">{cat.sortOrder ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusPill status={cat.isActive ? "Active" : "Hidden"} />
                        <Switch
                          checked={cat.isActive}
                          onCheckedChange={() => toggleCategoryActive(cat)}
                          disabled={updateCategoryMutation.isPending}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-white hover:bg-white/10"
                          onClick={() => openEditCategoryModal(cat)}
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          onClick={() => setCategoryToDelete(cat)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </TabsContent>

        <TabsContent value="admob" className="mt-4">
          <Panel>
            <div className="mb-5">
              <h3 className="text-white text-base font-semibold">Google AdMob Configuration</h3>
              <p className="text-sm text-[#A0A0A0]">
                Configure Native In-Feed ads for Android and iOS. By default, Google's test IDs are shown below. 
                When ready, replace them with your real IDs from your AdMob account.
              </p>
            </div>

            {settingsQuery.isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-[#A0A0A0]">
                <Loader2 className="size-4 animate-spin text-[#84CC16]" />
                Loading settings...
              </div>
            ) : (
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <h4 className="text-white font-medium text-sm flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#84CC16]"></div> Android IDs
                    </h4>
                    <div className="space-y-1.5">
                      <Label htmlFor="android-app-id" className="text-xs text-[#A0A0A0]">Android App ID</Label>
                      <Input
                        id="android-app-id"
                        value={adMobForm.androidAppId}
                        onChange={(e) => setAdMobForm((p) => ({ ...p, androidAppId: e.target.value }))}
                        className="bg-white/5 border-white/10 text-white font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="android-native-id" className="text-xs text-[#A0A0A0]">Android Native Ad Unit ID</Label>
                      <Input
                        id="android-native-id"
                        value={adMobForm.androidNativeAdId}
                        onChange={(e) => setAdMobForm((p) => ({ ...p, androidNativeAdId: e.target.value }))}
                        className="bg-white/5 border-white/10 text-white font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-medium text-sm flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div> iOS IDs
                    </h4>
                    <div className="space-y-1.5">
                      <Label htmlFor="ios-app-id" className="text-xs text-[#A0A0A0]">iOS App ID</Label>
                      <Input
                        id="ios-app-id"
                        value={adMobForm.iosAppId}
                        onChange={(e) => setAdMobForm((p) => ({ ...p, iosAppId: e.target.value }))}
                        className="bg-white/5 border-white/10 text-white font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ios-native-id" className="text-xs text-[#A0A0A0]">iOS Native Ad Unit ID</Label>
                      <Input
                        id="ios-native-id"
                        value={adMobForm.iosNativeAdId}
                        onChange={(e) => setAdMobForm((p) => ({ ...p, iosNativeAdId: e.target.value }))}
                        className="bg-white/5 border-white/10 text-white font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Button 
                    className="bg-[#84CC16] text-black font-bold hover:bg-[#84CC16]/90" 
                    onClick={saveAdMobConfig}
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending && <Loader2 className="size-4 animate-spin mr-2" />}
                    Save Configuration
                  </Button>
                </div>
              </div>
            )}
          </Panel>
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

      <Dialog open={packageModalOpen} onOpenChange={setPackageModalOpen}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              {editingPackage ? "Edit Ad Package" : "Create New Ad Package"}
            </DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Set duration, price, and target user reach. Active packages will appear directly in the mobile app.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="pkg-name" className="text-xs text-[#A0A0A0]">
                Package Name *
              </Label>
              <Input
                id="pkg-name"
                placeholder="e.g. 7 Days Starter"
                value={packageForm.name}
                onChange={(e) => setPackageForm((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-[#555]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-days" className="text-xs text-[#A0A0A0]">
                  Duration (Days) *
                </Label>
                <Input
                  id="pkg-days"
                  type="number"
                  min="1"
                  max="365"
                  placeholder="7"
                  value={packageForm.days}
                  onChange={(e) => setPackageForm((prev) => ({ ...prev, days: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pkg-price" className="text-xs text-[#A0A0A0]">
                  Price (USD $) *
                </Label>
                <Input
                  id="pkg-price"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="10"
                  value={packageForm.priceUsd}
                  onChange={(e) => setPackageForm((prev) => ({ ...prev, priceUsd: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-users" className="text-xs text-[#A0A0A0]">
                  Target Reach (Users) *
                </Label>
                <Input
                  id="pkg-users"
                  type="number"
                  min="1"
                  placeholder="500"
                  value={packageForm.targetUsers}
                  onChange={(e) => setPackageForm((prev) => ({ ...prev, targetUsers: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pkg-sort" className="text-xs text-[#A0A0A0]">
                  Sort Order
                </Label>
                <Input
                  id="pkg-sort"
                  type="number"
                  min="0"
                  placeholder="1"
                  value={packageForm.sortOrder}
                  onChange={(e) => setPackageForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pkg-desc" className="text-xs text-[#A0A0A0]">
                Description / Subtitle
              </Label>
              <Textarea
                id="pkg-desc"
                rows={2}
                placeholder="e.g. Reach 500+ targeted users over 7 days."
                value={packageForm.description}
                onChange={(e) => setPackageForm((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-[#555] resize-none"
              />
            </div>

            <div className="rounded-lg bg-white/5 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Highlight as Popular</p>
                  <p className="text-xs text-[#A0A0A0]">Displays a "Popular" badge in the mobile app</p>
                </div>
                <Switch
                  checked={packageForm.isPopular}
                  onCheckedChange={(checked) => setPackageForm((prev) => ({ ...prev, isPopular: checked }))}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <p className="text-sm text-white font-medium">Active Status</p>
                  <p className="text-xs text-[#A0A0A0]">When disabled, advertisers cannot select this package</p>
                </div>
                <Switch
                  checked={packageForm.isActive}
                  onCheckedChange={(checked) => setPackageForm((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              className="text-[#A0A0A0] hover:text-white hover:bg-white/5"
              onClick={() => setPackageModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#84CC16] text-black font-bold hover:bg-[#84CC16]/90"
              onClick={savePackage}
              disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
            >
              {(createPackageMutation.isPending || updatePackageMutation.isPending) && (
                <Loader2 className="size-4 animate-spin mr-2" />
              )}
              {editingPackage ? "Save Changes" : "Create Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!packageToDelete}
        onOpenChange={(open) => !open && setPackageToDelete(null)}
        title="Delete Ad Package"
        description={`Are you sure you want to delete "${packageToDelete?.name}"? Advertisers will no longer be able to select this package.`}
        confirmText={deletePackageMutation.isPending ? "Deleting..." : "Delete Package"}
        variant="destructive"
        onConfirm={deletePackage}
      />

      {/* Create / Edit Category Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              {editingCategory ? "Edit Ad Category" : "Create New Ad Category"}
            </DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Categories let advertisers tag their promotions. Only active categories will be selectable in the mobile app.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name" className="text-xs text-[#A0A0A0]">
                Category Name *
              </Label>
              <Input
                id="cat-name"
                placeholder="e.g. Technology, Food, Real Estate"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-[#555]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-desc" className="text-xs text-[#A0A0A0]">
                Description (Optional)
              </Label>
              <Input
                id="cat-desc"
                placeholder="Short description of this niche"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-[#555]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-order" className="text-xs text-[#A0A0A0]">
                Display Sort Order
              </Label>
              <Input
                id="cat-order"
                type="number"
                min="0"
                placeholder="1"
                value={categoryForm.sortOrder}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/5 p-3.5 border border-white/10">
              <div>
                <p className="text-white text-sm font-medium">Active & Visible</p>
                <p className="text-xs text-[#A0A0A0]">Show this category to mobile users</p>
              </div>
              <Switch
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
              onClick={() => setCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#84CC16] text-black font-bold hover:bg-[#84CC16]/90"
              onClick={saveCategory}
              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Modal */}
      <ConfirmModal
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        title="Delete Category"
        description={`Are you sure you want to delete category "${categoryToDelete?.name}"?`}
        confirmText={deleteCategoryMutation.isPending ? "Deleting..." : "Delete Category"}
        variant="destructive"
        onConfirm={deleteCategory}
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

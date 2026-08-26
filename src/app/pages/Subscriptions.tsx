import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, StatCard, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { ConfirmModal } from "../components/ui/confirm-modal";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Switch } from "../components/ui/switch";
import { handleApiError } from "../api/client";
import {
  useAdminSubscriptionPlansQuery,
  useAdminSubscriptionSubscribersQuery,
  useUpdateAdminSubscriptionSubscriberStatusMutation,
  useCreateAdminSubscriptionPlanMutation,
  useDeleteAdminSubscriptionPlanMutation,
  useUpdateAdminSubscriptionPlanMutation,
} from "../api/subscriptions.query";
import type { AdminSubscriptionPlan, AdminSubscriptionPlanInput } from "../api/subscriptions";

type PlanForm = {
  planId: string;
  name: string;
  interval: "month" | "year" | "lifetime";
  price: string;
  discountLabel: string;
  productIdentifier: string;
  features: string[];
  isActive: boolean;
  sortOrder: string;
};

const defaultFeatureOptions = [
  "No ads in feed",
  "Uninterrupted watching",
  "Premium badge on profile",
  "Priority support",
  "Creator analytics",
  "Exclusive live gifts",
];

const hiddenFeatureOptions = [
  "Advanced profile customization",
  "Subscriber-only content",
  "Premium live access",
  "Longer video uploads",
  "HD video playback",
  "Early access to new features",
  "Download saved content",
  "Verified supporter badge",
  "Boosted content visibility",
  "Exclusive stickers and reactions",
  "Custom profile themes",
  "Monthly creator rewards",
];

const allFeatureOptions = [...defaultFeatureOptions, ...hiddenFeatureOptions];

const emptyForm: PlanForm = {
  planId: "",
  name: "",
  interval: "month",
  price: "",
  discountLabel: "",
  productIdentifier: "",
  features: ["No ads in feed", "Uninterrupted watching", "Premium badge on profile"],
  isActive: true,
  sortOrder: "0",
};

export function Subscriptions({ accessToken }: { accessToken: string }) {
  const [activeTab, setActiveTab] = useState<"plans" | "subscribers">("plans");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [planToDelete, setPlanToDelete] = useState<AdminSubscriptionPlan | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [subscriberPage, setSubscriberPage] = useState(1);
  const [subscriberLimit, setSubscriberLimit] = useState(10);
  const [subscriberStatus, setSubscriberStatus] = useState("all");

  const plansQuery = useAdminSubscriptionPlansQuery(accessToken);
  const subscribersQuery = useAdminSubscriptionSubscribersQuery(accessToken, {
    page: subscriberPage,
    limit: subscriberLimit,
    status: subscriberStatus,
  });
  const createMutation = useCreateAdminSubscriptionPlanMutation(accessToken);
  const updateMutation = useUpdateAdminSubscriptionPlanMutation(accessToken);
  const deleteMutation = useDeleteAdminSubscriptionPlanMutation(accessToken);
  const updateSubscriberStatusMutation = useUpdateAdminSubscriptionSubscriberStatusMutation(accessToken);

  const activePlans = useMemo(() => (plansQuery.data || []).filter((plan) => plan.isActive), [plansQuery.data]);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!editingPlanId) return;
    const selected = plansQuery.data?.find((plan) => plan.id === editingPlanId);
    if (selected) setForm(planToForm(selected));
  }, [editingPlanId, plansQuery.data]);

  const handleEdit = (plan: AdminSubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setForm(planToForm(plan));
  };

  const handleReset = () => {
    setEditingPlanId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    try {
      const payload = formToPayload(form);
      if (editingPlanId) {
        await updateMutation.mutateAsync({ planId: editingPlanId, input: payload });
        toast.success("Subscription plan updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Subscription plan created");
      }
      handleReset();
    } catch (error) {
      toast.error(handleApiError(error, "Subscription plan could not be saved."));
    }
  };

  const handleDelete = async (planId: string) => {
    try {
      setDeletingPlanId(planId);
      await deleteMutation.mutateAsync(planId);
      if (editingPlanId === planId) handleReset();
      toast.success("Subscription plan deleted");
    } catch (error) {
      toast.error(handleApiError(error, "Subscription plan could not be deleted."));
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleToggleFeature = (feature: string, checked: boolean) => {
    setForm((current) => {
      if (checked) {
        return current.features.includes(feature)
          ? current
          : { ...current, features: [...current.features, feature] };
      }

      return { ...current, features: current.features.filter((item) => item !== feature) };
    });
  };

  const handleSubscriberStatus = async (userId: string, status: "active" | "hold" | "canceled") => {
    try {
      await updateSubscriberStatusMutation.mutateAsync({ userId, status });
      toast.success(`Subscriber marked as ${status}`);
    } catch (error) {
      toast.error(handleApiError(error, "Subscriber status could not be updated."));
    }
  };

  return (
    <div>
      <PageHeader title="Subscription Management" subtitle="Monitor premium subscribers and revenue" />

      <div className="flex items-center gap-2 mb-6">
        <Button
          className={activeTab === "plans" ? "bg-[#84CC16] text-black font-bold hover:bg-[#84CC16]/90" : "bg-[#1D1D1D] text-white hover:bg-white/10"}
          onClick={() => setActiveTab("plans")}
        >
          Plans
        </Button>
        <Button
          className={activeTab === "subscribers" ? "bg-[#84CC16] text-black font-bold hover:bg-[#84CC16]/90" : "bg-[#1D1D1D] text-white hover:bg-white/10"}
          onClick={() => setActiveTab("subscribers")}
        >
          Subscribers
        </Button>
      </div>

      {activeTab === "plans" && (
        <>
      <Panel title="Package Configuration" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl">
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Plan ID</Label>
            <Input
              value={form.planId}
              onChange={(event) => setForm((current) => ({ ...current, planId: event.target.value }))}
              disabled={Boolean(editingPlanId)}
              placeholder="monthly"
              className="bg-[#141414] border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Plan Name</Label>
            <Input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Premium Monthly"
              className="bg-[#141414] border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Interval</Label>
            <select
              value={form.interval}
              onChange={(event) => setForm((current) => ({ ...current, interval: event.target.value as "month" | "year" | "lifetime" }))}
              className="w-full h-9 rounded-md bg-[#141414] border border-white/10 px-3 text-white outline-none"
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
              <option value="lifetime">Lifetime</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Price</Label>
            <div className="flex items-center bg-[#141414] border border-white/10 rounded-md h-9 px-3">
              <span className="text-[#A0A0A0] mr-1">$</span>
              <input
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                inputMode="decimal"
                className="bg-transparent outline-none text-white w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Discount Label</Label>
            <Input
              value={form.discountLabel}
              onChange={(event) => setForm((current) => ({ ...current, discountLabel: event.target.value }))}
              placeholder="15% OFF"
              className="bg-[#141414] border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Sort Order</Label>
            <Input
              value={form.sortOrder}
              onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
              inputMode="numeric"
              className="bg-[#141414] border-white/10 text-white"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-[#A0A0A0]">RevenueCat Product ID</Label>
            <Input
              value={form.productIdentifier}
              onChange={(event) => setForm((current) => ({ ...current, productIdentifier: event.target.value }))}
              placeholder="premium_monthly"
              className="bg-[#141414] border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Active in app</Label>
            <div className="h-9 flex items-center gap-3 rounded-md bg-[#141414] border border-white/10 px-3">
              <Switch checked={form.isActive} onCheckedChange={(value) => setForm((current) => ({ ...current, isActive: value }))} />
              <span className="text-sm text-white">{form.isActive ? "Visible" : "Hidden"}</span>
            </div>
          </div>
          <div className="space-y-2 sm:col-span-3">
            <Label className="text-[#A0A0A0]">Features</Label>
            <div className="rounded-md bg-[#141414] border border-white/10 p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {defaultFeatureOptions.map((feature) => {
                  const checked = form.features.includes(feature);
                  return (
                    <label key={feature} className="flex items-center gap-3 text-sm text-white cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => handleToggleFeature(feature, value === true)}
                        className="border-white/20 data-[state=checked]:bg-[#84CC16] data-[state=checked]:border-[#84CC16] data-[state=checked]:text-black"
                      />
                      <span className="flex-1">{feature}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="bg-[#84CC16] text-black font-bold hover:bg-[#84CC16]/90"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
            {editingPlanId ? "Save Changes" : "Add Plan"}
          </Button>
          {editingPlanId && (
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={handleReset}>
              Cancel Edit
            </Button>
          )}
        </div>
      </Panel>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Plans" value={String(plansQuery.data?.length || 0)} change="Live" positive />
        <StatCard label="Active Plans" value={String(activePlans.length)} change="App visible" positive />
        <StatCard label="Hidden Plans" value={String((plansQuery.data?.length || 0) - activePlans.length)} change="Admin only" />
      </div>

      <Panel title="Plans">
        {plansQuery.isLoading ? (
          <div className="h-40 flex items-center justify-center text-[#A0A0A0]">
            <Loader2 className="size-5 animate-spin mr-2 text-[#84CC16]" />
            Loading subscription plans...
          </div>
        ) : plansQuery.isError ? (
          <div className="h-40 flex flex-col items-center justify-center gap-3 text-[#A0A0A0]">
            <span>Subscription plans could not be loaded.</span>
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => plansQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[#A0A0A0]">Plan</TableHead>
                <TableHead className="text-[#A0A0A0]">Interval</TableHead>
                <TableHead className="text-[#A0A0A0]">Price</TableHead>
                <TableHead className="text-[#A0A0A0]">Product ID</TableHead>
                <TableHead className="text-[#A0A0A0]">Status</TableHead>
                <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(plansQuery.data || []).map((plan, index) => (
                <TableRow key={plan.id} className={`border-white/5 hover:bg-white/5 ${index % 2 ? "bg-white/[0.02]" : ""}`}>
                  <TableCell>
                    <div className="text-white font-medium">{plan.name}</div>
                    <div className="text-xs text-[#A0A0A0]">{plan.id}</div>
                  </TableCell>
                  <TableCell className="text-[#A0A0A0]">{getIntervalLabel(plan.interval)}</TableCell>
                  <TableCell className="text-white">${plan.price.toFixed(2)}</TableCell>
                  <TableCell className="text-[#A0A0A0] max-w-[220px] truncate">{plan.productIdentifier || "Not set"}</TableCell>
                  <TableCell><StatusPill status={plan.isActive ? "Active" : "Inactive"} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => handleEdit(plan)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => setPlanToDelete(plan)}
                        disabled={Boolean(deletingPlanId)}
                      >
                        {deletingPlanId === plan.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
        </>
      )}

      {activeTab === "subscribers" && (
      <Panel title="Subscribers">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="text-sm text-[#A0A0A0]">
            {subscribersQuery.data?.pagination.total || 0} users have subscription history
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={subscriberStatus}
              onChange={(event) => {
                setSubscriberStatus(event.target.value);
                setSubscriberPage(1);
              }}
              className="h-9 rounded-md bg-[#141414] border border-white/10 px-3 text-white outline-none"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="hold">Hold</option>
              <option value="expired">Expired</option>
              <option value="canceled">Canceled</option>
            </select>
            <select
              value={subscriberLimit}
              onChange={(event) => {
                setSubscriberLimit(Number(event.target.value));
                setSubscriberPage(1);
              }}
              className="h-9 rounded-md bg-[#141414] border border-white/10 px-3 text-white outline-none"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
        {subscribersQuery.isLoading ? (
          <div className="h-40 flex items-center justify-center text-[#A0A0A0]">
            <Loader2 className="size-5 animate-spin mr-2 text-[#84CC16]" />
            Loading subscribers...
          </div>
        ) : subscribersQuery.isError ? (
          <div className="h-40 flex flex-col items-center justify-center gap-3 text-[#A0A0A0]">
            <span>Subscribers could not be loaded.</span>
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/10" onClick={() => subscribersQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[#A0A0A0]">User</TableHead>
                  <TableHead className="text-[#A0A0A0]">Plan</TableHead>
                  <TableHead className="text-[#A0A0A0]">Provider</TableHead>
                  <TableHead className="text-[#A0A0A0]">Expires</TableHead>
                  <TableHead className="text-[#A0A0A0]">Status</TableHead>
                  <TableHead className="text-[#A0A0A0]">Payment</TableHead>
                  <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(subscribersQuery.data?.items || []).map((subscriber, index) => (
                  <TableRow key={subscriber.id} className={`border-white/5 hover:bg-white/5 ${index % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {subscriber.avatarUrl ? (
                          <img src={subscriber.avatarUrl} alt="" className="size-9 rounded-full object-cover" />
                        ) : (
                          <div className="size-9 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                            {subscriber.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-white font-medium">{subscriber.displayName}</div>
                          <div className="text-xs text-[#A0A0A0]">{subscriber.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{subscriber.plan || "No plan"}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{subscriber.provider || "Unknown"}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{formatDate(subscriber.expiresAt) || "Lifetime / none"}</TableCell>
                    <TableCell><StatusPill status={getSubscriptionStatusLabel(subscriber.status)} /></TableCell>
                    <TableCell className="text-[#A0A0A0] max-w-[180px] truncate">{subscriber.paymentId || "Not available"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90 disabled:opacity-50"
                          disabled={subscriber.status === "active" || isUpdatingSubscriberStatus(updateSubscriberStatusMutation.isPending, updateSubscriberStatusMutation.variables, subscriber.id)}
                          onClick={() => handleSubscriberStatus(subscriber.id, "active")}
                        >
                          {isUpdatingSubscriberStatus(updateSubscriberStatusMutation.isPending, updateSubscriberStatusMutation.variables, subscriber.id, "active") && (
                            <Loader2 className="size-3 animate-spin mr-1" />
                          )}
                          Active
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 bg-transparent disabled:opacity-50"
                          disabled={subscriber.status === "hold" || isUpdatingSubscriberStatus(updateSubscriberStatusMutation.isPending, updateSubscriberStatusMutation.variables, subscriber.id)}
                          onClick={() => handleSubscriberStatus(subscriber.id, "hold")}
                        >
                          {isUpdatingSubscriberStatus(updateSubscriberStatusMutation.isPending, updateSubscriberStatusMutation.variables, subscriber.id, "hold") && (
                            <Loader2 className="size-3 animate-spin mr-1" />
                          )}
                          Hold
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/40 text-red-400 hover:bg-red-500/10 bg-transparent disabled:opacity-50"
                          disabled={subscriber.status === "canceled" || isUpdatingSubscriberStatus(updateSubscriberStatusMutation.isPending, updateSubscriberStatusMutation.variables, subscriber.id)}
                          onClick={() => handleSubscriberStatus(subscriber.id, "canceled")}
                        >
                          {isUpdatingSubscriberStatus(updateSubscriberStatusMutation.isPending, updateSubscriberStatusMutation.variables, subscriber.id, "canceled") && (
                            <Loader2 className="size-3 animate-spin mr-1" />
                          )}
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!subscribersQuery.data?.items.length && (
              <div className="h-24 flex items-center justify-center text-[#A0A0A0]">
                No subscribers found.
              </div>
            )}
            <div className="flex items-center justify-between gap-3 mt-4 text-sm text-[#A0A0A0]">
              <span>
                Page {subscribersQuery.data?.pagination.page || 1} of {Math.max(1, subscribersQuery.data?.pagination.totalPages || 1)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10"
                  disabled={subscriberPage <= 1}
                  onClick={() => setSubscriberPage((page) => Math.max(1, page - 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10"
                  disabled={subscriberPage >= (subscribersQuery.data?.pagination.totalPages || 1)}
                  onClick={() => setSubscriberPage((page) => page + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Panel>
      )}
      <ConfirmModal
        open={!!planToDelete}
        onOpenChange={(open) => !open && setPlanToDelete(null)}
        title="Delete Subscription Plan"
        description={`Delete ${planToDelete?.name || "this plan"}? Existing payment history will remain, but this plan will no longer be available.`}
        confirmText={deletingPlanId ? "Deleting..." : "Delete"}
        variant="destructive"
        onConfirm={() => {
          if (planToDelete) {
            void handleDelete(planToDelete.id).then(() => setPlanToDelete(null));
          }
        }}
      />
    </div>
  );
}

function getIntervalLabel(interval: "month" | "year" | "lifetime") {
  if (interval === "year") return "Yearly";
  if (interval === "lifetime") return "Lifetime";
  return "Monthly";
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatStatus(status?: string) {
  if (!status) return "-";
  if (status === "active") return "Active";
  if (status === "expired") return "Expired";
  if (status === "canceled") return "Canceled";
  if (status === "hold") return "On Hold";
  return status;
}

function getSubscriptionStatusLabel(status: string) {
  if (status === "active") return "Active";
  if (status === "hold") return "Held";
  if (status === "expired") return "Expired";
  if (status === "canceled") return "Canceled";
  return "None";
}

function isUpdatingSubscriberStatus(
  isPending: boolean,
  variables: { userId: string; status: "active" | "hold" | "canceled" } | undefined,
  userId: string,
  status?: "active" | "hold" | "canceled",
) {
  if (!isPending) return false;
  if (!variables || variables.userId !== userId) return false;
  if (status && variables.status !== status) return false;
  return true;
}

function planToForm(plan: AdminSubscriptionPlan): PlanForm {
  return {
    planId: plan.id,
    name: plan.name,
    interval: plan.interval,
    price: String(plan.price),
    discountLabel: plan.discountLabel || "",
    productIdentifier: plan.productIdentifier || "",
    features: plan.features,
    isActive: plan.isActive,
    sortOrder: String(plan.sortOrder),
  };
}

function formToPayload(form: PlanForm): AdminSubscriptionPlanInput {
  const planId = form.planId.trim().toLowerCase();
  const price = Number(form.price);
  const sortOrder = Number(form.sortOrder || 0);

  if (!planId) throw new Error("Plan ID is required.");
  if (!form.name.trim()) throw new Error("Plan name is required.");
  if (!Number.isFinite(price) || price < 0) throw new Error("Valid price is required.");

  return {
    planId,
    name: form.name.trim(),
    interval: form.interval,
    price,
    currency: "usd",
    discountLabel: form.discountLabel.trim() || undefined,
    productIdentifier: form.productIdentifier.trim() || undefined,
    features: form.features
      .map((item) => item.trim())
      .filter((item) => allFeatureOptions.includes(item)),
    isActive: form.isActive,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

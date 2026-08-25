import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { handleApiError } from "../api/client";
import {
  useAdminPlatformSettingsQuery,
  useUpdateAdminPlatformSettingsMutation,
} from "../api/settings.query";
import type { PlatformFeatureFlags, PlatformLanguage, PlatformSettings } from "../api/settings";
import { PageHeader, Panel } from "../components/shared";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";

const DEFAULT_SETTINGS: PlatformSettings = {
  maintenanceMode: false,
  maintenanceMessage: "Play is under maintenance. Please try again soon.",
  videosBetweenAds: 6,
  payoutPerThousandViewsUsd: 3.5,
  payoutRates: [
    { region: "North America", rateUsd: 4.2 },
    { region: "Europe", rateUsd: 3.8 },
    { region: "Asia Pacific", rateUsd: 2.1 },
    { region: "Latin America", rateUsd: 1.6 },
  ],
  languages: [
    { code: "en", name: "English", active: true },
    { code: "bn", name: "Bangla", active: true },
  ],
  featureFlags: {
    liveStreaming: true,
    ads: true,
    kidsMode: true,
    rewards: true,
    subscriptions: true,
    creatorApplications: true,
    coinPurchase: true,
    withdrawals: true,
  },
  updatedAt: "",
};

const FEATURE_LABELS: { key: keyof PlatformFeatureFlags; label: string }[] = [
  { key: "liveStreaming", label: "Live streaming" },
  { key: "ads", label: "Ads" },
  { key: "kidsMode", label: "Kids mode" },
  { key: "rewards", label: "Rewards" },
  { key: "subscriptions", label: "Subscriptions" },
  { key: "creatorApplications", label: "Creator applications" },
  { key: "coinPurchase", label: "Coin purchase" },
  { key: "withdrawals", label: "Withdrawals" },
];

export function Settings({ accessToken }: { accessToken: string }) {
  const query = useAdminPlatformSettingsQuery(accessToken);
  const updateMutation = useUpdateAdminPlatformSettingsMutation(accessToken);
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  useEffect(() => {
    if (query.data) {
      setSettings({ ...DEFAULT_SETTINGS, ...query.data });
    }
  }, [query.data]);

  const saveSettings = (section: string, input: Parameters<typeof updateMutation.mutateAsync>[0]) => {
    setSavingSection(section);
    updateMutation
      .mutateAsync(input)
      .then(() => toast.success("Settings saved."))
      .catch((error) => toast.error(handleApiError(error, "Failed to save settings.")))
      .finally(() => setSavingSection(null));
  };

  const isSaving = (section: string) => updateMutation.isPending && savingSection === section;

  const SaveButton = ({ section, input }: { section: string; input: Parameters<typeof updateMutation.mutateAsync>[0] }) => (
    <Button
      size="sm"
      className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90"
      disabled={updateMutation.isPending}
      onClick={() => saveSettings(section, input)}
    >
      {isSaving(section) ? <><Loader2 className="size-4 animate-spin" /> Saving...</> : "Save"}
    </Button>
  );

  const updateLanguage = (index: number, patch: Partial<PlatformLanguage>) => {
    setSettings((current) => ({
      ...current,
      languages: current.languages.map((language, languageIndex) =>
        languageIndex === index ? { ...language, ...patch } : language,
      ),
    }));
  };

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings & Configuration" subtitle="Manage platform-wide rules and access" />
        <Panel>
          <div className="flex items-center justify-center gap-2 py-12 text-[#A0A0A0]">
            <Loader2 className="size-4 animate-spin text-[#84CC16]" />
            Loading settings...
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Configuration"
        subtitle="Manage platform-wide rules and access"
      />

      <Panel
        title="Platform Status"
        action={<SaveButton section="platform" input={{ maintenanceMode: settings.maintenanceMode, maintenanceMessage: settings.maintenanceMessage }} />}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 max-w-3xl">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#141414] px-4 py-3">
            <span className="text-white">Maintenance mode</span>
            <Switch checked={settings.maintenanceMode} onCheckedChange={(maintenanceMode) => setSettings((current) => ({ ...current, maintenanceMode }))} />
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Maintenance message</Label>
            <Input value={settings.maintenanceMessage} onChange={(event) => setSettings((current) => ({ ...current, maintenanceMessage: event.target.value }))} className="bg-[#141414] border-white/10 text-white" />
          </div>
        </div>
      </Panel>

      <Panel title="Feature Flags" action={<SaveButton section="features" input={{ featureFlags: settings.featureFlags }} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {FEATURE_LABELS.map((feature) => (
            <div key={feature.key} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#141414] px-4 py-3">
              <span className="text-white text-sm">{feature.label}</span>
              <Switch
                checked={settings.featureFlags[feature.key]}
                onCheckedChange={(enabled) =>
                  setSettings((current) => ({
                    ...current,
                    featureFlags: { ...current.featureFlags, [feature.key]: enabled },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Ad Frequency" action={<SaveButton section="ads" input={{ videosBetweenAds: settings.videosBetweenAds }} />}>
        <div className="max-w-xs space-y-2">
          <Label className="text-[#A0A0A0]">Videos between ads</Label>
          <div className="flex items-center gap-2">
            <Input type="number" min={1} max={100} value={settings.videosBetweenAds} onChange={(event) => setSettings((current) => ({ ...current, videosBetweenAds: Math.max(1, Number(event.target.value) || 1) }))} className="bg-[#141414] border-white/10 text-white" />
            <span className="text-sm text-[#A0A0A0] whitespace-nowrap">videos</span>
          </div>
        </div>
      </Panel>

      <Panel
        title="Payout Rate"
        action={<SaveButton section="payout" input={{ payoutPerThousandViewsUsd: settings.payoutPerThousandViewsUsd }} />}
      >
        <div className="max-w-xs space-y-2">
          <Label className="text-[#A0A0A0]">Per 1,000 views</Label>
          <div className="flex items-center gap-2">
            <Input type="number" min={0} step="0.01" value={settings.payoutPerThousandViewsUsd} onChange={(event) => setSettings((current) => ({ ...current, payoutPerThousandViewsUsd: Math.max(0, Number(event.target.value) || 0) }))} className="bg-[#141414] border-white/10 text-white" />
            <span className="text-sm text-[#A0A0A0] whitespace-nowrap">USD</span>
          </div>
        </div>
      </Panel>

      <Panel title="Language Management" action={<Button size="sm" className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90" onClick={() => setSettings((current) => ({ ...current, languages: [...current.languages, { code: "", name: "", active: true }] }))}><Plus className="size-4" /> Add Language</Button>}>
        <div className="divide-y divide-white/5">
          {settings.languages.map((language, index) => (
            <div key={`${language.code}-${index}`} className="grid grid-cols-[90px_1fr_auto_auto] items-center gap-3 py-3">
              <Input value={language.code} placeholder="en" onChange={(event) => updateLanguage(index, { code: event.target.value })} className="bg-[#141414] border-white/10 text-white" />
              <Input value={language.name} placeholder="English" onChange={(event) => updateLanguage(index, { name: event.target.value })} className="bg-[#141414] border-white/10 text-white" />
              <Switch checked={language.active} onCheckedChange={(active) => updateLanguage(index, { active })} />
              <Button size="icon" variant="ghost" className="size-8 text-red-400 hover:bg-red-500/10" disabled={settings.languages.length <= 1} onClick={() => setSettings((current) => ({ ...current, languages: current.languages.filter((_, languageIndex) => languageIndex !== index) }))}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <SaveButton section="languages" input={{ languages: settings.languages }} />
        </div>
      </Panel>
    </div>
  );
}

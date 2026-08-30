import { useEffect, useState } from "react";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { handleApiError } from "../api/client";
import type { AdminContentPage, ContentPageType, ContentSection } from "../api/contentPages";
import {
  useAdminContentPagesQuery,
  useCreateAdminContentPageMutation,
  usePublishAdminContentPageMutation,
  useUpdateAdminContentPageMutation,
} from "../api/contentPages.query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";

const DEFAULT_SETTINGS: PlatformSettings = {
  maintenanceMode: false,
  maintenanceMessage: "Play is under maintenance. Please try again soon.",
  videosBetweenAds: 6,
  payoutPerThousandViewsUsd: 3.5,
  creatorSharePercentage: 60,
  platformSharePercentage: 40,
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

const LEGAL_PAGE_LABELS: Record<ContentPageType, string> = {
  "about-us": "About Us",
  "privacy-policy": "Privacy Policy",
  "terms-conditions": "Terms & Conditions",
};

const LEGAL_PAGE_TYPES = Object.keys(LEGAL_PAGE_LABELS) as ContentPageType[];

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

      <Tabs defaultValue="general">
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="legal">Legal Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-5 space-y-6">
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
        </TabsContent>

        <TabsContent value="legal" className="mt-5">
          <LegalPagesEditor accessToken={accessToken} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LegalPagesEditor({ accessToken }: { accessToken: string }) {
  const [pageType, setPageType] = useState<ContentPageType>("privacy-policy");
  const [title, setTitle] = useState(LEGAL_PAGE_LABELS["privacy-policy"]);
  const [sections, setSections] = useState<ContentSection[]>([
    { heading: "Overview", content: "", order: 0 },
  ]);
  const [changeSummary, setChangeSummary] = useState("");
  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null);

  const pagesQuery = useAdminContentPagesQuery(accessToken, { pageType, limit: 50 });
  const createMutation = useCreateAdminContentPageMutation(accessToken);
  const updateMutation = useUpdateAdminContentPageMutation(accessToken);
  const publishMutation = usePublishAdminContentPageMutation(accessToken);

  const pages = pagesQuery.data?.items ?? [];
  const draftPage = pages.find((page) => page.status === "draft") ?? null;
  const publishedPage = pages.find((page) => page.status === "published") ?? null;
  const activeDraft = draftPage ?? publishedPage;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isPublishing = publishMutation.isPending;

  useEffect(() => {
    const nextPage = draftPage ?? publishedPage;

    if (!nextPage) {
      setLoadedDraftId(null);
      setTitle(LEGAL_PAGE_LABELS[pageType]);
      setSections([{ heading: "Overview", content: "", order: 0 }]);
      setChangeSummary("");
      return;
    }

    setLoadedDraftId(nextPage.id);
    setTitle(nextPage.title);
    setSections(normalizeSections(nextPage.sections));
    setChangeSummary(nextPage.changeSummary ?? "");
  }, [draftPage?.id, pageType, publishedPage?.id]);

  const updateSection = (index: number, patch: Partial<ContentSection>) => {
    setSections((current) =>
      current.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...patch, order: sectionIndex } : section,
      ),
    );
  };

  const removeSection = (index: number) => {
    setSections((current) =>
      current.length <= 1
        ? current
        : current.filter((_, sectionIndex) => sectionIndex !== index).map((section, order) => ({ ...section, order })),
    );
  };

  const addSection = () => {
    setSections((current) => [...current, { heading: "", content: "", order: current.length }]);
  };

  const saveDraft = async () => {
    const cleanSections = sections
      .map((section, order) => ({
        heading: section.heading.trim(),
        content: section.content.trim(),
        order,
      }))
      .filter((section) => section.heading && section.content);

    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    if (cleanSections.length === 0) {
      toast.error("At least one section with heading and content is required.");
      return;
    }

    try {
      const input = {
        title: title.trim(),
        sections: cleanSections,
        changeSummary: changeSummary.trim() || undefined,
      };

      if (draftPage) {
        await updateMutation.mutateAsync({ pageId: draftPage.id, input });
        toast.success("Legal page draft saved.");
        return;
      }

      await createMutation.mutateAsync({ pageType, ...input });
      toast.success("Legal page draft created.");
    } catch (error) {
      toast.error(handleApiError(error, "Legal page could not be saved."));
    }
  };

  const publishDraft = async () => {
    if (!draftPage) {
      toast.error("Save a draft before publishing.");
      return;
    }

    try {
      await publishMutation.mutateAsync({ pageId: draftPage.id });
      toast.success(`${LEGAL_PAGE_LABELS[pageType]} published.`);
    } catch (error) {
      toast.error(handleApiError(error, "Legal page could not be published."));
    }
  };

  return (
    <Panel
      title="Legal Pages"
      action={
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-transparent hover:bg-white/5"
            disabled={isSaving || isPublishing || !draftPage}
            onClick={publishDraft}
          >
            {isPublishing ? <><Loader2 className="size-4 animate-spin" /> Publishing...</> : "Publish"}
          </Button>
          <Button
            size="sm"
            className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90"
            disabled={isSaving || isPublishing}
            onClick={saveDraft}
          >
            {isSaving ? <><Loader2 className="size-4 animate-spin" /> Saving...</> : "Save Draft"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Page</Label>
            <select
              value={pageType}
              onChange={(event) => setPageType(event.target.value as ContentPageType)}
              className="h-10 w-full rounded-md border border-white/10 bg-[#141414] px-3 text-sm text-white outline-none"
            >
              {LEGAL_PAGE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {LEGAL_PAGE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Title</Label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="bg-[#141414] border-white/10 text-white"
              placeholder="Page title"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <LegalStatusCard label="Published" page={publishedPage} />
          <LegalStatusCard label="Draft" page={draftPage} />
          <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
            <div className="flex items-center gap-2 text-[#A0A0A0]">
              <FileText className="size-4 text-[#84CC16]" />
              <span className="text-sm">Editing</span>
            </div>
            <p className="mt-2 text-white">{activeDraft ? `Version ${activeDraft.version}` : "New draft"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[#A0A0A0]">Change summary</Label>
          <Input
            value={changeSummary}
            onChange={(event) => setChangeSummary(event.target.value)}
            className="bg-[#141414] border-white/10 text-white"
            placeholder="What changed in this version?"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-[#A0A0A0]">Sections</Label>
            <Button size="sm" variant="outline" className="border-white/10 bg-transparent hover:bg-white/5" onClick={addSection}>
              <Plus className="size-4" /> Add Section
            </Button>
          </div>

          {pagesQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#141414] py-8 text-[#A0A0A0]">
              <Loader2 className="size-4 animate-spin text-[#84CC16]" />
              Loading legal page...
            </div>
          ) : (
            sections.map((section, index) => (
              <div key={`${loadedDraftId ?? pageType}-${index}`} className="rounded-xl border border-white/10 bg-[#141414] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">Section {index + 1}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-red-400 hover:bg-red-500/10"
                    disabled={sections.length <= 1}
                    onClick={() => removeSection(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <Input
                    value={section.heading}
                    onChange={(event) => updateSection(index, { heading: event.target.value })}
                    className="bg-[#101010] border-white/10 text-white"
                    placeholder="Section heading"
                  />
                  <Textarea
                    value={section.content}
                    onChange={(event) => updateSection(index, { content: event.target.value })}
                    rows={6}
                    className="bg-[#101010] border-white/10 text-white"
                    placeholder="Section content"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Panel>
  );
}

function LegalStatusCard({ label, page }: { label: string; page: AdminContentPage | null }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
      <p className="text-sm text-[#A0A0A0]">{label}</p>
      <p className="mt-2 text-white">{page ? `Version ${page.version}` : "Not available"}</p>
      {page?.updatedAt && (
        <p className="mt-1 text-xs text-[#A0A0A0]">{new Date(page.updatedAt).toLocaleString()}</p>
      )}
    </div>
  );
}

function normalizeSections(sections: ContentSection[]) {
  if (sections.length === 0) {
    return [{ heading: "Overview", content: "", order: 0 }];
  }

  return [...sections]
    .sort((left, right) => left.order - right.order)
    .map((section, order) => ({ ...section, order }));
}

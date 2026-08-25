import { Loader2, MessageCircle, Pencil, Radio, RotateCcw, Search, Trash2, UserRound, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { handleApiError } from "../api/client";
import type { AdminContentItem, AdminContentType } from "../api/content";
import {
  useAdminContentQuery,
  useRemoveAdminContentMutation,
  useRestoreAdminContentMutation,
  useUpdateAdminContentMutation,
} from "../api/content.query";
import { PageHeader, Panel, StatusPill } from "../components/shared";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";

const contentTabs = [
  { value: "reels", label: "Reels", icon: Video },
  { value: "comments", label: "Comments", icon: MessageCircle },
  { value: "users", label: "Users", icon: UserRound },
  { value: "live-streams", label: "Live Streams", icon: Radio },
] as const;

export function ContentManagement({ accessToken }: { accessToken: string }) {
  const [activeType, setActiveType] = useState<AdminContentType>("reels");
  const [query, setQuery] = useState("");

  return (
    <div>
      <PageHeader title="Content Management" subtitle="View, edit, remove and restore app content" />

      <Panel className="mb-5">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A0A0A0]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search content..."
            className="bg-[#141414] border-white/10 text-white pl-9"
          />
        </div>
      </Panel>

      <Tabs value={activeType} onValueChange={(value) => setActiveType(value as AdminContentType)}>
        <TabsList className="bg-[#1A1A1A] border border-white/5">
          {contentTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value}>
                <Icon className="mr-2 size-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {contentTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <ContentTable accessToken={accessToken} type={tab.value} searchQuery={query} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ContentTable({
  accessToken,
  type,
  searchQuery,
}: {
  accessToken: string;
  type: AdminContentType;
  searchQuery: string;
}) {
  const contentQuery = useAdminContentQuery(accessToken, { type, q: searchQuery.trim() || undefined, limit: 50 });
  const updateMutation = useUpdateAdminContentMutation(accessToken);
  const removeMutation = useRemoveAdminContentMutation(accessToken);
  const restoreMutation = useRestoreAdminContentMutation(accessToken);
  const [editingItem, setEditingItem] = useState<AdminContentItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const items = contentQuery.data?.items ?? [];
  const isActionLoading = updateMutation.isPending || removeMutation.isPending || restoreMutation.isPending;

  const openEdit = (item: AdminContentItem) => {
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditDescription(item.description || "");
  };

  const saveEdit = async () => {
    if (!editingItem) return;

    try {
      setActionId(editingItem.id);
      await updateMutation.mutateAsync({
        type,
        id: editingItem.id,
        input: { title: editTitle.trim(), description: editDescription.trim() || null },
      });
      toast.success("Content updated");
      setEditingItem(null);
    } catch (error) {
      toast.error(handleApiError(error, "Content could not be updated."));
    } finally {
      setActionId(null);
    }
  };

  const removeItem = async (item: AdminContentItem) => {
    try {
      setActionId(item.id);
      await removeMutation.mutateAsync({ type, id: item.id });
      toast.success("Content removed");
    } catch (error) {
      toast.error(handleApiError(error, "Content could not be removed."));
    } finally {
      setActionId(null);
    }
  };

  const restoreItem = async (item: AdminContentItem) => {
    try {
      setActionId(item.id);
      await restoreMutation.mutateAsync({ type, id: item.id });
      toast.success("Content restored");
    } catch (error) {
      toast.error(handleApiError(error, "Content could not be restored."));
    } finally {
      setActionId(null);
    }
  };

  return (
    <>
      <Panel>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[#A0A0A0]">Content</TableHead>
              <TableHead className="text-[#A0A0A0]">Owner</TableHead>
              <TableHead className="text-[#A0A0A0]">Status</TableHead>
              <TableHead className="text-[#A0A0A0]">Created</TableHead>
              <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contentQuery.isLoading && (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={5} className="py-8 text-center text-[#A0A0A0]">
                  <Loader2 className="inline size-4 animate-spin text-[#84CC16]" /> Loading content...
                </TableCell>
              </TableRow>
            )}

            {!contentQuery.isLoading && items.length === 0 && (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={5} className="py-8 text-center text-[#A0A0A0]">
                  No content found.
                </TableCell>
              </TableRow>
            )}

            {items.map((item, index) => {
              const rowLoading = actionId === item.id && isActionLoading;
              return (
                <TableRow key={item.id} className={`border-white/5 hover:bg-white/5 ${index % 2 ? "bg-white/[0.02]" : ""}`}>
                  <TableCell className="text-white">
                    <div className="max-w-md">
                      <p className="truncate">{item.title}</p>
                      {item.description && <p className="text-xs text-[#A0A0A0] truncate">{item.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-[#A0A0A0]">{item.owner?.displayName || item.owner?.username || item.owner?.email || "Unknown"}</TableCell>
                  <TableCell><StatusPill status={formatStatus(item.status)} /></TableCell>
                  <TableCell className="text-[#A0A0A0]">{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="border-white/10 bg-transparent hover:bg-white/5" disabled={rowLoading} onClick={() => openEdit(item)}>
                        <Pencil className="mr-1 size-3.5" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#84CC16]/40 text-[#84CC16] bg-transparent hover:bg-[#84CC16]/10" disabled={rowLoading} onClick={() => restoreItem(item)}>
                        <RotateCcw className="mr-1 size-3.5" />
                        Restore
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500/40 text-red-400 bg-transparent hover:bg-red-500/10" disabled={rowLoading} onClick={() => removeItem(item)}>
                        {rowLoading ? <Loader2 className="mr-1 size-3.5 animate-spin" /> : <Trash2 className="mr-1 size-3.5" />}
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Panel>

      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">Update content title and description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#A0A0A0]">Title</label>
              <Input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="mt-1 bg-[#141414] border-white/10 text-white" />
            </div>
            <div>
              <label className="text-sm text-[#A0A0A0]">Description</label>
              <Textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={4} className="mt-1 bg-[#141414] border-white/10 text-white" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-white/10 bg-transparent hover:bg-white/5" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90" disabled={updateMutation.isPending} onClick={saveEdit}>
                {updateMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatStatus(status: string) {
  if (status === "active" || status === "ready" || status === "LIVE") return "Active";
  if (status === "deleted" || status === "DELETED" || status === "CANCELLED") return "Cancelled";
  if (status === "SUSPENDED" || status === "suspended") return "Suspended";
  if (status === "ENDED") return "Ended";
  if (status === "failed") return "Rejected";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

import { useState } from "react";
import { Edit3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { handleApiError } from "../api/client";
import type { AdminAnnouncement, AnnouncementAudience, AnnouncementPlacement, AnnouncementStatus } from "../api/announcements";
import {
  useAdminAnnouncementsQuery,
  useCreateAdminAnnouncementMutation,
  useDeleteAdminAnnouncementMutation,
  useUpdateAdminAnnouncementMutation,
} from "../api/announcements.query";
import type { AdminNotificationAudience, AdminNotificationHistoryItem } from "../api/notifications";
import {
  useAdminNotificationHistoryQuery,
  useAdminNotificationTemplatesQuery,
  useSendAdminNotificationMutation,
  useUpdateAdminNotificationMutation,
} from "../api/notifications.query";
import { PageHeader, Panel, StatusPill } from "../components/shared";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

export function Notifications({ accessToken }: { accessToken: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Notifications & Announcements" subtitle="Broadcast messages to your community" />

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList className="bg-[#141414] border border-white/10">
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <SendNotificationTab accessToken={accessToken} />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementsTab accessToken={accessToken} />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTab accessToken={accessToken} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SendNotificationTab({ accessToken }: { accessToken: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AdminNotificationAudience>("active_users");
  const [userId, setUserId] = useState("");
  const [notificationType, setNotificationType] = useState("system");
  const [deepLink, setDeepLink] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const sendNotification = useSendAdminNotificationMutation(accessToken);

  const validateSendForm = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required.");
      return false;
    }

    if (audience === "specific_user" && !userId.trim()) {
      toast.error("User id is required.");
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateSendForm()) return;

    if (audience !== "specific_user") {
      setConfirmSendOpen(true);
      return;
    }

    await submitSend();
  };

  const submitSend = async () => {
    try {
      const result = await sendNotification.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        audience,
        userId: audience === "specific_user" ? userId.trim() : undefined,
        notificationType,
        deepLink: deepLink.trim() || undefined,
        schedule,
        scheduledFor: schedule && scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      });
      const stats = [
        `${result.targetedUserCount} users`,
        result.targetedDeviceCount > 0 ? `${result.successCount}/${result.targetedDeviceCount} delivered` : null,
        result.failureCount > 0 ? `${result.failureCount} failed` : null,
      ].filter(Boolean).join(" · ");
      toast.success(`Notification sent — ${stats}`);
      setTitle("");
      setBody("");
      setUserId("");
      setDeepLink("");
      setSchedule(false);
      setScheduledFor("");
    } catch (error) {
      toast.error(handleApiError(error, "Notification could not be sent."));
    }
  };

  return (
    <div className="space-y-6">
      <Panel title="Send Notification">
        <div className="max-w-2xl space-y-4">
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Notification title" className="bg-[#141414] border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Message</Label>
            <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} placeholder="Write your message..." className="bg-[#141414] border-white/10 text-white" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Target Audience</Label>
              <Select value={audience} onValueChange={(value) => setAudience(value as AdminNotificationAudience)}>
                <SelectTrigger className="bg-[#141414] border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active_users">Active Users</SelectItem>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="specific_user">Specific User</SelectItem>
                  <SelectItem value="creators">Creators Only</SelectItem>
                  <SelectItem value="premium">Premium Users</SelectItem>
                  <SelectItem value="kids">Kids Mode Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Notification Type</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger className="bg-[#141414] border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="follow">Follow</SelectItem>
                  <SelectItem value="like">Like</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="chat_message">Chat Message</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {audience === "specific_user" && (
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">User ID</Label>
              <Input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Paste user id" className="bg-[#141414] border-white/10 text-white" />
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Deep Link / Action</Label>
            <Input value={deepLink} onChange={(event) => setDeepLink(event.target.value)} placeholder="/screens/user/userId or /menu/balance" className="bg-[#141414] border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Delivery</Label>
            <div className="flex items-center gap-3 h-9">
              <span className={`text-sm ${!schedule ? "text-white" : "text-[#A0A0A0]"}`}>Send Now</span>
              <Switch checked={schedule} onCheckedChange={setSchedule} />
              <span className={`text-sm ${schedule ? "text-white" : "text-[#A0A0A0]"}`}>Schedule</span>
            </div>
          </div>
          {schedule && (
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Schedule for</Label>
              <Input type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} className="bg-[#141414] border-white/10 text-white w-full sm:w-64" />
            </div>
          )}
          <Button className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90" onClick={handleSend} disabled={sendNotification.isPending}>
            {sendNotification.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Send Notification
          </Button>
        </div>
      </Panel>
      <HistoryTab accessToken={accessToken} />
      <ConfirmModal
        open={confirmSendOpen}
        onOpenChange={setConfirmSendOpen}
        title="Send Broadcast Notification"
        description={`Send this notification to ${formatSendAudience(audience)}? This action can reach many users.`}
        confirmText={sendNotification.isPending ? "Sending..." : "Send"}
        variant="destructive"
        onConfirm={() => {
          void submitSend();
        }}
      />
    </div>
  );
}

function AnnouncementsTab({ accessToken }: { accessToken: string }) {
  const [schedule, setSchedule] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudience>("all");
  const [placement, setPlacement] = useState<AnnouncementPlacement>("notification_tab");
  const [scheduledFor, setScheduledFor] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AdminAnnouncement | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<AdminAnnouncement | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    message: "",
    audience: "all" as AnnouncementAudience,
    placement: "notification_tab" as AnnouncementPlacement,
    startsAt: "",
    endsAt: "",
  });

  const announcementsQuery = useAdminAnnouncementsQuery(accessToken, { page: 1, limit: 50 });
  const createAnnouncement = useCreateAdminAnnouncementMutation(accessToken);
  const updateAnnouncement = useUpdateAdminAnnouncementMutation(accessToken);
  const deleteAnnouncement = useDeleteAdminAnnouncementMutation(accessToken);

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required.");
      return;
    }

    if (startsAt && endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      toast.error("End date must be after start date.");
      return;
    }

    try {
      await createAnnouncement.mutateAsync({
        title: title.trim(),
        message: message.trim(),
        audience,
        placement,
        schedule,
        scheduledFor: schedule && scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      });
      setTitle("");
      setMessage("");
      setAudience("all");
      setPlacement("notification_tab");
      setScheduledFor("");
      setStartsAt("");
      setEndsAt("");
      setSchedule(false);
      toast.success(schedule ? "Announcement scheduled" : "Announcement published");
    } catch (error) {
      toast.error(handleApiError(error, "Announcement could not be saved."));
    }
  };

  const handleStatusChange = async (announcementId: string, status: AnnouncementStatus) => {
    setActionId(announcementId);
    try {
      await updateAnnouncement.mutateAsync({ announcementId, input: { status } });
      toast.success("Announcement updated.");
    } catch (error) {
      toast.error(handleApiError(error, "Announcement could not be updated."));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (announcementId: string) => {
    setActionId(announcementId);
    try {
      await deleteAnnouncement.mutateAsync(announcementId);
      toast.success("Announcement deleted.");
    } catch (error) {
      toast.error(handleApiError(error, "Announcement could not be deleted."));
    } finally {
      setActionId(null);
    }
  };

  const openEdit = (announcement: AdminAnnouncement) => {
    setEditingAnnouncement(announcement);
    setEditForm({
      title: announcement.title,
      message: announcement.message,
      audience: announcement.audience,
      placement: announcement.placement,
      startsAt: toDateTimeLocal(announcement.startsAt),
      endsAt: toDateTimeLocal(announcement.endsAt),
    });
  };

  const handleEditSave = async () => {
    if (!editingAnnouncement) return;
    if (!editForm.title.trim() || !editForm.message.trim()) {
      toast.error("Title and body are required.");
      return;
    }

    if (editForm.startsAt && editForm.endsAt && new Date(editForm.endsAt).getTime() <= new Date(editForm.startsAt).getTime()) {
      toast.error("End date must be after start date.");
      return;
    }

    setActionId(editingAnnouncement.id);
    try {
      await updateAnnouncement.mutateAsync({
        announcementId: editingAnnouncement.id,
        input: {
          title: editForm.title.trim(),
          message: editForm.message.trim(),
          audience: editForm.audience,
          placement: editForm.placement,
          startsAt: editForm.startsAt ? new Date(editForm.startsAt).toISOString() : null,
          endsAt: editForm.endsAt ? new Date(editForm.endsAt).toISOString() : null,
        },
      });
      toast.success("Announcement updated.");
      setEditingAnnouncement(null);
    } catch (error) {
      toast.error(handleApiError(error, "Announcement could not be updated."));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Panel title="Create New Announcement">
        <div className="max-w-2xl space-y-4">
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Announcement title" className="bg-[#141414] border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#A0A0A0]">Body</Label>
            <Textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} placeholder="Write your announcement..." className="bg-[#141414] border-white/10 text-white" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Audience</Label>
              <Select value={audience} onValueChange={(value) => setAudience(value as AnnouncementAudience)}>
                <SelectTrigger className="bg-[#141414] border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="creators">Creators Only</SelectItem>
                  <SelectItem value="premium">Premium Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Placement</Label>
              <Select value={placement} onValueChange={(value) => setPlacement(value as AnnouncementPlacement)}>
                <SelectTrigger className="bg-[#141414] border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="notification_tab">Notification Tab</SelectItem>
                  <SelectItem value="inbox_notice">Message/Inbox Notice</SelectItem>
                  <SelectItem value="home_banner">Home Feed Banner</SelectItem>
                  <SelectItem value="profile_notice">Profile/Menu Notice</SelectItem>
                  <SelectItem value="live_notice">Live Screen Notice</SelectItem>
                  <SelectItem value="login_notice">Login / Register Notice</SelectItem>
                  <SelectItem value="maintenance">Maintenance Notice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Delivery</Label>
              <div className="flex items-center gap-3 h-9">
                <span className={`text-sm ${!schedule ? "text-white" : "text-[#A0A0A0]"}`}>Now</span>
                <Switch checked={schedule} onCheckedChange={setSchedule} />
                <span className={`text-sm ${schedule ? "text-white" : "text-[#A0A0A0]"}`}>Schedule</span>
              </div>
            </div>
          </div>
          {schedule && (
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Schedule for</Label>
              <Input type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} className="bg-[#141414] border-white/10 text-white w-full sm:w-64" />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Start date (optional)</Label>
              <Input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="bg-[#141414] border-white/10 text-white" />
              <p className="text-xs text-[#777]">Leave empty to start immediately.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">End date</Label>
              <Input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="bg-[#141414] border-white/10 text-white" />
              <p className="text-xs text-[#777]">Announcement expires automatically after this time.</p>
            </div>
          </div>
          <Button className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90" onClick={handleCreate} disabled={createAnnouncement.isPending}>
            {createAnnouncement.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create Announcement
          </Button>
        </div>
      </Panel>

      <Panel title="Past Announcements">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[#A0A0A0]">Title</TableHead>
              <TableHead className="text-[#A0A0A0]">Date</TableHead>
              <TableHead className="text-[#A0A0A0]">Audience</TableHead>
              <TableHead className="text-[#A0A0A0]">Status</TableHead>
              <TableHead className="text-[#A0A0A0]">Ends</TableHead>
              <TableHead className="text-right text-[#A0A0A0]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcementsQuery.isLoading ? (
              <LoadingRow colSpan={6} label="Loading announcements..." />
            ) : announcementsQuery.data?.items.length ? (
              announcementsQuery.data.items.map((announcement, index) => {
                const isBusy = actionId === announcement.id;
                return (
                  <TableRow key={announcement.id} className={`border-white/5 hover:bg-white/5 ${index % 2 ? "bg-white/[0.02]" : ""}`}>
                    <TableCell className="text-white">{announcement.title}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{formatDate(announcement.sentAt || announcement.scheduledFor || announcement.createdAt)}</TableCell>
                    <TableCell className="text-[#A0A0A0]">{formatAudience(announcement.audience)}</TableCell>
                    <TableCell><StatusPill status={formatStatus(announcement.status)} /></TableCell>
                    <TableCell className="text-[#A0A0A0]">{formatDate(announcement.endsAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="border-white/10 bg-transparent hover:bg-white/5" disabled={isBusy} onClick={() => openEdit(announcement)}>
                          <Edit3 className="size-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="border-white/10 bg-transparent hover:bg-white/5" disabled={isBusy || announcement.status === "expired"} onClick={() => handleStatusChange(announcement.id, announcement.status === "paused" ? "active" : "paused")}>
                          {isBusy ? <Loader2 className="size-4 animate-spin" /> : announcement.status === "paused" ? "Resume" : "Pause"}
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-500/40 text-red-400 hover:bg-red-500/10 bg-transparent" disabled={isBusy} onClick={() => setAnnouncementToDelete(announcement)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <EmptyRow colSpan={6} label="No announcements found." />
            )}
          </TableBody>
        </Table>
      </Panel>

      <Dialog open={!!editingAnnouncement} onOpenChange={(open) => !open && setEditingAnnouncement(null)}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Update the announcement content and placement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Title</Label>
              <Input value={editForm.title} onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))} className="bg-[#141414] border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Body</Label>
              <Textarea value={editForm.message} onChange={(event) => setEditForm((current) => ({ ...current, message: event.target.value }))} rows={4} className="bg-[#141414] border-white/10 text-white" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#A0A0A0]">Audience</Label>
                <Select value={editForm.audience} onValueChange={(value) => setEditForm((current) => ({ ...current, audience: value as AnnouncementAudience }))}>
                  <SelectTrigger className="bg-[#141414] border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="creators">Creators Only</SelectItem>
                    <SelectItem value="premium">Premium Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#A0A0A0]">Placement</Label>
                <Select value={editForm.placement} onValueChange={(value) => setEditForm((current) => ({ ...current, placement: value as AnnouncementPlacement }))}>
                  <SelectTrigger className="bg-[#141414] border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notification_tab">Notification Tab</SelectItem>
                    <SelectItem value="inbox_notice">Message/Inbox Notice</SelectItem>
                    <SelectItem value="home_banner">Home Feed Banner</SelectItem>
                    <SelectItem value="profile_notice">Profile/Menu Notice</SelectItem>
                    <SelectItem value="live_notice">Live Screen Notice</SelectItem>
                    <SelectItem value="login_notice">Login / Register Notice</SelectItem>
                    <SelectItem value="maintenance">Maintenance Notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#A0A0A0]">Start date (optional)</Label>
                <Input type="datetime-local" value={editForm.startsAt} onChange={(event) => setEditForm((current) => ({ ...current, startsAt: event.target.value }))} className="bg-[#141414] border-white/10 text-white" />
                <p className="text-xs text-[#777]">Leave empty to start immediately.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-[#A0A0A0]">End date</Label>
                <Input type="datetime-local" value={editForm.endsAt} onChange={(event) => setEditForm((current) => ({ ...current, endsAt: event.target.value }))} className="bg-[#141414] border-white/10 text-white" />
                <p className="text-xs text-[#777]">Announcement expires automatically after this time.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 bg-transparent hover:bg-white/5" onClick={() => setEditingAnnouncement(null)}>
              Cancel
            </Button>
            <Button className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90" disabled={updateAnnouncement.isPending} onClick={handleEditSave}>
              {updateAnnouncement.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmModal
        open={!!announcementToDelete}
        onOpenChange={(open) => !open && setAnnouncementToDelete(null)}
        title="Delete Announcement"
        description={`Delete ${announcementToDelete?.title || "this announcement"}? It will stop showing in the app.`}
        confirmText={actionId === announcementToDelete?.id ? "Deleting..." : "Delete"}
        variant="destructive"
        onConfirm={() => {
          if (announcementToDelete) {
            void handleDelete(announcementToDelete.id).then(() => setAnnouncementToDelete(null));
          }
        }}
      />
    </div>
  );
}

function HistoryTab({ accessToken }: { accessToken: string }) {
  const historyQuery = useAdminNotificationHistoryQuery(accessToken, { page: 1, limit: 50 });
  const updateNotification = useUpdateAdminNotificationMutation(accessToken);
  const [editingNotification, setEditingNotification] = useState<AdminNotificationHistoryItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    body: "",
    notificationType: "system",
    deepLink: "",
  });

  const openEdit = (item: AdminNotificationHistoryItem) => {
    setEditingNotification(item);
    setEditForm({
      title: item.title || "",
      body: item.body || "",
      notificationType: item.type || "system",
      deepLink: typeof item.data?.deepLink === "string" ? item.data.deepLink : "",
    });
  };

  const handleEditSave = async () => {
    if (!editingNotification) return;
    if (!editForm.title.trim() && !editForm.body.trim()) {
      toast.error("Title or message is required.");
      return;
    }

    try {
      await updateNotification.mutateAsync({
        notificationId: editingNotification.id,
        input: {
          title: editForm.title.trim() || undefined,
          body: editForm.body.trim() || undefined,
          notificationType: editForm.notificationType,
          deepLink: editForm.deepLink.trim() || null,
        },
      });
      toast.success("Notification updated.");
      setEditingNotification(null);
    } catch (error) {
      toast.error(handleApiError(error, "Notification could not be updated."));
    }
  };

  return (
    <>
      <Panel title="Notification History">
        <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[#A0A0A0]">Title</TableHead>
            <TableHead className="text-[#A0A0A0]">Recipient</TableHead>
            <TableHead className="text-[#A0A0A0]">Type</TableHead>
            <TableHead className="text-[#A0A0A0]">Delivery</TableHead>
            <TableHead className="text-[#A0A0A0]">Read</TableHead>
            <TableHead className="text-[#A0A0A0]">Date</TableHead>
            <TableHead className="text-right text-[#A0A0A0]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {historyQuery.isLoading ? (
            <LoadingRow colSpan={7} label="Loading notification history..." />
          ) : historyQuery.data?.items.length ? (
            historyQuery.data.items.map((item, index) => {
              const delivery = getDeliverySummary(item);
              return (
                <TableRow key={item.id} className={`border-white/5 hover:bg-white/5 ${index % 2 ? "bg-white/[0.02]" : ""}`}>
                  <TableCell className="text-white">{item.title || item.body || "Notification"}</TableCell>
                  <TableCell className="text-[#A0A0A0]">{item.recipient?.email || item.recipient?.name || "-"}</TableCell>
                  <TableCell className="text-[#A0A0A0]">{formatType(item.type)}</TableCell>
                  <TableCell className="text-[#A0A0A0]">{delivery}</TableCell>
                  <TableCell><StatusPill status={item.isRead ? "Read" : "Unread"} /></TableCell>
                  <TableCell className="text-[#A0A0A0]">{formatDate(item.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="border-white/10 bg-transparent hover:bg-white/5" onClick={() => openEdit(item)}>
                      <Edit3 className="size-4" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <EmptyRow colSpan={7} label="No notifications found." />
          )}
        </TableBody>
      </Table>
      </Panel>

      <Dialog open={!!editingNotification} onOpenChange={(open) => !open && setEditingNotification(null)}>
        <DialogContent className="bg-[#1A1A1A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">
              Update the in-app notification history content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Title</Label>
              <Input value={editForm.title} onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))} className="bg-[#141414] border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Message</Label>
              <Textarea value={editForm.body} onChange={(event) => setEditForm((current) => ({ ...current, body: event.target.value }))} rows={4} className="bg-[#141414] border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#A0A0A0]">Deep Link / Action</Label>
              <Input value={editForm.deepLink} onChange={(event) => setEditForm((current) => ({ ...current, deepLink: event.target.value }))} className="bg-[#141414] border-white/10 text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 bg-transparent hover:bg-white/5" onClick={() => setEditingNotification(null)}>
              Cancel
            </Button>
            <Button className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90" disabled={updateNotification.isPending} onClick={handleEditSave}>
              {updateNotification.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TemplatesTab({ accessToken }: { accessToken: string }) {
  const templatesQuery = useAdminNotificationTemplatesQuery(accessToken);

  return (
    <Panel title="Templates">
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-[#A0A0A0]">Template</TableHead>
            <TableHead className="text-[#A0A0A0]">Message</TableHead>
            <TableHead className="text-[#A0A0A0]">Deep Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templatesQuery.isLoading ? (
            <LoadingRow colSpan={3} label="Loading templates..." />
          ) : templatesQuery.data?.length ? (
            templatesQuery.data.map((template, index) => (
              <TableRow key={template.id} className={`border-white/5 hover:bg-white/5 ${index % 2 ? "bg-white/[0.02]" : ""}`}>
                <TableCell className="text-white">{template.title}</TableCell>
                <TableCell className="text-[#A0A0A0]">{template.body}</TableCell>
                <TableCell className="text-[#A0A0A0]">{template.deepLink || "-"}</TableCell>
              </TableRow>
            ))
          ) : (
            <EmptyRow colSpan={3} label="No templates found." />
          )}
        </TableBody>
      </Table>
    </Panel>
  );
}

function LoadingRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow className="border-white/5">
      <TableCell colSpan={colSpan} className="py-8 text-center text-[#A0A0A0]">
        <Loader2 className="mx-auto mb-2 size-5 animate-spin text-[#84CC16]" />
        {label}
      </TableCell>
    </TableRow>
  );
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow className="border-white/5">
      <TableCell colSpan={colSpan} className="py-8 text-center text-[#A0A0A0]">
        {label}
      </TableCell>
    </TableRow>
  );
}

function formatStatus(status: AnnouncementStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatAudience(audience: AnnouncementAudience) {
  if (audience === "all") return "All Users";
  if (audience === "creators") return "Creators Only";
  return "Premium Users";
}

function formatType(type: string) {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSendAudience(audience: AdminNotificationAudience) {
  if (audience === "all") return "all users";
  if (audience === "active_users") return "active users";
  if (audience === "creators") return "creators";
  if (audience === "premium") return "premium users";
  if (audience === "kids") return "kids mode users";
  return "the selected user";
}

function getDeliverySummary(item: AdminNotificationHistoryItem) {
  const delivery = item.data?.delivery;
  if (!delivery || typeof delivery !== "object") return "-";

  const summary = delivery as {
    targetedDeviceCount?: number;
    successCount?: number;
    failureCount?: number;
  };
  const devices = Number(summary.targetedDeviceCount || 0);
  const success = Number(summary.successCount || 0);
  const failed = Number(summary.failureCount || 0);

  if (devices <= 0) return "0 devices";
  return failed > 0 ? `${success}/${devices} sent, ${failed} failed` : `${success}/${devices} sent`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

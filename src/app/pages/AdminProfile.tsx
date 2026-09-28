import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Camera, Save, Upload } from "lucide-react";
import { updateAdminProfileWithPhoto, type AdminUser } from "../api/auth";
import { PageHeader, Panel } from "../components/shared";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

export function AdminProfile({
  accessToken,
  user,
  onUserUpdate,
}: {
  accessToken: string;
  user: AdminUser;
  onUserUpdate: (user: AdminUser) => void;
}) {
  const [displayName, setDisplayName] = useState(user.profile?.displayName || "");
  const [username, setUsername] = useState(user.profile?.username || "");
  const [bio, setBio] = useState(user.profile?.bio || "");
  const [photoUrl, setPhotoUrl] = useState(user.profile?.photoUrl || "");
  const [photoFile, setPhotoFile] = useState<File | undefined>();
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDisplayName(user.profile?.displayName || "");
    setUsername(user.profile?.username || "");
    setBio(user.profile?.bio || "");
    setPhotoUrl(user.profile?.photoUrl || "");
  }, [user]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  const nameForAvatar = displayName || username || user.email.split("@")[0] || "Admin";
  const initials = nameForAvatar
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const updatedUser = await updateAdminProfileWithPhoto(accessToken, {
        displayName,
        username,
        bio,
        photo: photoFile,
      });
      onUserUpdate(updatedUser);
      setPhotoFile(undefined);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Profile" subtitle="Update your admin account information" />

      <Panel>
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-[#141414] p-5">
            <Avatar className="size-24">
              <AvatarImage src={photoPreviewUrl || photoUrl} alt={nameForAvatar} />
              <AvatarFallback className="text-2xl">{initials || "AD"}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 text-sm text-[#A0A0A0]">
              <Camera className="size-4" />
              Profile photo
            </div>
            <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-transparent px-3 text-sm text-white transition-colors hover:bg-white/5">
              <Upload className="size-4" />
              Upload photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => setPhotoFile(event.target.files?.[0])}
              />
            </label>
            <p className="max-w-[170px] truncate text-center text-xs text-[#777]">
              {photoFile ? photoFile.name : "JPG, PNG or WEBP"}
            </p>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-[#D4D4D4]">Display name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="border-white/10 bg-[#141414] text-white hover:bg-[#141414] focus:bg-[#141414] focus-visible:bg-[#141414]"
                  placeholder="Admin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#D4D4D4]">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="border-white/10 bg-[#141414] text-white hover:bg-[#141414] focus:bg-[#141414] focus-visible:bg-[#141414]"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-[#D4D4D4]">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                className="min-h-28 border-white/10 bg-[#141414] text-white hover:bg-[#141414] focus:bg-[#141414] focus-visible:bg-[#141414]"
                placeholder="Write a short profile note..."
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving} className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90">
                <Save className="size-4" />
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </form>
      </Panel>
    </div>
  );
}

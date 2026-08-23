import { useMemo, useState } from "react";
import { MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminUsersQuery,
  useBanAdminUserMutation,
  useSuspendAdminUserMutation,
  useVerifyAdminUserMutation,
  useWarnAdminUserMutation,
} from "../api/adminUsers.query";
import type { AdminManagedUser } from "../api/adminUsers";
import { handleApiError } from "../api/client";
import { PageHeader, Panel, Pagination, StatusPill } from "../components/shared";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { formatNumber } from "../data";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export function UserManagement({ accessToken }: { accessToken: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selected, setSelected] = useState<AdminManagedUser | null>(null);

  const queryParams = useMemo(
    () => ({ q: query, status, page, limit: pageSize }),
    [page, pageSize, query, status],
  );
  const usersQuery = useAdminUsersQuery(accessToken, queryParams);
  const banMutation = useBanAdminUserMutation(accessToken);
  const suspendMutation = useSuspendAdminUserMutation(accessToken);
  const warnMutation = useWarnAdminUserMutation(accessToken);
  const verifyMutation = useVerifyAdminUserMutation(accessToken);
  const rows = usersQuery.data?.items ?? [];
  const totalPages = Math.max(1, usersQuery.data?.totalPages ?? 1);
  const isLoading = usersQuery.isLoading || usersQuery.isFetching;
  const isActionLoading =
    banMutation.isPending ||
    suspendMutation.isPending ||
    warnMutation.isPending ||
    verifyMutation.isPending;

  const handleUserAction = (
    action: {
      mutateAsync: (userId: string) => Promise<AdminManagedUser | void>;
    },
    successMessage: string,
  ) => {
    if (!selected || isActionLoading) return;

    action
      .mutateAsync(selected.id)
      .then((result) => {
        if (result) {
          setSelected(result);
        }

        toast.success(successMessage);
      })
      .catch((error) => {
        toast.error(handleApiError(error, "Action failed."));
      });
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage all registered users across the platform"
        actions={
          <>
            <div className="flex items-center gap-2 bg-[#1A1A1A] border border-white/10 rounded-lg px-3 h-9 w-56">
              <Search className="size-4 text-[#A0A0A0]" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search users..."
                className="bg-transparent outline-none text-sm text-white placeholder:text-[#A0A0A0] w-full"
              />
            </div>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36 bg-[#1A1A1A] border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-28 bg-[#1A1A1A] border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <Panel>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[#A0A0A0]">User</TableHead>
              <TableHead className="text-[#A0A0A0]">Email</TableHead>
              <TableHead className="text-[#A0A0A0]">Join Date</TableHead>
              <TableHead className="text-[#A0A0A0]">Status</TableHead>
              <TableHead className="text-[#A0A0A0]">Followers</TableHead>
              <TableHead className="text-[#A0A0A0] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={6} className="text-center text-[#A0A0A0] py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={6} className="text-center text-[#A0A0A0] py-8">
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {rows.map((u, i) => (
              <TableRow
                key={u.id}
                onClick={() => setSelected(u)}
                className={`border-white/5 cursor-pointer hover:bg-white/5 ${i % 2 ? "bg-white/[0.02]" : ""}`}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={u.avatar} alt={u.username} />
                      <AvatarFallback>{u.username[1]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-white">{u.username}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[#A0A0A0]">{u.email}</TableCell>
                <TableCell className="text-[#A0A0A0]">{u.joinDate}</TableCell>
                <TableCell>
                  <StatusPill status={u.status} />
                </TableCell>
                <TableCell className="text-white">{formatNumber(u.followers)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="size-8 text-[#A0A0A0] hover:text-white" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination page={page} total={totalPages} onChange={setPage} />
      </Panel>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="bg-[#1A1A1A] border-white/10 text-white w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-white">User Details</SheetTitle>
                <SheetDescription className="text-[#A0A0A0]">Review profile and take action</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6 space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarImage src={selected.avatar} alt={selected.username} />
                    <AvatarFallback>{selected.username[1]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white text-lg">{selected.username}</p>
                    <p className="text-[#A0A0A0] text-sm">{selected.email}</p>
                    <div className="mt-1">
                      <StatusPill status={selected.status} />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#A0A0A0]">{selected.bio}</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: "Followers", v: formatNumber(selected.followers) },
                    { l: "Videos", v: selected.videos },
                    { l: "Reports", v: selected.reports },
                  ].map((s) => (
                    <div key={s.l} className="rounded-lg bg-white/5 p-3 text-center">
                      <p className="text-white text-lg font-semibold">{s.v}</p>
                      <p className="text-[#A0A0A0] text-xs">{s.l}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10 bg-transparent"
                    disabled={isActionLoading}
                    onClick={() => handleUserAction(banMutation, "User banned successfully.")}
                  >
                    Ban User
                  </Button>
                  <Button
                    variant="outline"
                    className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 bg-transparent"
                    disabled={isActionLoading}
                    onClick={() => handleUserAction(suspendMutation, "User suspended successfully.")}
                  >
                    Suspend User
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/15 text-white hover:bg-white/5 bg-transparent"
                    disabled={isActionLoading}
                    onClick={() => handleUserAction(warnMutation, "Warning sent successfully.")}
                  >
                    Send Warning
                  </Button>
                  <Button
                    className="bg-[#84CC16] text-black hover:bg-[#84CC16]/90"
                    disabled={isActionLoading}
                    onClick={() => handleUserAction(verifyMutation, "User verified successfully.")}
                  >
                    Verify Account
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

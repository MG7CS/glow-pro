import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";
import { Loader2, Phone, User } from "lucide-react";
import { toast } from "sonner";

import { listAppointments } from "@/graphql/queries";
import { updateAppointment } from "@/graphql/mutations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AppointmentRow = {
  id: string;
  shopID: string;
  customerName: string;
  customerPhone: string;
  service: string;
  date: string;
  time: string;
  status: string;
  notes?: string | null;
};

let _client: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_client ??= generateClient());

async function fetchAppointmentsForShop(shopId: string): Promise<AppointmentRow[]> {
  const client = getClient();
  const items: AppointmentRow[] = [];
  let nextToken: string | null | undefined;

  do {
    const res = await client.graphql({
      query: listAppointments,
      variables: {
        filter: { shopID: { eq: shopId } },
        limit: 100,
        ...(nextToken ? { nextToken } : {}),
      },
      authMode: "userPool",
    });
    const conn = (res as { data?: { listAppointments?: { items?: AppointmentRow[]; nextToken?: string | null } } })
      .data?.listAppointments;
    for (const row of conn?.items ?? []) {
      if (row?.id) items.push(row);
    }
    nextToken = conn?.nextToken ?? null;
  } while (nextToken);

  items.sort((a, b) => {
    const da = a.date.localeCompare(b.date);
    if (da !== 0) return da;
    return a.time.localeCompare(b.time);
  });
  return items;
}

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "pending") return "border-amber-300 bg-amber-50 text-amber-900";
  if (s === "confirmed") return "border-emerald-300 bg-emerald-50 text-emerald-900";
  if (s === "cancelled") return "border-red-300 bg-red-50 text-red-900";
  return "border-border bg-muted text-foreground";
}

interface Props {
  shopId?: string;
}

const DashboardBookings = ({ shopId }: Props) => {
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading, isError, error } = useQuery({
    queryKey: ["appointments", "shop", shopId],
    queryFn: () => fetchAppointmentsForShop(shopId!),
    enabled: !!shopId,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const client = getClient();
      await client.graphql({
        query: updateAppointment,
        variables: {
          input: { id, status },
        },
        authMode: "userPool",
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appointments", "shop", shopId] });
      toast.success("Booking updated");
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Could not update booking";
      toast.error(msg);
    },
  });

  if (!shopId) {
    return (
      <p className="text-sm text-muted-foreground">
        Save your listing first so we can load bookings for your shop.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Could not load bookings."}
      </p>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center text-muted-foreground">
        No bookings yet
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {appointments.map((a) => {
        const st = a.status.toLowerCase();
        const terminal = st === "confirmed" || st === "cancelled";
        return (
          <Card key={a.id} className="border-border/80 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{a.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <a href={`tel:${a.customerPhone}`} className="hover:text-foreground hover:underline">
                      {a.customerPhone}
                    </a>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn("shrink-0 capitalize border", statusBadgeClass(a.status))}
                >
                  {a.status}
                </Badge>
              </div>

              <p className="text-sm text-foreground">
                <span className="font-medium">{a.service}</span>
                <span className="text-muted-foreground"> · </span>
                <span>{a.date}</span>
                <span className="text-muted-foreground"> · </span>
                <span>{a.time}</span>
              </p>

              {a.notes ? (
                <p className="text-xs text-muted-foreground border-t border-border pt-3">{a.notes}</p>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={terminal || updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: a.id, status: "confirmed" })}
                >
                  Confirm
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={st === "cancelled" || updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: a.id, status: "cancelled" })}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardBookings;

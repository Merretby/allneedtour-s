import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api/client";
import { orderStatusLabel } from "@/lib/format";
import { notifyIfPageHidden } from "@/lib/push";

interface OrderStatusPayload {
  orderId: string;
  status: string;
  actorId?: string | null;
}

interface NewOrderPayload {
  orderId: string;
  total: number;
  userId: string;
}

/**
 * Keeps an authenticated server-sent-events connection open so order
 * changes reach the browser immediately (without waiting for a refetch).
 *
 * Reconnects automatically with exponential backoff if the API restarts.
 */
export function useNotificationStream(): void {
  const { isAuthenticated, token, user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let disposed = false;
    let retry = 0;
    let controller: AbortController | null = null;
    let reconnectTimer: number | undefined;

    const handleFrame = (frame: string) => {
      let event = "message";
      const dataLines: string[] = [];

      for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) {
          event = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trim());
        }
      }

      if (dataLines.length === 0) return;

      let payload: unknown;

      try {
        payload = JSON.parse(dataLines.join("\n"));
      } catch {
        return;
      }

      if (event === "order_status") {
        const data = payload as OrderStatusPayload;
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });

        if (data.actorId !== user?.id) {
          const body = `Nouveau statut : ${orderStatusLabel(data.status)}`;
          toast.info("Commande mise à jour", { description: body });
          void notifyIfPageHidden("Commande mise à jour", {
            body,
            data: { url: "/orders" },
            tag: `order-${data.orderId}`,
          });
        }
        return;
      }

      if (event === "new_order") {
        const data = payload as NewOrderPayload;
        queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });

        if (user?.role === "admin") {
          const body = `Commande #${data.orderId.slice(0, 8)} — ${Number(
            data.total
          ).toFixed(2)} Dhs`;
          toast.success("Nouvelle commande", { description: body });
          void notifyIfPageHidden("Nouvelle commande", {
            body,
            data: { url: "/admin" },
            tag: `new-order-${data.orderId}`,
          });
        }
      }
    };

    const connect = async () => {
      if (disposed) return;

      controller = new AbortController();

      try {
        const response = await fetch(`${API_BASE_URL}/notifications/stream`, {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok || !response.body) {
          throw new Error(`Notification stream failed (${response.status})`);
        }

        retry = 0;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!disposed) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let boundary = buffer.indexOf("\n\n");
          while (boundary !== -1) {
            const frame = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            handleFrame(frame);
            boundary = buffer.indexOf("\n\n");
          }
        }
      } catch (error) {
        if (disposed || (error as Error).name === "AbortError") return;
      }

      if (!disposed) {
        const delay = Math.min(30_000, 1_000 * 2 ** retry);
        retry += 1;
        reconnectTimer = window.setTimeout(connect, delay);
      }
    };

    void connect();

    return () => {
      disposed = true;
      controller?.abort();
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
    };
  }, [isAuthenticated, token, user?.id, user?.role, queryClient]);
}

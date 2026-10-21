import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Send } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { notificationsApi } from "@/lib/api/endpoints";
import {
  disablePush,
  enablePush,
  ensureSubscription,
  getPushState,
  type PushState,
} from "@/lib/push";

type State = PushState | "loading";

const LABELS: Record<State, string> = {
  loading: "Notifications…",
  unsupported: "Notifications non supportées",
  default: "Activer les notifications",
  denied: "Notifications bloquées",
  granted: "Activer les notifications",
  subscribed: "Notifications activées",
};

const NotificationToggle = () => {
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    (async () => {
      const current = await getPushState();
      if (cancelled) return;
      setState(current);

      // Permission already granted (e.g. previous session): make sure the
      // current subscription is stored for this account.
      if (current === "granted") {
        const subscribed = await ensureSubscription().catch(() => false);
        if (!cancelled && subscribed) setState("subscribed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated) return null;

  const toggle = async () => {
    if (busy) return;

    if (state === "denied") {
      toast.error(
        "Notifications bloquées. Autorisez-les dans les réglages du navigateur."
      );
      return;
    }

    if (state === "unsupported") {
      toast.error("Ce navigateur ne supporte pas les notifications.");
      return;
    }

    setBusy(true);

    try {
      if (state === "subscribed") {
        await disablePush();
        setState(await getPushState());
        toast.success("Notifications désactivées");
      } else {
        await enablePush();
        setState("subscribed");
        toast.success("Notifications activées");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de configurer les notifications"
      );
      setState(await getPushState());
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    try {
      const result = await notificationsApi.test();
      if (result.sent > 0) {
        toast.success("Notification de test envoyée");
      } else {
        toast.error("Aucune notification envoyée. Vérifiez les autorisations.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Échec de l'envoi du test"
      );
    }
  };

  const Icon =
    state === "subscribed" ? BellRing : state === "denied" ? BellOff : Bell;

  return (
    <>
      <DropdownMenuItem
        className="cursor-pointer py-2"
        disabled={state === "loading" || state === "unsupported" || busy}
        onSelect={(event) => {
          event.preventDefault();
          void toggle();
        }}
      >
        <Icon className="mr-2 h-4 w-4" />
        <span>{LABELS[state]}</span>
      </DropdownMenuItem>

      {state === "subscribed" && (
        <DropdownMenuItem
          className="cursor-pointer py-2"
          onSelect={(event) => {
            event.preventDefault();
            void sendTest();
          }}
        >
          <Send className="mr-2 h-4 w-4" />
          <span>Tester les notifications</span>
        </DropdownMenuItem>
      )}
    </>
  );
};

export default NotificationToggle;

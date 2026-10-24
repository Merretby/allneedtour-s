import { notificationsApi } from "@/lib/api/endpoints";

export type PushState =
  | "unsupported"
  | "default"
  | "denied"
  | "granted"
  | "subscribed";

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }

  return output;
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;

  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

export async function getPushState(): Promise<PushState> {
  if (!isPushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission === "default") return "default";

  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();

  return subscription ? "subscribed" : "granted";
}

export async function ensureSubscription(): Promise<boolean> {
  if (!isPushSupported() || Notification.permission !== "granted") {
    return false;
  }

  const registration = await getRegistration();
  if (!registration) return false;

  const { publicKey } = await notificationsApi.publicKey();
  if (!publicKey) return false;

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    } catch (error) {
      console.error("[push] Subscription failed", {
        error,
        permission: Notification.permission,
        secureContext: window.isSecureContext,
        embedded: window.self !== window.top,
      });

      const name = error instanceof DOMException ? error.name : "";

      throw new Error(
        name === "AbortError"
          ? "Le navigateur n'a pas pu joindre son service de notifications push. Essayez Chrome ou Edge, quittez le mode privé, et vérifiez que le push n'est pas désactivé (Brave : activez « Utiliser les services Google pour la messagerie push »)."
          : "Impossible de créer l'abonnement aux notifications."
      );
    }
  }

  await notificationsApi.subscribe(subscription.toJSON());
  return true;
}

async function hasPushSubscription(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration("/");
    const subscription = await registration?.pushManager.getSubscription();
    return Boolean(subscription);
  } catch {
    return false;
  }
}

async function showLocalNotification(
  title: string,
  options: NotificationOptions & { data?: { url?: string } }
): Promise<void> {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration("/");

    if (registration) {
      await registration.showNotification(title, {
        icon: "/logo.png",
        badge: "/favicon.ico",
        ...options,
      });
    } else {
      new Notification(title, { icon: "/logo.png", ...options });
    }
  } catch {
    // Local notifications are best-effort.
  }
}

/**
 * Fallback for browsers whose push service is unavailable: while the page is
 * open but hidden (another tab), show a desktop notification through the
 * service worker. Skipped when a real push subscription exists, to avoid
 * duplicate notifications.
 */
export async function notifyIfPageHidden(
  title: string,
  options: NotificationOptions & { data?: { url?: string } }
): Promise<void> {
  if (typeof document === "undefined" || document.visibilityState === "visible") {
    return;
  }

  if (await hasPushSubscription()) return;

  await showLocalNotification(title, options);
}

export async function enablePush(): Promise<void> {
  if (!isPushSupported()) {
    throw new Error("Les notifications ne sont pas supportées par ce navigateur.");
  }

  if (!window.isSecureContext) {
    throw new Error(
      "Les notifications nécessitent HTTPS (ou localhost). Ouvrez l'application via une adresse sécurisée."
    );
  }

  if (window.self !== window.top) {
    throw new Error(
      "Ouvrez l'application dans un onglet dédié (pas dans un aperçu intégré) pour activer les notifications."
    );
  }

  if (Notification.permission === "denied") {
    throw new Error(
      "Les notifications sont bloquées. Autorisez-les dans les réglages du navigateur."
    );
  }

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Vous devez autoriser les notifications pour les recevoir.");
  }

  const subscribed = await ensureSubscription();

  if (!subscribed) {
    throw new Error("Impossible d'activer les notifications (configuration serveur manquante).");
  }
}

export async function disablePush(): Promise<void> {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();

  if (!subscription) return;

  await notificationsApi.unsubscribe(subscription.endpoint).catch(() => {});
  await subscription.unsubscribe();
}

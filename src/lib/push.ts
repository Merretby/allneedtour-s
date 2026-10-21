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
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await notificationsApi.subscribe(subscription.toJSON());
  return true;
}

export async function enablePush(): Promise<void> {
  if (!isPushSupported()) {
    throw new Error("Les notifications ne sont pas supportées par ce navigateur.");
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

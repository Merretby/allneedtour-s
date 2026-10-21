import { useEffect, useState } from "react";
import { Check, CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useBlackFridayAdmin,
  useRemoveBlackFridayProduct,
  useSetBlackFridayProduct,
  useUpdateBlackFriday,
} from "@/lib/api/hooks";
import { formatPrice, resolveImageUrl, toNumber } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

interface RowDraft {
  included: boolean;
  price: string;
}

const errorMessage = (error: unknown) => {
  if (error instanceof ApiError && Array.isArray(error.details)) {
    const fields = error.details
      .map((detail) =>
        detail && typeof detail === "object" && "path" in detail
          ? (detail as { path?: unknown }).path
          : null
      )
      .flatMap((path) => (Array.isArray(path) ? [path.join(".")] : []));
    if (fields.length > 0) return `${error.message} : ${fields.join(", ")}`;
  }
  return error instanceof Error ? error.message : "Une erreur est survenue";
};

const pad = (value: number) => String(value).padStart(2, "0");

const toLocalInput = (value: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

const toIsoOrNull = (value: string): string | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const statusLabel = (isActive: boolean, active: boolean, startsAt: string, endsAt: string) => {
  if (active) return { label: "Active", className: "bg-green-500 text-white hover:bg-green-500" };
  if (!isActive) return { label: "Désactivée", className: "bg-muted text-muted-foreground" };

  const now = Date.now();
  const start = startsAt ? new Date(startsAt).getTime() : null;
  const end = endsAt ? new Date(endsAt).getTime() : null;

  if (start && now < start) {
    return { label: "Planifiée", className: "bg-blue-500 text-white hover:bg-blue-500" };
  }
  if (end && now >= end) {
    return { label: "Terminée", className: "bg-orange-500 text-white hover:bg-orange-500" };
  }
  return { label: "Inactive", className: "bg-muted text-muted-foreground" };
};

const BlackFridayPanel = () => {
  const { data, isLoading, isError, error } = useBlackFridayAdmin();
  const updateCampaign = useUpdateBlackFriday();
  const setProduct = useSetBlackFridayProduct();
  const removeProduct = useRemoveBlackFridayProduct();

  const [isActive, setIsActive] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});

  useEffect(() => {
    if (!data) return;

    setIsActive(data.campaign.is_active);
    setStartsAt(toLocalInput(data.campaign.starts_at));
    setEndsAt(toLocalInput(data.campaign.ends_at));

    const next: Record<string, RowDraft> = {};
    data.products.forEach((product) => {
      next[product.id] = {
        included: Boolean(product.included),
        price:
          product.black_friday_price != null ? String(product.black_friday_price) : "",
      };
    });
    setDrafts(next);
  }, [data]);

  const campaign = data?.campaign;
  const products = data?.products ?? [];
  const status = statusLabel(
    isActive,
    Boolean(campaign?.active),
    startsAt,
    endsAt
  );

  const saveCampaign = () => {
    if (startsAt && endsAt && new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
      toast.error("La date de fin doit être après la date de début");
      return;
    }

    updateCampaign.mutate(
      {
        is_active: isActive,
        starts_at: toIsoOrNull(startsAt),
        ends_at: toIsoOrNull(endsAt),
      },
      {
        onSuccess: () => toast.success("Campagne Black Friday mise à jour"),
        onError: (mutationError) => toast.error(errorMessage(mutationError)),
      }
    );
  };

  const updateDraft = (productId: string, patch: Partial<RowDraft>) => {
    setDrafts((current) => ({
      ...current,
      [productId]: { ...current[productId], ...patch },
    }));
  };

  const saveRow = (productId: string, basePrice: number, isIncluded: boolean) => {
    const draft = drafts[productId];
    if (!draft) return;

    if (!draft.included) {
      if (!isIncluded) {
        toast.info("Ce produit n'est pas dans la campagne");
        return;
      }
      removeProduct.mutate(productId, {
        onSuccess: () => toast.success("Produit retiré du Black Friday"),
        onError: (mutationError) => toast.error(errorMessage(mutationError)),
      });
      return;
    }

    const price = Number(draft.price);
    if (
      draft.price.trim() === "" ||
      !Number.isFinite(price) ||
      price <= 0 ||
      price >= basePrice
    ) {
      toast.error("Le prix Black Friday doit être inférieur au prix normal");
      return;
    }

    setProduct.mutate(
      { productId, promoPrice: price },
      {
        onSuccess: () => toast.success("Prix Black Friday enregistré"),
        onError: (mutationError) => toast.error(errorMessage(mutationError)),
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Campagne Black Friday
            <Badge className={status.className}>{status.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 p-4">
            <div className="space-y-1">
              <Label htmlFor="bf-enabled">Campagne activée</Label>
              <p className="text-xs text-muted-foreground">
                Les prix s'appliquent automatiquement entre la date de début et de fin.
              </p>
            </div>
            <Switch
              id="bf-enabled"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={updateCampaign.isPending}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bf-start">Début</Label>
              <Input
                id="bf-start"
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bf-end">Fin</Label>
              <Input
                id="bf-end"
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </div>
          </div>

          <Button onClick={saveCampaign} disabled={updateCampaign.isPending}>
            {updateCampaign.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Enregistrer la campagne
          </Button>
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Prix normal</TableHead>
              <TableHead>Dans la campagne</TableHead>
              <TableHead>Prix Black Friday</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Chargement…
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive">
                  {errorMessage(error)}
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Aucun produit.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const draft = drafts[product.id] ?? {
                  included: Boolean(product.included),
                  price:
                    product.black_friday_price != null
                      ? String(product.black_friday_price)
                      : "",
                };
                const basePrice = toNumber(product.price);
                const rowPending =
                  (setProduct.isPending && setProduct.variables?.productId === product.id) ||
                  (removeProduct.isPending && removeProduct.variables === product.id);

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveImageUrl(product.image_url)}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(basePrice)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={draft.included}
                        onCheckedChange={(checked) =>
                          updateDraft(product.id, { included: checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-32"
                        value={draft.price}
                        disabled={!draft.included}
                        onChange={(event) =>
                          updateDraft(product.id, { price: event.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={rowPending}
                        onClick={() => saveRow(product.id, basePrice, Boolean(product.included))}
                      >
                        Enregistrer
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BlackFridayPanel;

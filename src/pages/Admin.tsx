import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Boxes,
  Check,
  Package,
  Pencil,
  ShoppingCart,
  Trash2,
  Users,
  X,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  useAdminProducts,
  useAdminUsers,
  useAllOrders,
  useCreateProduct,
  useDeleteProduct,
  useDeleteUser,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "@/lib/api/hooks";
import type {
  Order,
  OrderStatus,
  Product,
  ProductInput,
} from "@/lib/api/types";
import {
  formatDate,
  formatPrice,
  orderStatusLabel,
  resolveImageUrl,
  toNumber,
} from "@/lib/format";

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "on_livraison", label: "En cours de livraison" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];

const statusClasses: Record<string, string> = {
  pending: "bg-blue-500 text-white hover:bg-blue-500",
  confirmed: "bg-indigo-500 text-white hover:bg-indigo-500",
  shipped: "bg-orange-500 text-white hover:bg-orange-500",
  on_livraison: "bg-orange-500 text-white hover:bg-orange-500",
  delivered: "bg-green-500 text-white hover:bg-green-500",
  cancelled: "bg-red-500 text-white hover:bg-red-500",
};

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  brand: string;
  image_url: string;
  compare_at_price: string;
}

const EMPTY_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  brand: "",
  image_url: "",
  compare_at_price: "",
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Une erreur est survenue";

const Admin = () => {
  const { user } = useAuth();

  const ordersQuery = useAllOrders();
  const productsQuery = useAdminProducts();
  const usersQuery = useAdminUsers();

  const updateStatus = useUpdateOrderStatus();
  const createProduct = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const deleteUser = useDeleteUser();

  const orders = ordersQuery.data?.data ?? [];
  const products = productsQuery.data?.data ?? [];
  const users = usersQuery.data?.data ?? [];

  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [tab, setTab] = useState("orders");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<OrderStatus | "">("");

  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") {
      list = list.filter((order) => order.status === statusFilter);
    }
    if (clientFilter) {
      list = list.filter((order) => order.user_id === clientFilter);
    }
    return list;
  }, [orders, statusFilter, clientFilter]);

  const filteredClient = users.find((client) => client.id === clientFilter) ?? null;

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

  const revenue = useMemo(
    () =>
      orders
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + toNumber(order.total), 0),
    [orders]
  );

  const openOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setDraftStatus(order.status);
  };

  const saveStatus = () => {
    if (!selectedOrder || !draftStatus) return;
    updateStatus.mutate(
      { id: selectedOrder.id, status: draftStatus },
      {
        onSuccess: () => {
          toast.success("Statut de la commande mis à jour");
          setDraftStatus(draftStatus);
        },
        onError: (error) => toast.error(errorMessage(error)),
      }
    );
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(toNumber(product.price)),
      stock: String(product.stock),
      category: product.category ?? "",
      brand: product.brand ?? "",
      image_url: product.image_url ?? "",
      compare_at_price:
        product.compare_at_price != null ? String(product.compare_at_price) : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitProduct = (event: FormEvent) => {
    event.preventDefault();

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.category.trim() ||
      form.price.trim() === "" ||
      form.stock.trim() === "" ||
      !Number.isFinite(price) ||
      !Number.isFinite(stock)
    ) {
      toast.error("Veuillez remplir correctement les champs obligatoires");
      return;
    }

    const payload: ProductInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stock,
      category: form.category.trim(),
    };
    if (form.brand.trim()) payload.brand = form.brand.trim();
    if (form.image_url.trim()) payload.image_url = form.image_url.trim();
    if (form.compare_at_price.trim()) {
      const compare = Number(form.compare_at_price);
      if (Number.isFinite(compare)) payload.compare_at_price = compare;
    }

    const onSuccess = () => {
      toast.success(editingId ? "Produit mis à jour" : "Produit ajouté");
      resetForm();
    };
    const onError = (error: unknown) => toast.error(errorMessage(error));

    if (editingId) {
      updateProductMutation.mutate(
        { id: editingId, input: payload },
        { onSuccess, onError }
      );
    } else {
      createProduct.mutate(payload, { onSuccess, onError });
    }
  };

  const removeProduct = (product: Product) => {
    if (!window.confirm(`Supprimer le produit « ${product.name} » ?`)) return;
    deleteProduct.mutate(product.id, {
      onSuccess: () => toast.success("Produit supprimé"),
      onError: (error) => toast.error(errorMessage(error)),
    });
  };

  const removeUser = (id: string, label: string) => {
    if (!window.confirm(`Supprimer le compte de ${label} ?`)) return;
    deleteUser.mutate(id, {
      onSuccess: () => toast.success("Client supprimé"),
      onError: (error) => toast.error(errorMessage(error)),
    });
  };

  const isSavingProduct = createProduct.isPending || updateProductMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Tableau de bord admin
          </h1>
          <p className="text-muted-foreground mt-1">
            Connecté en tant que {user?.name || user?.email || "administrateur"}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Commandes
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{orders.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chiffre d'affaires
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatPrice(revenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Produits
              </CardTitle>
              <Boxes className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{products.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
          </TabsList>

          {/* ------------------------------ Commandes ------------------------------ */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
              >
                Toutes ({orders.length})
              </Button>
              {STATUSES.map((status) => (
                <Button
                  key={status.value}
                  size="sm"
                  variant={statusFilter === status.value ? "default" : "outline"}
                  onClick={() => setStatusFilter(status.value)}
                >
                  {status.label} (
                  {orders.filter((order) => order.status === status.value).length})
                </Button>
              ))}
            </div>

            {filteredClient && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-4 py-2 text-sm">
                <span>
                  Commandes de{" "}
                  <strong>{filteredClient.name || filteredClient.email}</strong>
                </span>
                <Button size="sm" variant="ghost" onClick={() => setClientFilter(null)}>
                  Effacer le filtre
                </Button>
              </div>
            )}

            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Chargement…
                      </TableCell>
                    </TableRow>
                  ) : ordersQuery.isError ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-destructive">
                        Impossible de charger les commandes.
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Aucune commande.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>{formatPrice(order.total)}</TableCell>
                        <TableCell>
                          <Badge className={statusClasses[order.status] ?? ""}>
                            {orderStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => openOrder(order)}>
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {selectedOrder && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-4">
                    <span>Commande #{selectedOrder.id.slice(0, 8)}</span>
                    <Badge className={statusClasses[selectedOrder.status] ?? ""}>
                      {orderStatusLabel(selectedOrder.status)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="space-y-2">
                      <Label>Changer le statut</Label>
                      <Select
                        value={draftStatus}
                        onValueChange={(value) => setDraftStatus(value as OrderStatus)}
                      >
                        <SelectTrigger className="w-56">
                          <SelectValue placeholder="Choisir un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={saveStatus}
                      disabled={
                        !draftStatus ||
                        draftStatus === selectedOrder.status ||
                        updateStatus.isPending
                      }
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mettre à jour
                    </Button>
                    <Button variant="ghost" onClick={() => setSelectedOrderId(null)}>
                      Fermer
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {selectedOrder.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucun article.</p>
                    ) : (
                      selectedOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0"
                        >
                          <img
                            src={resolveImageUrl(item.product?.image_url)}
                            alt={item.product?.name ?? "Produit"}
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {item.product?.name ?? "Produit"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-foreground">
                            {formatPrice(toNumber(item.price) * item.quantity)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex justify-between border-t pt-4 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ------------------------------- Produits ------------------------------ */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingId ? "Modifier le produit" : "Ajouter un produit"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="product-name">Nom *</Label>
                    <Input
                      id="product-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Crème hydratante"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="product-description">Description *</Label>
                    <Textarea
                      id="product-description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Description du produit"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Prix (Dhs) *</Label>
                    <Input
                      id="product-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-stock">Stock *</Label>
                    <Input
                      id="product-stock"
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-category">Catégorie *</Label>
                    <Input
                      id="product-category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="skincare"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-brand">Marque</Label>
                    <Input
                      id="product-brand"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="product-image">Image (URL)</Label>
                    <Input
                      id="product-image"
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      placeholder="https://exemple.com/image.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-compare">Prix barré (Dhs)</Label>
                    <Input
                      id="product-compare"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.compare_at_price}
                      onChange={(e) =>
                        setForm({ ...form, compare_at_price: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button type="submit" disabled={isSavingProduct}>
                      <Check className="h-4 w-4 mr-2" />
                      {editingId ? "Enregistrer" : "Ajouter"}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="ghost" onClick={resetForm}>
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Chargement…
                      </TableCell>
                    </TableRow>
                  ) : productsQuery.isError ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-destructive">
                        Impossible de charger les produits.
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Aucun produit.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
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
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => startEdit(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => removeProduct(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* -------------------------------- Clients ------------------------------ */}
          <TabsContent value="clients">
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Inscrit le</TableHead>
                    <TableHead>Commandes</TableHead>
                    <TableHead>Total dépensé</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Chargement…
                      </TableCell>
                    </TableRow>
                  ) : usersQuery.isError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-destructive">
                        Impossible de charger les clients.
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Aucun client.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((client) => {
                      const clientOrders = orders.filter(
                        (order) => order.user_id === client.id
                      );
                      const spent = clientOrders
                        .filter((order) => order.status !== "cancelled")
                        .reduce((sum, order) => sum + toNumber(order.total), 0);
                      return (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">
                            {client.name || "—"}
                          </TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>
                            {client.created_at ? formatDate(client.created_at) : "—"}
                          </TableCell>
                          <TableCell>{clientOrders.length}</TableCell>
                          <TableCell>{formatPrice(spent)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setClientFilter(client.id);
                                  setTab("orders");
                                }}
                              >
                                Voir commandes
                              </Button>
                              {client.id !== user?.id && (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() =>
                                    removeUser(client.id, client.name || client.email)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useOrders } from "@/lib/api/hooks";
import type { Order } from "@/lib/api/types";
import { formatDate, formatPrice, orderStatusLabel, resolveImageUrl, toNumber } from "@/lib/format";

const statusStyles: Record<string, string> = {
  pending: "bg-blue-500 text-white",
  confirmed: "bg-indigo-500 text-white",
  shipped: "bg-orange-500 text-white",
  on_livraison: "bg-orange-500 text-white",
  delivered: "bg-green-500 text-white",
  cancelled: "bg-red-500 text-white",
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: CheckCircle2,
  shipped: Truck,
  on_livraison: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const Orders = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useOrders();
  const orders = data?.data ?? [];
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder: Order | undefined =
    orders.find((order) => order.id === selectedOrderId) ?? orders[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-destructive">
            Impossible de charger les commandes. Vérifiez que l'API est démarrée.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <Package className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
          <h2 className="text-2xl font-heading font-bold mb-4">Aucune commande</h2>
          <p className="text-muted-foreground mb-8">Vous n'avez pas encore passé de commande.</p>
          <Button onClick={() => navigate("/")} size="lg">
            Découvrir nos produits
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      <div className="container mx-auto min-w-0 px-4 py-8 md:ml-64 md:w-[calc(100%-16rem)]">
        <h1 className="text-3xl font-heading font-bold mb-8 text-foreground">Mes Commandes</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1 space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusIcons[order.status] ?? Clock;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`bg-card rounded-xl p-4 cursor-pointer border-2 transition-all hover:shadow-lg ${
                    selectedOrder?.id === order.id ? "border-primary shadow-md" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-sm text-foreground">
                      Commande #{order.id.slice(0, 8)}
                    </span>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                      statusStyles[order.status] ?? "bg-gray-500 text-white"
                    }`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {orderStatusLabel(order.status)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{formatDate(order.created_at)}</p>
                    <p className="font-semibold text-foreground">{formatPrice(order.total)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Details */}
          {selectedOrder && (
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">
                      Commande #{selectedOrder.id.slice(0, 8)}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      statusStyles[selectedOrder.status] ?? "bg-gray-500 text-white"
                    }`}
                  >
                    {orderStatusLabel(selectedOrder.status)}
                  </span>
                </div>

                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 border-b border-border pb-4 last:border-b-0"
                    >
                      <img
                        src={resolveImageUrl(item.product?.image_url)}
                        alt={item.product?.name ?? "Produit"}
                        className="w-16 h-16 rounded-lg object-cover"
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
                  ))}
                </div>

                <div className="border-t border-border mt-6 pt-4 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Orders;

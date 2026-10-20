import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, MapPin, Clock, Phone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface Order {
  id: string;
  order_code: string;
  status: string;
  total_amount: number;
  phone_number: string;
  shipping_address: string;
  created_at: string;
  status_history: Array<{
    status: string;
    timestamp: string;
    time: string;
  }>;
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const userSession = localStorage.getItem('userSession');
    setUser(userSession ? JSON.parse(userSession) : null);
    // Load orders
    fetchOrders();
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Mock data for demo
      const mockOrders: Order[] = [
        {
          id: "1",
          order_code: "DH149FDA2C8",
          status: "Livré",
          total_amount: 229,
          phone_number: "0660****30",
          shipping_address: "Casablanca, Had Soualem",
          created_at: "2025-11-06",
          status_history: [
            { status: "En attente", timestamp: "06/11", time: "12:39" },
            { status: "Ramassage en cours", timestamp: "06/11", time: "13:19" },
            { status: "Ramassage en cours", timestamp: "06/11", time: "13:19" },
            { status: "Ramassage en cours", timestamp: "06/11", time: "13:19" },
            { status: "Ramassé", timestamp: "06/11", time: "18:21" },
            { status: "Entrepôt", timestamp: "06/11", time: "20:15" },
            { status: "En cours de livraison", timestamp: "07/11", time: "10:02" },
            { status: "Livré", timestamp: "07/11", time: "16:27" },
          ],
        },
        {
          id: "2",
          order_code: "DH249GBC3D9",
          status: "En cours de livraison",
          total_amount: 450,
          phone_number: "0661****45",
          shipping_address: "Rabat, Agdal",
          created_at: "2025-11-12",
          status_history: [
            { status: "En attente", timestamp: "12/11", time: "09:15" },
            { status: "Ramassage en cours", timestamp: "12/11", time: "11:30" },
            { status: "Ramassé", timestamp: "12/11", time: "14:20" },
            { status: "Entrepôt", timestamp: "12/11", time: "18:45" },
            { status: "En cours de livraison", timestamp: "13/11", time: "08:30" },
          ],
        },
        {
          id: "3",
          order_code: "DH350HKJ4E1",
          status: "Ramassage en cours",
          total_amount: 315,
          phone_number: "0662****78",
          shipping_address: "Marrakech, Gueliz",
          created_at: "2025-11-13",
          status_history: [
            { status: "En attente", timestamp: "13/11", time: "10:00" },
            { status: "Ramassage en cours", timestamp: "13/11", time: "12:15" },
          ],
        },
      ];

      setOrders(mockOrders);
      if (mockOrders.length > 0) {
        setSelectedOrder(mockOrders[0]);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "livré":
        return "bg-green-500 text-white";
      case "en cours de livraison":
        return "bg-cyan-500 text-white";
      case "ramassage en cours":
        return "bg-orange-500 text-white";
      case "ramassé":
        return "bg-orange-600 text-white";
      case "entrepôt":
        return "bg-blue-600 text-white";
      case "en attente":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
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

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold mb-8 text-foreground">Mes Commandes</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-card rounded-xl p-4 cursor-pointer border-2 transition-all hover:shadow-lg ${
                  selectedOrder?.id === order.id ? "border-primary shadow-md" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-sm text-foreground">
                      Code: {order.order_code}
                    </span>
                  </div>
                </div>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {order.shipping_address}
                  </p>
                  <p className="font-semibold text-foreground">{order.total_amount} DH</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Details */}
          {selectedOrder && (
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 text-white mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="h-10 w-10" />
                  <div>
                    <h2 className="text-xl font-bold">Suivi des colis</h2>
                    <p className="text-blue-100">et des livraisons</p>
                  </div>
                </div>

                <div className="bg-white text-blue-700 rounded-full px-6 py-3 font-bold text-center mb-6">
                  Code : {selectedOrder.order_code}
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <MapPin className="h-8 w-8 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Destination</h3>
                    <p className="flex items-center gap-2 text-blue-100">
                      <span className="w-3 h-3 bg-cyan-400 rounded-full"></span>
                      {selectedOrder.shipping_address.split(", ")[0]}
                    </p>
                    <p className="flex items-center gap-2 text-blue-100 mt-1">
                      <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                      {selectedOrder.shipping_address.split(", ")[1]}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  <Button
                    variant="secondary"
                    className="flex-1 bg-gray-200 text-gray-600 hover:bg-gray-300"
                  >
                    Statut
                  </Button>
                  <Button className={`flex-1 ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </Button>
                </div>

                <div className="bg-blue-800 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">N° Téléphone :</p>
                    <p className="font-semibold">{selectedOrder.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Montant :</p>
                    <p className="font-semibold">{selectedOrder.total_amount} DH</p>
                  </div>
                </div>
              </div>

              {/* Status History */}
              <div className="bg-card rounded-xl p-8">
                <h3 className="text-lg font-semibold text-muted-foreground mb-6 text-center">
                  Historique des statuts de votre colis
                </h3>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[23px] top-8 bottom-8 w-1 bg-gradient-to-b from-orange-400 via-blue-500 to-green-500"></div>

                  {/* Status items */}
                  <div className="space-y-6">
                    {selectedOrder.status_history.map((item, index) => {
                      const isLast = index === selectedOrder.status_history.length - 1;
                      const isDelivered = item.status.toLowerCase() === "livré";
                      const isInProgress = item.status.toLowerCase().includes("en cours");

                      return (
                        <div key={index} className="flex items-start gap-4 relative">
                          {/* Timeline dot */}
                          <div className="relative z-10">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                isDelivered
                                  ? "bg-green-500"
                                  : isInProgress
                                  ? "bg-cyan-500"
                                  : "bg-orange-400"
                              }`}
                            >
                              {isLast ? (
                                <CheckCircle2 className="h-6 w-6 text-white" />
                              ) : (
                                <Clock className="h-6 w-6 text-white" />
                              )}
                            </div>
                          </div>

                          {/* Status content */}
                          <div className="flex-1 pt-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm text-muted-foreground font-medium">
                                {item.timestamp}
                              </span>
                              <span className="text-sm text-blue-600 font-semibold">
                                {item.time}
                              </span>
                            </div>
                            <div
                              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                                isDelivered
                                  ? "bg-green-500/10 text-green-700 border-2 border-green-500"
                                  : isInProgress
                                  ? "bg-cyan-500/10 text-cyan-700 border-2 border-cyan-500"
                                  : "bg-orange-500/10 text-orange-700 border-2 border-orange-500"
                              }`}
                            >
                              {item.status}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedOrder.status.toLowerCase() === "livré" && (
                  <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-full font-semibold">
                      <CheckCircle2 className="h-5 w-5" />
                      Commande livrée avec succès
                    </div>
                  </div>
                )}
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

import React, { useState, useEffect } from "react";
import { apiClient } from "../apiClient";
import RefreshButton from "./RefreshButton";
import "./Components.css";

interface Order {
  _id?: string;
  id?: string;
  orderNumber?: string;
  productId: string;
  productName?: string;
  status: string;
}

interface Product {
  _id: string;
  name: string;
}

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get("/api/orders");
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get("/api/products");
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
    }
  };

  const createOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert("Please select a product first!");
      return;
    }

    setCreating(true);
    try {
      await apiClient.post("/api/orders", { productId: selectedProduct, status });
      setSelectedProduct("");
      setStatus("pending");
      await fetchOrders();
    } catch (err) {
      console.error("Error creating order:", err);
      setError("Failed to create order");
    } finally {
      setCreating(false);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await apiClient.delete(`/api/orders/${id}`);
      await fetchOrders();
    } catch (err) {
      console.error("Error deleting order:", err);
      setError("Failed to delete order");
    }
  };

  useEffect(() => {
    Promise.all([fetchOrders(), fetchProducts()]).finally(() =>
      setLoading(false)
    );
  }, []);

  if (loading) return <div>Loading orders and products...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Orders</h2>
        <div className="refresh-wrapper">
          <RefreshButton onClick={fetchOrders} />
        </div>
      </div>

      <form onSubmit={createOrder} className="order-form">
        <label>
          Product:
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            required
          >
            <option value="">-- Select a Product --</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status:
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <button type="submit" disabled={!selectedProduct || creating}>
          {creating ? "Creating..." : "Create Order"}
        </button>
      </form>

      <div className="item-container">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order._id || order.id} className="order-card">
              <h3>{order.orderNumber || `Order #${order._id}`}</h3>
              <p>Product: {order.productName || order.productId}</p>
              <p>Status: {order.status}</p>
              <button
                className="noselect"
                onClick={() => deleteOrder(order._id || order.id!)}
              >
                <span className="text">Delete</span>
                <span className="icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path>
                  </svg>
                </span>
              </button>
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
};

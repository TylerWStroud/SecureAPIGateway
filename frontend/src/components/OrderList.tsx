import React, { useState, useEffect } from "react";
import { orderService, type Order } from "../services/api";
import RefreshButton from "./RefreshButton";
import "./Components.css";

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrders();
      setOrders(response.data.data);
    } catch (err) {
      setError("Failed to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    const newOrder = {
      userId: 1,
      productId: 1,
      status: "pending",
    };

    try {
      await orderService.createOrder(newOrder);
      fetchOrders(); // Refresh the list
    } catch (err) {
      setError("Failed to create order");
      console.error("Error creating order:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="section-container">
      <h2>Orders</h2>
      <nav className="two-button-container">
        <button onClick={createOrder}>Create New Order</button>
        <RefreshButton onClick={fetchOrders} />
      </nav>

      <div className="item-container">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <h3>Order #{order.id}</h3>
            <p>User ID: {order.userId}</p>
            <p>Product ID: {order.productId}</p>
            <p>Status: {order.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

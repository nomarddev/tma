import React, { useEffect, useState } from 'react';
import OrderForm from './components/OrderForm';

interface Order {
  id?: string;
  category: string;
  description: string;
  reward: number;
  payment_method: string;
  address_from: string;
  address_to: string;
  status?: string;
  created_at?: string;
}

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Для Vite переменные приходят из import.meta.env и должны начинаться с VITE_
  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
  console.log('VITE_API_URL =', (import.meta as any).env?.VITE_API_URL);
  console.log('Запрашиваем:', `${API_URL}/orders`);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const addOrder = async (order: Order) => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error(`Failed to add order: ${res.status}`);
      const newOrder = await res.json();
      setOrders((prev) => [...prev, newOrder]);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      <h1>Список заказов</h1>
      <OrderForm onAddOrder={addOrder} />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            {order.category}: {order.description} — {order.reward} ₽
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

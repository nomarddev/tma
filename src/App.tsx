import React, { useEffect, useState } from 'react';
import OrderForm from './components/OrderForm';

// @ts-ignore — чтобы TypeScript не ругался на Telegram объект
const tg = (window as any).Telegram?.WebApp;

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
  const [user, setUser] = useState<{ first_name?: string; last_name?: string } | null>(null);


  // API_URL меняем в зависимости от окружения
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
  const tg = (window as any).Telegram?.WebApp;
  const initData = tg?.initData;

  if (initData) {
    fetch(`${import.meta.env.VITE_API_URL}/me?initData=${encodeURIComponent(initData)}`)
      .then(res => res.json())
      .then(data => {
        console.log("User from backend:", data);
        setUser(data);
      })
      .catch(err => console.error("Auth error:", err));
  }
}, []);


  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
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
      if (!res.ok) throw new Error('Failed to add order');
      const newOrder = await res.json();
      setOrders((prev) => [...prev, newOrder]);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
  <div>
    {user && <p>Привет, {user.first_name}!</p>}
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

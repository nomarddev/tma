import React, { useState } from 'react';

interface Order {
  category: string;
  description: string;
  reward: number;
  payment_method: string;
  address_from: string;
  address_to: string;
}

interface OrderFormProps {
  onAddOrder: (order: Order) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onAddOrder }) => {
  const [form, setForm] = useState<Order>({
    category: '',
    description: '',
    reward: 0,
    payment_method: '',
    address_from: '',
    address_to: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder(form);
    setForm({
      category: '',
      description: '',
      reward: 0,
      payment_method: '',
      address_from: '',
      address_to: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
      <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
      <input
        type="number"
        name="reward"
        placeholder="Reward"
        value={form.reward}
        onChange={handleChange}
        required
      />
      <input name="payment_method" placeholder="Payment method" value={form.payment_method} onChange={handleChange} required />
      <input name="address_from" placeholder="From address" value={form.address_from} onChange={handleChange} required />
      <input name="address_to" placeholder="To address" value={form.address_to} onChange={handleChange} required />
      <button type="submit">Add Order</button>
    </form>
  );
};

export default OrderForm;

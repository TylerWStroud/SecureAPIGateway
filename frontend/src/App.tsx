import React, { useState } from 'react';
import { UserList } from './components/UserList';
import { ProductList } from './components/ProductList';
import { OrderList } from './components/OrderList';
import { HealthCheck } from './components/HealthCheck';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'orders' | 'health'>('users');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Secure API Gateway - Frontend</h1>
        <nav>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button 
            className={activeTab === 'health' ? 'active' : ''}
            onClick={() => setActiveTab('health')}
          >
            Health Check
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'users' && <UserList />}
        {activeTab === 'products' && <ProductList />}
        {activeTab === 'orders' && <OrderList />}
        {activeTab === 'health' && <HealthCheck />}
      </main>
    </div>
  );
}

export default App;

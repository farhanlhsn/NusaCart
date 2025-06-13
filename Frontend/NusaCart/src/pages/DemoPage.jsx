import React, { useState } from 'react';
import ProductManager from '../components/ProductManager';
import CartManager from '../components/CartManager';
import OrderManager from '../components/OrderManager';
import WishlistManager from '../components/WishlistManager';
import ProductCreator from '../components/ProductCreator';

const DemoPage = () => {
  const [activeDemo, setActiveDemo] = useState('products');

  const demos = [
    { id: 'products', label: 'Product Management', component: ProductManager },
    { id: 'create', label: 'Create Product', component: ProductCreator },
    { id: 'cart', label: 'Shopping Cart', component: CartManager },
    { id: 'orders', label: 'Order Management', component: OrderManager },
    { id: 'wishlist', label: 'Wishlist & Reviews', component: WishlistManager }
  ];

  const ActiveComponent = demos.find(demo => demo.id === activeDemo)?.component || ProductManager;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-800">NusaCart API Demo</h1>
            <div className="text-sm text-gray-600">
              Testing all backend endpoints
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {demos.map(demo => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeDemo === demo.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {demo.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          <ActiveComponent />
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t mt-8 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>
            This demo showcases all 70+ backend endpoints integrated with the frontend.
            <br />
            <strong>Current Demo:</strong> {demos.find(demo => demo.id === activeDemo)?.label}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoPage; 
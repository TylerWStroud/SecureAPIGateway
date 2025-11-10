import React, { useState, useEffect } from "react";
import { productService, type Product } from "../services/api";
import RefreshButton from "./RefreshButton";
import "./Components.css";

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts();
      setProducts(response.data.data);
    } catch (err) {
      setError("Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  
  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Products</h2>
        <div className="refresh-wrapper">
          <RefreshButton onClick={fetchProducts} />
        </div>
      </div>

      <div className="item-container">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
import React, { useState, useEffect } from "react";
import { apiClient } from "../apiClient";
import RefreshButton from "./RefreshButton";
import "./Components.css";

interface Product {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  stock?: number;
  description?: string;
}

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/api/products");
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert("Name and price are required.");
      return;
    }

    setCreating(true);
    try {
      await apiClient.post("/api/products", {
        name,
        price: Number(price),
        stock: Number(stock) || 0,
        description,
      });
      setName("");
      setPrice("");
      setStock("");
      setDescription("");
      await fetchProducts();
    } catch (err) {
      console.error("Error creating product:", err);
      setError("Failed to create product");
    } finally {
      setCreating(false);
    }
  };

  const deleteProduct = async (id: string | undefined) => {
    if (!id) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/api/products/${id}`);
      setProducts(products.filter((p) => p._id !== id && p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>Products</h2>
        <div className="refresh-wrapper">
          <RefreshButton onClick={fetchProducts} />
        </div>
      </div>

      {/* Add Product Form */}
      <form
        onSubmit={createProduct}
        className="form-inline"
        style={{ marginBottom: "1rem" }}
      >
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value ? parseFloat(e.target.value) : "")
          }
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) =>
            setStock(e.target.value ? parseInt(e.target.value) : "")
          }
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" disabled={creating}>
          {creating ? "Adding..." : "Add Product"}
        </button>
      </form>

      {/* Product List */}
      <div className="item-container">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id || product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              {product.stock !== undefined && <p>Stock: {product.stock}</p>}
              {product.description && <p>{product.description}</p>}
              <button
                className="noselect"
                onClick={() => deleteProduct(product._id || product.id)}
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
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

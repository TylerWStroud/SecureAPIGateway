/* 

Axios is a popular JavaScript library for making HTTP requests from both the browser and Node.js environments. 
It provides an easy-to-use API for sending asynchronous requests to REST endpoints and handling responses. 
Axios supports features like request and response interception, automatic JSON data transformation, and error handling, 
making it a powerful tool for interacting with web APIs.

*/
import axios from "axios";

// API config (vite-specific environment variable)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"; // default fallback to local server

// creates reusable axios instance
export const api = axios.create({
  /**
   * @param baseURL: The base URL for all API requests. This is the root address that will be prepended to all request URLs made using this axios instance.
   * @param headers: Default headers to be sent with every request. These headers can include content type, authorization tokens, and any custom headers required by the API.
   * @param timeout: The maximum time (in milliseconds) that the request should take before being aborted. If a request takes longer than this time, it will be canceled.
   *
   * @internal
   */
  baseURL: API_BASE_URL, // starting part of all URLs (goes to localhost or specified server)
  headers: {
    "Content-Type": "application/json", // default header for JSON data (tells server we're sending JSON data)
    "X-API-Key": "my-secret-api-key", // example of custom header for API authentication
  },
  timeout: 10000, // cancels requests taking longer than 10 seconds
});

/*
REQUEST INTERCEPTOR
You can add authentication tokens or modify requests here
Logs outgoing requests for debugging
*/
api.interceptors.request.use(
  // config contains details about the request being made
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to ${config.url}`
    ); // gets HTTP method (GET,POST,etc.) and URL
    return config; // must return config for request to proceed
  },
  // error handler for request errors
  (error) => {
    return Promise.reject(error); // passes error to original caller
  }
);

/*
RESPONSE INTERCEPTOR
You can handle global response logic here
Logs incoming responses for debugging
*/
api.interceptors.response.use(
  (response) => response, // simply return response on success
  (error) => {
    console.error("API Error:", error.response?.data || error.message); // log error details
    return Promise.reject(error); // passes error to original caller
  }
);

// TYPE DEFINITIONS
export interface ApiResponse<T> {
  message: string; // a message from the server (e.g., "Success" or error details)
  method: string; // HTTP method used for the request (GET, POST, etc.)
  path: string; // the API endpoint path that was accessed
  data: T; // the actual data returned from the API
}

export interface ErrorResponse {
  error: string;
  code: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  productId: number;
  status: string;
}

// API METHODS
export const userService = {
  getUsers: (): Promise<{ data: ApiResponse<User[]> }> => api.get("/api/users"),

  createUser: (
    userData: Omit<User, "id">
  ): Promise<{ data: ApiResponse<User> }> => api.post("/api/users", userData),
};

export const productService = {
  getProducts: (): Promise<{ data: ApiResponse<Product[]> }> =>
    api.get("/api/products"),
};

export const orderService = {
  getOrders: (): Promise<{ data: ApiResponse<Order[]> }> =>
    api.get("/api/orders"),

  createOrder: (orderData: Omit<Order, "id">): Promise<{ data: ApiResponse<any> }> =>
    api.post("/api/orders", orderData),
};

export const healthService = {
  checkHealth: (): Promise<{ data: ApiResponse<{ status: string }> }> =>
    api.get("/health"),
};

import { captureRumError } from "./datadog";
import type {
  CartApiItem,
  CheckoutPayload,
  Order,
  Product,
  ProductListResponse,
  SupportPayload
} from "./types";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const API_BASE_URL = getApiBaseUrl();

export async function getProducts(params: { search?: string; category?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (params.search) {
    searchParams.set("search", params.search);
  }
  if (params.category) {
    searchParams.set("category", params.category);
  }

  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return request<ProductListResponse>(`/api/products${suffix}`);
}

export async function getProduct(productId: string) {
  const response = await request<{ product: Product }>(`/api/products/${productId}`);
  return response.product;
}

export async function validateCart(items: CartApiItem[]) {
  return request<{
    ok: boolean;
    items: CartApiItem[];
    totals: { subtotal: number; shipping: number; total: number };
    warnings: string[];
  }>("/api/cart/validate", {
    method: "POST",
    body: JSON.stringify({ items })
  });
}

export async function checkout(payload: CheckoutPayload) {
  const response = await request<{ ok: boolean; order: Order }>("/api/checkout", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return response.order;
}

export async function submitSupport(payload: SupportPayload) {
  return request<{
    ok: boolean;
    ticket: { id: string; createdAt: string; status: string };
  }>("/api/support", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {})
      }
    });

    const payload = await readJson(response);

    if (!response.ok) {
      const apiError = new ApiError(
        payload?.message || `Request failed with status ${response.status}`,
        response.status,
        payload?.code,
        payload
      );
      captureRumError(apiError, {
        url,
        status: response.status,
        code: payload?.code
      });
      throw apiError;
    }

    return payload as T;
  } catch (error) {
    if (!(error instanceof ApiError)) {
      captureRumError(error, { url });
    }
    throw error;
  }
}

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return "http://localhost:3000";
  }

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:3000";
  }

  return "http://backend:3000";
}

import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001",
});

API.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove("token");
      Cookies.remove("role");
      window.location.href = "/no-access";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const login = (email: string, password: string) =>
  API.post("/auth/login", { email, password });

export const getMe = () => API.get("/auth/me");
export const getUsers = () => API.get("/auth/users");
export const registerUser = (data: { name: string; email: string; password: string; role: string }) =>
  API.post("/auth/register", data);
export const deleteUser = (id: string) => API.delete(`/auth/users/${id}`);
export const generateTelegramLink = () => API.post("/auth/telegram/generate-link");
export const getTelegramStatus = () => API.get("/auth/telegram/status");
export const regenerateSlug = (userId: string) => API.post(`/auth/users/${userId}/regenerate-slug`);

// ── Brands ─────────────────────────────────────────────────
export const getBrands = () => API.get("/brands/");
export const toggleBrand = (id: string) => API.put(`/brands/${id}/toggle`);
export const updateBrandTelegram = (id: string, chat_id: string) => API.put(`/brands/${id}/telegram`, { chat_id });

// ── Content ────────────────────────────────────────────────
export const getContent = (params?: { date?: string; brand_slug?: string }) =>
  API.get("/content/", { params });
export const approveContent = (id: string) => API.put(`/content/${id}/approve`);
export const updateCards = (id: string, cards: unknown[]) =>
  API.put(`/content/${id}/cards`, { cards });
export const triggerGeneration = () => API.post("/content/generate");
export const triggerSend = () => API.post("/content/send");

// ── Links ──────────────────────────────────────────────────
export const submitLink = (data: { brand_slug: string; platform: string; url: string; date: string }) =>
  API.post("/links/", data);
export const getLinks = (params?: { date?: string; brand_slug?: string }) =>
  API.get("/links/", { params });
export const getLinkStatus = (date?: string) =>
  API.get("/links/status", { params: { date } });

// ── Scores ─────────────────────────────────────────────────
export const getScores = (params: { period: string; period_key?: string; brand_slug?: string }) =>
  API.get("/scores/", { params });
export const getLeaderboard = (period: string) =>
  API.get("/scores/leaderboard", { params: { period } });
export const getScoreHistory = (brand_slug: string, period: string, limit = 30) =>
  API.get(`/scores/history/${brand_slug}`, { params: { period, limit } });
export const recalculateScores = () => API.post("/scores/recalculate");

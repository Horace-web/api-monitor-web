import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
if (!API_URL) throw new Error('Missing NEXT_PUBLIC_API_URL');

export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number };
export type Paginated<T> = { data: T[]; meta: PaginationMeta };
export type Service = { id: string; name: string; description?: string | null; createdAt: string; updatedAt: string; _count?: { monitors: number } };
export type Monitor = { id: string; name: string; url: string; method: 'GET'; interval: number; timeout: number; expectedStatus: number; isActive: boolean; serviceId: string; createdAt: string; updatedAt: string };
export type CheckResult = { id: string; monitorId: string; status: 'UP' | 'DOWN'; statusCode?: number | null; responseTime?: number | null; error?: string | null; checkedAt: string };
export type MonitorStats = { totalChecks: number; successfulChecks: number; failedChecks: number; uptimePercentage: number | null; averageResponseTime: number | null };
export type DashboardStats = { services: number; activeMonitors: number; pausedMonitors: number; totalMonitors: number; totalChecks: number; successfulChecks: number; failedChecks: number; uptimePercentage: number | null; averageResponseTime: number | null; recentDown: Array<{ monitorId: string; statusCode: number | null; error: string | null; checkedAt: string; monitor: { name: string; service: { name: string } } }> };
export type Alert = { id: string; monitorId: string; statusCode: number | null; responseTime: number | null; error: string | null; checkedAt: string; monitor: { name: string; url: string; service: { name: string } } };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers ?? {}) }, cache: 'no-store' });
  } catch {
    throw new Error("Impossible de joindre l'API. Vérifiez que le backend est disponible et que l'URL API est correctement configurée.");
  }
  if (!response.ok) {
    let message = `Erreur API (${response.status})`;
    try { const body = await response.json(); if (Array.isArray(body.message)) message = body.message.join(', '); else if (body.message) message = body.message; } catch {}
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

const query = (params: Record<string, string | number | undefined>) => {
  const clean = Object.entries(params).filter(([, value]) => value !== undefined);
  return clean.length ? `?${new URLSearchParams(clean.map(([key, value]) => [key, String(value)]))}` : '';
};

export const api = {
  dashboard: { stats: () => request<DashboardStats>('/dashboard/stats') },
  alerts: {
    list: (params: { page?: number; limit?: number } = {}) => request<Paginated<Alert>>(`/alerts${query({ page: params.page ?? 1, limit: params.limit ?? 20 })}`),
  },
  services: {
    list: (params: { page?: number; limit?: number; search?: string } = {}) => request<Paginated<Service>>(`/services${query({ page: params.page ?? 1, limit: params.limit ?? 10, search: params.search })}`),
    create: (payload: { name: string; description?: string }) => request<Service>('/services', { method: 'POST', body: JSON.stringify(payload) }),
    remove: (id: string) => request<void>(`/services/${id}`, { method: 'DELETE' }),
  },
  monitors: {
    list: (params: { page?: number; limit?: number; serviceId?: string; status?: 'UP' | 'DOWN' | 'PAUSED'; search?: string } = {}) => request<Paginated<Monitor>>(`/monitors${query({ page: params.page ?? 1, limit: params.limit ?? 10, serviceId: params.serviceId, status: params.status, search: params.search })}`),
    create: (payload: { serviceId: string; name: string; url: string; interval?: number; timeout?: number; expectedStatus?: number }) => request<Monitor>('/monitors', { method: 'POST', body: JSON.stringify(payload) }),
    activate: (id: string) => request<Monitor>(`/monitors/${id}/activate`, { method: 'POST' }),
    deactivate: (id: string) => request<Monitor>(`/monitors/${id}/deactivate`, { method: 'POST' }),
    remove: (id: string) => request<void>(`/monitors/${id}`, { method: 'DELETE' }),
  },
  checkResults: {
    list: (monitorId: string, limit = 20) => request<CheckResult[]>(`/check-results/monitor/${monitorId}?limit=${limit}`),
    stats: (monitorId: string) => request<MonitorStats>(`/check-results/monitor/${monitorId}/stats`),
  },
};

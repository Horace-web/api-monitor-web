import { supabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('Missing NEXT_PUBLIC_API_URL');
}

export type Service = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Monitor = {
  id: string;
  name: string;
  url: string;
  method: 'GET';
  interval: number;
  timeout: number;
  expectedStatus: number;
  isActive: boolean;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
};

export type MonitorStats = {
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  uptimePercentage: number;
  averageResponseTime: number;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) throw new Error('Votre session a expiré. Veuillez vous reconnecter.');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Erreur API (${response.status})`;
    try {
      const body = await response.json();
      if (Array.isArray(body.message)) message = body.message.join(', ');
      else if (body.message) message = body.message;
    } catch {
      // Keep the generic HTTP error.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  services: {
    list: () => request<Service[]>('/services'),
    create: (payload: { name: string; description?: string }) =>
      request<Service>('/services', { method: 'POST', body: JSON.stringify(payload) }),
    remove: (id: string) => request<void>(`/services/${id}`, { method: 'DELETE' }),
  },
  monitors: {
    list: (serviceId?: string) =>
      request<Monitor[]>(serviceId ? `/monitors?serviceId=${encodeURIComponent(serviceId)}` : '/monitors'),
    create: (payload: {
      serviceId: string;
      name: string;
      url: string;
      interval?: number;
      timeout?: number;
      expectedStatus?: number;
    }) => request<Monitor>('/monitors', { method: 'POST', body: JSON.stringify(payload) }),
    activate: (id: string) => request<Monitor>(`/monitors/${id}/activate`, { method: 'POST' }),
    deactivate: (id: string) => request<Monitor>(`/monitors/${id}/deactivate`, { method: 'POST' }),
    remove: (id: string) => request<void>(`/monitors/${id}`, { method: 'DELETE' }),
  },
  checkResults: {
    stats: (monitorId: string) => request<MonitorStats>(`/check-results/monitor/${monitorId}/stats`),
  },
};

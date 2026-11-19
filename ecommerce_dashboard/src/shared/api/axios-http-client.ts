import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import { appConfig } from '@shared/config/app-config';
import { tokenStorage } from '@shared/auth/token-storage.service';
import type { IHttpClientPort, RequestConfig } from './http-client.port';

export class AxiosHttpClient implements IHttpClientPort {
  private readonly instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: appConfig.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 1. Request-Interceptor: JWT automatisch mitsenden
    this.instance.interceptors.request.use(
      (config) => {
        const token = tokenStorage.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // 2. Response-Interceptor: NestJS TransformInterceptor-Hülle auspacken & Fehler abfangen
    this.instance.interceptors.response.use(
      (response) => {
        // Entpackt { success: true, data: ... } direkt zu den inneren Daten
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          return response.data.data;
        }
        return response.data;
      },
      (error: AxiosError<{ message?: string | string[]; statusCode?: number }>) => {
        const status = error.response?.status;

        // Bei 401 (Token abgelaufen/ungültig) globales Event für AuthContext feuern
        if (status === 401) {
          tokenStorage.removeToken();
          window.dispatchEvent(new Event('auth:unauthorized'));
        }

        // Einheitliche Fehlermeldung aus dem NestJS AllExceptionsFilter extrahieren
        const backendMessage = error.response?.data?.message;
        const formattedMessage = Array.isArray(backendMessage)
          ? backendMessage.join(', ')
          : backendMessage || error.message || 'Unbekannter Netzwerkfehler';

        return Promise.reject(new Error(formattedMessage));
      },
    );
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const result = await this.instance.get(url, config);
    return result as unknown as T;
  }

  async post<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> {
    const result = await this.instance.post(url, data, config);
    return result as unknown as T;
  }

  async put<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> {
    const result = await this.instance.put(url, data, config);
    return result as unknown as T;
  }

  async patch<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> {
    const result = await this.instance.patch(url, data, config);
    return result as unknown as T;
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    const result = await this.instance.delete(url, config);
    return result as unknown as T;
  }
}

// Singleton-Instanz für die gesamte Anwendung
export const httpClient: IHttpClientPort = new AxiosHttpClient();

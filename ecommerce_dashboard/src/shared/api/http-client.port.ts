export interface RequestConfig {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface IHttpClientPort {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T>;
  put<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T>;
  patch<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

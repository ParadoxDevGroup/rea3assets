const API_BASE = "/assets";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

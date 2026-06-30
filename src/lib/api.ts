/** Parse FastAPI error responses into a user-visible string. */
export async function parseApiError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    const detail = data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((item) => item?.msg || JSON.stringify(item)).join('; ');
    }
  } catch {
    // ignore
  }
  return fallback;
}

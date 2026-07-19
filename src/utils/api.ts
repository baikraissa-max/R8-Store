/**
 * Safely fetch JSON from an API endpoint.
 * It checks the response status and content-type, prevents JSON parsing errors on HTML responses,
 * and throws descriptive, user-friendly errors.
 */
export async function safeFetchJson<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(input, init);
    
    const contentType = response.headers.get("content-type") || "";
    
    // Check if the response is actually JSON
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      const snippet = text.length > 80 ? text.slice(0, 80) + "..." : text;
      
      // Provide a clean, helpful error message
      if (response.status === 404) {
        throw new Error("Layanan API tidak ditemukan (404). Silakan hubungi admin.");
      }
      if (response.status === 500) {
        throw new Error("Terjadi kesalahan internal pada server (500).");
      }
      
      throw new Error(`Respon server tidak valid (bukan JSON): "${snippet.trim()}" (Status: ${response.status})`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.error || `Permintaan gagal dengan status ${response.status}`);
    }
    
    return data;
  } catch (error: any) {
    // If it is already our formatted error, rethrow it
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error?.message || "Terjadi kesalahan saat menghubungi server.");
  }
}

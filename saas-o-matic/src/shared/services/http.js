export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      signal: options.signal ?? AbortSignal.timeout(10000),
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (cause) {
    if (options.signal?.aborted) throw cause;
    throw new Error('No se pudo conectar con el servidor. Comprueba la conexión y reintenta.');
  }
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message ?? 'No se pudo completar la solicitud.');
    error.fields = data.fields;
    throw error;
  }
  return data;
}

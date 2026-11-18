import { createServer } from 'node:http';
import { countries, plans } from '../shared/catalog.js';
import { calculatePrice } from '../shared/pricing.js';
import { ApiError, validateCustomer, validateSimulation } from './validation.js';
import { getRates } from './exchange-rates.js';

async function readBody(req) {
  if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json')
    throw new ApiError(415, 'Se requiere contenido JSON.');
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > 16384) throw new ApiError(413, 'La solicitud es demasiado grande.');
    chunks.push(chunk);
  }
  try {
    // HTTP chunks can split UTF-8 code points. Decode once, rejecting malformed sequences.
    const text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
    return JSON.parse(text);
  } catch {
    throw new ApiError(400, 'El JSON no es válido.');
  }
}

export function createApp(
  repo,
  {
    allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    rates = getRates,
  } = {},
) {
  const clients = new Map();
  allowedOrigins = [...allowedOrigins, 'http://localhost:4173', 'http://127.0.0.1:4173'];
  return createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cache-Control', 'no-store');
    const send = (status, body) => {
      res.writeHead(status);
      res.end(JSON.stringify(body));
    };
    try {
      if (req.headers.origin && !allowedOrigins.includes(req.headers.origin))
        throw new ApiError(403, 'Origen no permitido.');
      const host = req.headers.host?.split(':')[0];
      if (!['localhost', '127.0.0.1'].includes(host)) throw new ApiError(403, 'Host no permitido.');
      const now = Date.now();
      for (const [key, bucket] of clients) if (now > bucket.until) clients.delete(key);
      const ip = req.socket.remoteAddress;
      const bucket = clients.get(ip) ?? { count: 0, until: now + 60000 };
      clients.set(ip, bucket);
      if (++bucket.count > 300)
        throw new ApiError(429, 'Demasiadas solicitudes. Reintenta en un minuto.');
      const url = new URL(req.url, 'http://localhost');
      const path = url.pathname;
      if (req.method === 'GET' && path === '/health') return send(200, { status: 'ok' });
      if (req.method === 'GET' && path === '/catalog') return send(200, { countries, plans });
      if (req.method === 'GET' && path === '/exchange-rates') return send(200, await rates());
      if (path === '/customers' && req.method === 'GET') {
        const q = url.searchParams.get('q') ?? '';
        if (q.length > 120) throw new ApiError(422, 'Búsqueda demasiado larga.');
        return send(200, repo.list(q.trim()));
      }
      if (path === '/customers' && req.method === 'POST') {
        const data = validateCustomer(await readBody(req));
        if (repo.duplicate(data.country, data.taxId))
          throw new ApiError(
            409,
            'Ya existe un cliente con ese identificador fiscal en este país.',
          );
        return send(201, repo.create(data));
      }
      const match = path.match(/^\/customers\/([a-f0-9-]{36})(\/simulations)?$/);
      if (match && req.method === 'GET') {
        const customer = repo.get(match[1]);
        if (!customer) throw new ApiError(404, 'Cliente no encontrado.');
        return send(200, match[2] ? repo.history(customer.id) : customer);
      }
      if (path === '/simulations' && req.method === 'POST') {
        const data = validateSimulation(await readBody(req));
        const customer = repo.get(data.customerId);
        if (!customer) throw new ApiError(404, 'Cliente no encontrado.');
        return send(
          201,
          repo.save(
            data,
            calculatePrice(data.users, countries.find((c) => c.code === customer.country).taxRate),
          ),
        );
      }
      throw new ApiError(404, 'Ruta no encontrada.');
    } catch (error) {
      send(error.status ?? 500, {
        message: error.status ? error.message : 'No se pudo completar la operación.',
        ...(error.fields ? { fields: error.fields } : {}),
      });
    }
  });
}

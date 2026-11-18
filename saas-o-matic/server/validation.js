import { countries, plans } from '../shared/catalog.js';
import { isSpanishTaxId, normalizeTaxId } from './domain/tax-id.js';

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
function checkObject(body, keys) {
  if (
    !body ||
    Array.isArray(body) ||
    typeof body !== 'object' ||
    Object.keys(body).some((key) => !keys.includes(key))
  ) {
    throw new ApiError(422, 'Los campos de la solicitud no son válidos.');
  }
}
export function validateCustomer(body) {
  checkObject(body, ['companyName', 'taxId', 'email', 'country', 'plan']);
  const fields = {};
  const data = Object.fromEntries(
    ['companyName', 'taxId', 'email', 'country', 'plan'].map((key) => [
      key,
      typeof body[key] === 'string' ? body[key].trim() : '',
    ]),
  );
  data.taxId = normalizeTaxId(data.taxId);
  data.email = data.email.toLowerCase();
  if (data.companyName.length < 2 || data.companyName.length > 120)
    fields.companyName = 'Introduce entre 2 y 120 caracteres.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254)
    fields.email = 'Introduce un email válido.';
  if (!countries.some((country) => country.code === data.country))
    fields.country = 'Selecciona un país disponible.';
  if (!plans.includes(data.plan)) fields.plan = 'Selecciona un plan válido.';
  if (!/^[A-Z0-9]{3,24}$/.test(data.taxId))
    fields.taxId = 'Identificador de 3–24 caracteres alfanuméricos.';
  else if (data.country === 'ES' && !isSpanishTaxId(data.taxId))
    fields.taxId = 'El DNI, NIE o NIF no supera el control de validación.';
  if (Object.keys(fields).length) throw new ApiError(422, 'Revisa los campos indicados.', fields);
  return data;
}
export function validateSimulation(body) {
  checkObject(body, ['customerId', 'users', 'storageGb', 'apiCalls']);
  const fields = {};
  for (const [key, max] of [
    ['users', 100000],
    ['storageGb', 1000000],
    ['apiCalls', 1000000000],
  ]) {
    if (!Number.isSafeInteger(body[key]) || body[key] < 0 || body[key] > max)
      fields[key] = `Introduce un entero entre 0 y ${max}.`;
  }
  if (typeof body.customerId !== 'string' || !/^[a-f0-9-]{36}$/.test(body.customerId))
    fields.customerId = 'Selecciona un cliente válido.';
  if (Object.keys(fields).length) throw new ApiError(422, 'Revisa los datos de consumo.', fields);
  return body;
}

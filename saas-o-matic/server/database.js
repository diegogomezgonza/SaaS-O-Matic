import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

export function openRepository(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY, companyName TEXT NOT NULL, taxId TEXT NOT NULL,
      email TEXT NOT NULL, country TEXT NOT NULL, plan TEXT NOT NULL,
      createdAt TEXT NOT NULL, UNIQUE(country, taxId)
    );
    CREATE TABLE IF NOT EXISTS simulations (
      id TEXT PRIMARY KEY, customerId TEXT NOT NULL REFERENCES customers(id),
      users INTEGER NOT NULL CHECK(users>=0), storageGb INTEGER NOT NULL CHECK(storageGb>=0),
      apiCalls INTEGER NOT NULL CHECK(apiCalls>=0), quote TEXT NOT NULL, createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS simulations_customer ON simulations(customerId, createdAt DESC);`);
  return {
    close: () => db.close(),
    list: (query) =>
      db
        .prepare(
          `SELECT * FROM customers WHERE instr(lower(companyName), lower(?)) > 0 OR instr(lower(taxId), lower(?)) > 0 ORDER BY createdAt DESC LIMIT 100`,
        )
        .all(query, query),
    get: (id) => db.prepare('SELECT * FROM customers WHERE id=?').get(id),
    duplicate: (country, taxId) =>
      db.prepare('SELECT id FROM customers WHERE country=? AND taxId=?').get(country, taxId),
    create(data) {
      const customer = { id: randomUUID(), ...data, createdAt: new Date().toISOString() };
      db.prepare(
        'INSERT INTO customers (id, companyName, taxId, email, country, plan, createdAt) VALUES (?,?,?,?,?,?,?)',
      ).run(
        customer.id,
        customer.companyName,
        customer.taxId,
        customer.email,
        customer.country,
        customer.plan,
        customer.createdAt,
      );
      return customer;
    },
    history: (id) =>
      db
        .prepare('SELECT * FROM simulations WHERE customerId=? ORDER BY createdAt DESC, rowid DESC')
        .all(id)
        .map((row) => ({ ...row, quote: JSON.parse(row.quote) })),
    save(data, quote) {
      const simulation = { id: randomUUID(), ...data, quote, createdAt: new Date().toISOString() };
      db.prepare('INSERT INTO simulations VALUES (?,?,?,?,?,?,?)').run(
        simulation.id,
        simulation.customerId,
        simulation.users,
        simulation.storageGb,
        simulation.apiCalls,
        JSON.stringify(quote),
        simulation.createdAt,
      );
      return simulation;
    },
  };
}

-- Core booking schema for the MB Autos workshop calendar.

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS customers_email_idx ON customers(email);

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  registration TEXT NOT NULL UNIQUE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  fuel_type TEXT,
  engine_cc INTEGER,
  year_of_manufacture INTEGER,
  mot_status TEXT,
  mot_expiry TEXT,
  colour TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS vehicles_customer_idx ON vehicles(customer_id);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'workshop',
  min_bays INTEGER NOT NULL DEFAULT 1,
  min_technicians INTEGER NOT NULL DEFAULT 1,
  price_pence INTEGER,
  active INTEGER NOT NULL DEFAULT 1,
  bookable INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS business_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  weekday TEXT NOT NULL UNIQUE,
  opens_at TEXT,
  closes_at TEXT,
  bookable INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  service_id INTEGER NOT NULL REFERENCES services(id),
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  bay_id INTEGER REFERENCES resources(id),
  technician_id INTEGER REFERENCES resources(id),
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS bookings_starts_at_idx ON bookings(starts_at);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);
CREATE INDEX IF NOT EXISTS bookings_customer_idx ON bookings(customer_id);

CREATE TABLE IF NOT EXISTS vehicle_lookup_cache (
  registration TEXT PRIMARY KEY,
  make TEXT,
  model TEXT,
  fuel_type TEXT,
  engine_cc INTEGER,
  year_of_manufacture INTEGER,
  mot_status TEXT,
  mot_expiry TEXT,
  colour TEXT,
  raw_json TEXT,
  expires_at INTEGER NOT NULL
);

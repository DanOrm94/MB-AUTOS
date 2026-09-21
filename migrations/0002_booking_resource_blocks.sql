CREATE TABLE IF NOT EXISTS booking_resource_blocks (
  booking_id INTEGER NOT NULL REFERENCES bookings(id),
  resource_id INTEGER NOT NULL REFERENCES resources(id),
  block_start TEXT NOT NULL,
  PRIMARY KEY(resource_id, block_start)
);
CREATE INDEX IF NOT EXISTS booking_resource_blocks_booking_idx ON booking_resource_blocks(booking_id);

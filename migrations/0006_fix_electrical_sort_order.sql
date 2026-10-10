-- The electrical service was seeded with sort_order 6, colliding with
-- brakes-tyres-clutches. Give it a distinct, higher order so the services
-- list is deterministic.
UPDATE services SET sort_order = 7 WHERE slug = 'electrical-aircon-batteries';

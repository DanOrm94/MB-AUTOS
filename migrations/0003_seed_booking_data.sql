-- Ensure the booking system has the workshop resources and opening hours
-- needed for availability calculations.

INSERT OR IGNORE INTO resources (id,name,type,active) VALUES
  (1,'Bay 1','bay',1),
  (2,'Bay 2','bay',1),
  (3,'Technician 1','technician',1);

INSERT OR IGNORE INTO business_hours (weekday,opens_at,closes_at,bookable) VALUES
  ('Monday','08:30','17:30',1),
  ('Tuesday','08:30','17:30',1),
  ('Wednesday','08:30','17:30',1),
  ('Thursday','08:30','17:30',1),
  ('Friday','08:30','17:30',1),
  ('Saturday',NULL,NULL,0),
  ('Sunday',NULL,NULL,0);

INSERT OR IGNORE INTO services
  (slug,name,duration_minutes,resource_type,min_bays,min_technicians,price_pence,active,bookable,sort_order)
VALUES
  ('mot-testing','MOT testing',60,'workshop',1,1,NULL,1,1,1),
  ('ev-servicing','EV MOT & servicing',120,'workshop',1,1,NULL,1,1,2),
  ('bodywork-paintwork','Bodywork & paintwork',240,'workshop',1,1,NULL,1,1,3),
  ('engine-rebuilds-timing-belts','Engine rebuilds & timing belts',360,'workshop',1,1,NULL,1,1,4),
  ('servicing-diagnostics','Servicing & diagnostics',120,'workshop',1,1,NULL,1,1,5),
  ('brakes-tyres-clutches','Brakes, tyres & clutches',180,'workshop',1,1,NULL,1,1,6);

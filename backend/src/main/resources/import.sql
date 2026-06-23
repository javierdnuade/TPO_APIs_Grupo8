-- Usuarios (passwords en claro; serán hasheadas al iniciar la app)
INSERT INTO usuarios (id, username, password, rol, puede_anular_credito, puede_anular_cobranza) VALUES
  (1, 'admin', 'password', 'ADMIN', FALSE, FALSE),
  (2, 'operador', 'password', 'USER', FALSE, FALSE);

-- Clientes
INSERT INTO clientes (dni, nombre) VALUES
  ('30111222', 'Ana Gomez'),
  ('28999111', 'Bruno Diaz'),
  ('33444555', 'Carla Mendez');

-- Creditos
INSERT INTO creditos (id, dni_cliente, deuda_original, fecha, importe_cuota, cantidad_cuotas, estado, anulado) VALUES
  (1, '30111222', 120000.00, DATE '2026-01-15', 10000.00, 12, FALSE, FALSE),
  (2, '28999111', 60000.00, DATE '2026-02-10', 10000.00, 6, FALSE, FALSE),
  (3, '33444555', 90000.00, DATE '2026-03-05', 15000.00, 6, FALSE, FALSE);

-- Cuotas de credito 1 (12 cuotas)
INSERT INTO cuotas (id_credito, id_cuota, fecha_vencimiento, pagada) VALUES
  (1, 1, DATE '2026-02-15', TRUE),
  (1, 2, DATE '2026-03-15', TRUE),
  (1, 3, DATE '2026-04-15', FALSE),
  (1, 4, DATE '2026-05-15', FALSE),
  (1, 5, DATE '2026-06-15', FALSE),
  (1, 6, DATE '2026-07-15', FALSE),
  (1, 7, DATE '2026-08-15', FALSE),
  (1, 8, DATE '2026-09-15', FALSE),
  (1, 9, DATE '2026-10-15', FALSE),
  (1, 10, DATE '2026-11-15', FALSE),
  (1, 11, DATE '2026-12-15', FALSE),
  (1, 12, DATE '2027-01-15', FALSE);

-- Cuotas de credito 2 (6 cuotas)
INSERT INTO cuotas (id_credito, id_cuota, fecha_vencimiento, pagada) VALUES
  (2, 1, DATE '2026-03-10', TRUE),
  (2, 2, DATE '2026-04-10', FALSE),
  (2, 3, DATE '2026-05-10', FALSE),
  (2, 4, DATE '2026-06-10', FALSE),
  (2, 5, DATE '2026-07-10', FALSE),
  (2, 6, DATE '2026-08-10', FALSE);

-- Cuotas de credito 3 (6 cuotas)
INSERT INTO cuotas (id_credito, id_cuota, fecha_vencimiento, pagada) VALUES
  (3, 1, DATE '2026-04-05', FALSE),
  (3, 2, DATE '2026-05-05', FALSE),
  (3, 3, DATE '2026-06-05', FALSE),
  (3, 4, DATE '2026-07-05', FALSE),
  (3, 5, DATE '2026-08-05', FALSE),
  (3, 6, DATE '2026-09-05', FALSE);

-- Cobranzas (cuotas pagadas)
INSERT INTO cobranzas (id, id_credito, id_cuota, importe, fecha, anulada) VALUES
  (1, 1, 1, 10000.00,'2026-04-25', FALSE),
  (2, 1, 2, 20000.00,'2026-05-25', FALSE),
  (3, 2, 1, 5000.00,'2026-06-20', FALSE);

-- Ajuste de secuencias identity para evitar colisiones al insertar nuevos datos
ALTER TABLE usuarios ALTER COLUMN id RESTART WITH 3;
ALTER TABLE creditos ALTER COLUMN id RESTART WITH 4;
ALTER TABLE cobranzas ALTER COLUMN id RESTART WITH 4;

-- Resumen de cambios SQL para Supabase
-- Ejecutar estos comandos para completar la configuración

-- ============================================
-- 1. ARREGLAR POLÍTICAS RLS DE PAGOS
-- ============================================
-- Este archivo está en: supabase/migrations/20260711080000_fix_pagos_rls.sql
-- 
-- Para ejecutar:
-- 1. Abre Supabase Dashboard > SQL Editor
-- 2. Copia todo el contenido de ese archivo
-- 3. Ejecuta en tu proyecto

-- El archivo corrige:
-- - Permitir que clientes creen sus propios pagos
-- - Permitir que clientes actualicen sus propios pagos
-- - Proteger que solo admins vean todos los pagos

-- ============================================
-- 2. VERIFICAR SCHEMA DE TABLAS PRINCIPALES
-- ============================================

-- Verificar que categoria_servicios existe:
-- SELECT * FROM information_schema.tables WHERE table_name = 'categoria_servicios';

-- Verificar que servicios tiene categoria_id:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'servicios' AND column_name = 'categoria_id';

-- Verificar que reservas tiene estado pendiente_pago:
-- SELECT DISTINCT estado FROM reservas;

-- Verificar que pagos tiene estructura correcta:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pagos';

-- ============================================
-- 3. ÚTILES PARA ADMINISTRACIÓN
-- ============================================

-- Ver todos los pagos de un cliente:
-- SELECT * FROM pagos WHERE cliente_id = 'user_id_here' ORDER BY fecha_pago DESC;

-- Ver todas las reservas pendientes de pago:
-- SELECT r.id, r.fecha, r.hora, s.nombre, p.nombre_completo 
-- FROM reservas r
-- JOIN servicios s ON r.servicio_id = s.id
-- JOIN peluqueros p ON r.peluquero_id = p.id
-- WHERE r.estado = 'pendiente_pago'
-- ORDER BY r.fecha ASC;

-- Ver ingresos por mes:
-- SELECT 
--   DATE_TRUNC('month', fecha_pago) as mes,
--   COUNT(*) as cantidad_pagos,
--   SUM(monto) as total_ingresos
-- FROM pagos
-- WHERE estado = 'pagado'
-- GROUP BY DATE_TRUNC('month', fecha_pago)
-- ORDER BY mes DESC;

-- Ver clientes más frecuentes:
-- SELECT 
--   p.nombre_completo,
--   p.email,
--   COUNT(r.id) as cantidad_reservas,
--   SUM(s.precio) as total_gastado
-- FROM profiles p
-- LEFT JOIN reservas r ON p.id = r.cliente_id
-- LEFT JOIN servicios s ON r.servicio_id = s.id
-- GROUP BY p.id
-- ORDER BY cantidad_reservas DESC;

-- ============================================
-- 4. BACKUP IMPORTANTE
-- ============================================
-- Antes de ejecutar cambios en producción:
-- 1. Ir a Supabase Dashboard > Settings > Backups
-- 2. Crear un backup manual
-- 3. Tomar nota del nombre del backup

-- ============================================
-- 5. NOTAS DE SEGURIDAD
-- ============================================
-- Las políticas RLS protegen:
-- - Clientes solo ven sus propias reservas y pagos
-- - Clientes solo pueden crear sus propios pagos
-- - Admins ven toda la información
-- - Las transacciones están protegidas por ACID

-- ============================================
-- 6. MONITOREO
-- ============================================
-- Revisar regularmente:
-- SELECT COUNT(*) FROM reservas WHERE estado = 'pendiente_pago' AND fecha < NOW();
-- SELECT COUNT(*) FROM pagos WHERE estado = 'pendiente';

-- ============================================
-- 7. MANTENIMIENTO
-- ============================================

-- Limpiar reservas antiguas canceladas (después de 6 meses):
-- DELETE FROM reservas 
-- WHERE estado = 'cancelada' AND created_at < NOW() - INTERVAL '6 months';

-- Vacuuming (mantener la DB optimizada):
-- VACUUM ANALYZE;

-- Insert ejemplo categorías
INSERT INTO public.categoria_servicios (nombre, descripcion, imagen_url, orden, estado) VALUES
('Cortes de Cabello', 'Descubre nuestras opciones de cortes modernos y clásicos', 'https://images.unsplash.com/photo-1559599810-46d1953a6310?w=500&h=400&fit=crop', 0, 'activo'),
('Coloración', 'Técnicas avanzadas de color y tinturas profesionales', 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=500&h=400&fit=crop', 1, 'activo'),
('Tratamientos Capilares', 'Restaura y nutre tu cabello con nuestros tratamientos premium', 'https://images.unsplash.com/photo-1570157139519-a95d156e3878?w=500&h=400&fit=crop', 2, 'activo'),
('Alisado y Planchado', 'Cabello liso, brillante y duradero', 'https://images.unsplash.com/photo-1597066300935-579e22a3fa6e?w=500&h=400&fit=crop', 3, 'activo'),
('Manicure y Pedicure', 'Cuidado experto de manos y pies', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=400&fit=crop', 4, 'activo'),
('Maquillaje', 'Maquillaje profesional para cualquier ocasión', 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&h=400&fit=crop', 5, 'activo')
ON CONFLICT DO NOTHING;

-- Get categoria IDs (we'll use them for services)
-- Note: In production, you should get the actual IDs from the inserted categories

-- Insert ejemplo servicios para "Cortes de Cabello"
INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT id, 'Corte', 'Corte moderno y personalizado con acabado profesional', 80.00, 45, 'https://images.unsplash.com/photo-1559599810-46d1953a6310?w=500&h=400&fit=crop', id, 0, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Cortes de Cabello'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Corte Bob', 'Clásico corte bob con capas y volumen', 85.00, 45, 'https://images.unsplash.com/photo-1535307671215-eba6d0cdeaf8?w=500&h=400&fit=crop', id, 1, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Cortes de Cabello'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Corte Mariposa', 'Corte vaporoso con movimiento y ligereza', 90.00, 50, 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&h=400&fit=crop', id, 2, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Cortes de Cabello'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Corte Pixie', 'Corte corto y moderno para rostros redondos o cuadrados', 75.00, 40, 'https://images.unsplash.com/photo-1584932917961-826c08ee6d45?w=500&h=400&fit=crop', id, 3, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Cortes de Cabello'
ON CONFLICT DO NOTHING;

-- Insert ejemplo servicios para "Coloración"
INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Coloración Completa', 'Tinte profesional con cobertura completa y duradero', 150.00, 120, 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=500&h=400&fit=crop', id, 0, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Coloración'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Balayage Moderno', 'Técnica de iluminación natural para efecto degradado', 200.00, 150, 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&h=400&fit=crop', id, 1, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Coloración'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Ombré Hair', 'Efecto de color gradual de oscuro a claro', 180.00, 140, 'https://images.unsplash.com/photo-1596703690583-8c9ec03fd66e?w=500&h=400&fit=crop', id, 2, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Coloración'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Mechas Californianas', 'Mechas modernas con luz natural', 170.00, 130, 'https://images.unsplash.com/photo-1592747697274-65a61a35c56c?w=500&h=400&fit=crop', id, 3, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Coloración'
ON CONFLICT DO NOTHING;

-- Insert ejemplo servicios para "Tratamientos Capilares"
INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Tratamiento Capilar Profundo', 'Mascarilla hidratante intensiva', 90.00, 60, 'https://images.unsplash.com/photo-1570157139519-a95d156e3878?w=500&h=400&fit=crop', id, 0, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Tratamientos Capilares'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Botox Capilar', 'Reconstrucción profunda con proteínas y queratina', 120.00, 90, 'https://images.unsplash.com/photo-1583881298891-b3a2f2311838?w=500&h=400&fit=crop', id, 1, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Tratamientos Capilares'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Lamina de Keratina', 'Alisado temporal con keratina de alta calidad', 110.00, 80, 'https://images.unsplash.com/photo-1582505266477-8ac77dca07f5?w=500&h=400&fit=crop', id, 2, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Tratamientos Capilares'
ON CONFLICT DO NOTHING;

-- Insert ejemplo servicios para "Alisado y Planchado"
INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Alisado Brasileño', 'Tratamiento alisador permanente y duradero', 180.00, 180, 'https://images.unsplash.com/photo-1597066300935-579e22a3fa6e?w=500&h=400&fit=crop', id, 0, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Alisado y Planchado'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Planchado Clásico', 'Planchado temporal con plancha de calidad profesional', 60.00, 50, 'https://images.unsplash.com/photo-1522338242992-94a2893ba3a7?w=500&h=400&fit=crop', id, 1, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Alisado y Planchado'
ON CONFLICT DO NOTHING;

-- Insert ejemplo servicios para "Manicure y Pedicure"
INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Manicure Gel', 'Gel resistente con acabado impecable', 65.00, 60, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=400&fit=crop', id, 0, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Manicure y Pedicure'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Pedicure Spa', 'Cuidado relajante para los pies con masaje', 75.00, 70, 'https://images.unsplash.com/photo-1604302307066-81342ee5ff30?w=500&h=400&fit=crop', id, 1, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Manicure y Pedicure'
ON CONFLICT DO NOTHING;

-- Insert ejemplo servicios para "Maquillaje"
INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Maquillaje Profesional', 'Maquillaje artístico para eventos especiales', 120.00, 90, 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&h=400&fit=crop', id, 0, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Maquillaje'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Maquillaje de Novia', 'Maquillaje perfecto para tu día especial', 150.00, 120, 'https://images.unsplash.com/photo-1578926078328-123a79edd688?w=500&h=400&fit=crop', id, 1, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Maquillaje'
ON CONFLICT DO NOTHING;

INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, categoria_id, orden, estado)
SELECT 'Maquillaje Diario', 'Maquillaje natural y elegante para uso diario', 80.00, 60, 'https://images.unsplash.com/photo-1579065413295-3e5fb4cd91a4?w=500&h=400&fit=crop', id, 2, 'activo'
FROM public.categoria_servicios WHERE nombre = 'Maquillaje'
ON CONFLICT DO NOTHING;

-- Actualizar servicios con imágenes de internet
-- Reemplaza los imagen_url con URLs reales de servicios de salón

-- Si aún no tienes servicios en la BD, puedes usar este INSERT:
INSERT INTO public.servicios (nombre, descripcion, precio, duracion_min, imagen_url, estado) VALUES
('Corte de Cabello Premium', 'Corte personalizado con técnicas modernas y acabado profesional', 80.00, 45, 'https://images.unsplash.com/photo-1559599810-46d1953a6310?w=500&h=400&fit=crop', 'activo'),
('Coloración Completa', 'Tinte profesional con pigmentos de calidad para un color duradero', 150.00, 120, 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=500&h=400&fit=crop', 'activo'),
('Balayage Moderno', 'Técnica de iluminación natural para un efecto degradado y dimensional', 200.00, 150, 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&h=400&fit=crop', 'activo'),
('Alisado Brasileño', 'Tratamiento alisador para cabello liso, suave y brillante', 180.00, 180, 'https://images.unsplash.com/photo-1597066300935-579e22a3fa6e?w=500&h=400&fit=crop', 'activo'),
('Tratamiento Capilar Profundo', 'Mascarilla hidratante intensiva para restaurar y nutrir el cabello', 90.00, 60, 'https://images.unsplash.com/photo-1570157139519-a95d156e3878?w=500&h=400&fit=crop', 'activo'),
('Manicure Gel Premium', 'Manicura con gel resistente y acabado impecable', 65.00, 60, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=400&fit=crop', 'activo'),
('Maquillaje Profesional', 'Maquillaje artístico para eventos, bodas o uso diario', 120.00, 90, 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&h=400&fit=crop', 'activo');

-- O si ya existen servicios, actualiza sus imágenes con UPDATE:
-- UPDATE public.servicios SET imagen_url = 'https://images.unsplash.com/photo-1559599810-46d1953a6310?w=500&h=400&fit=crop' WHERE nombre = 'Corte de Cabello Premium';

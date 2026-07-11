#!/bin/bash
# Script para aplicar la migración RLS de pagos

echo "🚀 Aplicando migración RLS de pagos..."
echo ""
echo "Opción 1: Automáticamente (requiere Supabase CLI)"
echo "npx supabase migration up"
echo ""
echo "Opción 2: Manualmente en Supabase Dashboard"
echo "1. Ve a: https://app.supabase.com"
echo "2. Selecciona tu proyecto"
echo "3. Abre SQL Editor"
echo "4. Copia el contenido de supabase/migrations/20260711080000_fix_pagos_rls.sql"
echo "5. Pega el SQL en el editor"
echo "6. Ejecuta (Ctrl+Enter)"
echo ""
echo "✅ Para verificar que la migración fue aplicada:"
echo "SELECT * FROM pg_policies WHERE tablename = 'pagos';"

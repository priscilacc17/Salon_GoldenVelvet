# 📋 Checklist de Verificación - Salón Golden Velvet

## ✅ Verificación de Cambios

### Panel de Administración - Servicios

- [ ] **Categorías**: La lista de categorías se carga correctamente desde `categoria_servicios` (no desde `servicios`)
- [ ] **Crear Categoría**: El botón "Nueva Categoría" abre un formulario
- [ ] **Formulario de Categoría**: Incluye campos: Nombre, Descripción, URL de Imagen, Orden
- [ ] **Guardar Categoría**: Se puede crear una nueva categoría correctamente
- [ ] **Editar Categoría**: Se abre el formulario en la posición correcta (no en el top de la página)
- [ ] **Orden de Categoría**: El campo de orden se guarda correctamente
- [ ] **Expandir Categoría**: Se puede expandir para ver servicios dentro
- [ ] **Crear Servicio**: El botón "Nuevo Servicio" abre un formulario dentro de la categoría
- [ ] **Formulario de Servicio**: Se muestra en la posición correcta (no con scroll limitado)
- [ ] **Crear Servicio**: Se puede crear un nuevo servicio correctamente
- [ ] **Editar Servicio**: Se puede abrir el formulario de edición
- [ ] **Eliminar Servicio**: Se puede eliminar un servicio
- [ ] **Eliminar Categoría**: Se puede eliminar una categoría (y sus servicios)

### Panel de Administración - Clientes

- [ ] **Ver Clientes**: Se muestran todos los clientes registrados en una tabla
- [ ] **Columnas**: Nombre, DNI, Email, Teléfono, Dirección, Nacimiento, Auth, Estado, Registro, Acciones
- [ ] **Crear Cliente**: El botón "Nuevo Cliente" abre un formulario
- [ ] **Formulario de Cliente**: Incluye campos: Nombre, DNI, Email, Teléfono, Dirección, Fecha Nacimiento, Estado
- [ ] **Guardar Cliente**: Se puede crear un nuevo cliente correctamente
- [ ] **Editar Cliente**: Se puede editar un cliente existente
- [ ] **Desactivar Cliente**: Se puede cambiar el estado a "inactivo"
- [ ] **Validación**: El email es obligatorio
- [ ] **Validación**: El nombre es obligatorio

### Reservas de Cliente

- [ ] **Mis Reservas**: Se muestran todas las reservas del cliente
- [ ] **Estado**: Se muestran los diferentes estados (pendiente_pago, confirmada, etc.)
- [ ] **Botón Pago**: Para reservas "pendiente_pago", aparece botón "Completar Pago"
- [ ] **Completar Pago**: Al hacer clic, se registra el pago y cambia a "confirmada"
- [ ] **Descargar PDF**: Para reservas "confirmada", aparece botón "Descargar PDF"
- [ ] **PDF**: Se descarga correctamente con el nombre `comprobante-XXXXX.pdf`
- [ ] **PDF Contenido**: Incluye datos del cliente, servicio, monto, fecha, estado

### Flujo de Reserva

- [ ] **Paso 0**: Seleccionar servicio se muestra correctamente
- [ ] **Paso 1**: Seleccionar peluquera se muestra correctamente
- [ ] **Paso 2**: Seleccionar fecha y hora se muestra correctamente
- [ ] **Paso 3**: Confirmar reserva con todos los detalles
- [ ] **Paso 4**: Formulario de pago con métodos (Tarjeta, Yape, Plin)
- [ ] **Paso 5**: NUEVO - Descargar comprobante después de pagar
- [ ] **Descargar Comprobante**: Botón "Descargar Comprobante" funciona en paso 5
- [ ] **Ver Mis Reservas**: Botón para ir a la página de reservas desde paso 5

### PDF de Comprobante

- [ ] **Diseño**: El PDF tiene un diseño profesional con logo y colores del salón
- [ ] **Datos**: Incluye número de comprobante (primeros 8 caracteres del ID)
- [ ] **Fecha**: Muestra la fecha del pago
- [ ] **Cliente**: Muestra nombre del cliente
- [ ] **Servicio**: Muestra nombre del servicio
- [ ] **Monto**: Muestra el monto pagado con 2 decimales
- [ ] **Método**: Muestra el método de pago seleccionado
- [ ] **Estado**: Muestra "Pagado" en verde

### Permisos de Pagos (RLS)

- [ ] **Crear Pago**: Un cliente autenticado puede crear un pago sin errores
- [ ] **Leer Pago**: Un cliente solo ve sus propios pagos
- [ ] **Admin**: El admin puede ver todos los pagos
- [ ] **Sin Errores**: No hay errores "violates row level security policy"

### Pedidos Personalizados

- [ ] **Página**: Se abre la página de pedidos personalizados
- [ ] **Textarea**: Se puede escribir la descripción (máximo 500 caracteres)
- [ ] **Botón**: Existe el botón "Enviar por WhatsApp"
- [ ] **WhatsApp**: Al hacer clic, abre WhatsApp con el mensaje pre-llenado
- [ ] **Número**: El número de WhatsApp es correcto (51938970992)

### Google Auth

- [ ] **Botón**: En la página de login, existe el botón "Continuar con Google"
- [ ] **Credenciales**: Google Cloud Console tiene Client ID y Secret configurados
- [ ] **Supabase**: Supabase tiene Google Auth habilitado
- [ ] **URLs**: Las URLs de redirección están configuradas correctamente
- [ ] **Login**: Se puede iniciar sesión con Google
- [ ] **Perfil**: Se crea el perfil automáticamente después del login con Google

### Base de Datos

- [ ] **Tabla categoria_servicios**: Existe y tiene datos
- [ ] **Foreign Key**: servicios.categoria_id referencia categoria_servicios.id
- [ ] **RLS**: Las políticas de pagos están actualizadas
- [ ] **Trigger**: El trigger handle_new_user() funciona para crear perfiles

### Errores de Compilación

- [ ] **Sin errores**: No hay errores TypeScript en la consola
- [ ] **Sin warnings**: No hay warnings significativos
- [ ] **Build**: El build produce sin errores: `npm run build`

## 🔧 Pasos de Corrección Si Algo Falla

### Si las categorías no se ven:
```bash
# 1. Verifica que el query sea correcto
# 2. Revisa la consola del navegador (F12)
# 3. Ejecuta en Supabase SQL Editor:
SELECT COUNT(*) FROM categoria_servicios;
```

### Si no se puede crear un pago:
```bash
# 1. Ejecuta la migración RLS:
# supabase/migrations/20260711080000_fix_pagos_rls.sql

# 2. Verifica que el usuario esté autenticado
# 3. Revisa los logs de Supabase
```

### Si el PDF no se descarga:
```bash
# 1. Verifica que jspdf y html2canvas estén instalados:
npm list jspdf html2canvas

# 2. Si falta algo, reinstala:
npm install jspdf html2canvas
```

### Si Google Auth no funciona:
```bash
# 1. Sigue los pasos en GOOGLE_AUTH_SETUP.md
# 2. Verifica que el Client ID sea correcto (no el Secret)
# 3. Verifica que las URLs de redirección sean exactas
# 4. Revisa los logs de autenticación en Supabase
```

## 📊 Métricas de Éxito

- ✅ 0 errores de compilación
- ✅ Todas las funcionalidades de CRUD funcionan
- ✅ Los PDFs se descargan correctamente
- ✅ Los pagos se registran sin errores RLS
- ✅ Google Auth está configurado y funciona
- ✅ Los clientes pueden reservar citas completas
- ✅ Los admins pueden gestionar todos los servicios y clientes

## 📞 Soporte

Si algo no funciona:

1. Revisa `CAMBIOS_REALIZADOS.md` para ver qué se cambió
2. Revisa `GOOGLE_AUTH_SETUP.md` para configurar Google Auth
3. Revisa `SQL_GUIDE.md` para comandos útiles de base de datos
4. Abre la consola de desarrollador (F12) para ver errores
5. Revisa los logs de Supabase en el dashboard

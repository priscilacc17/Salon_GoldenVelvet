# Configuración de Google OAuth en Supabase

## Pasos para habilitar Google Authentication

### 1. Obtener credenciales de Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto (o selecciona uno existente)
3. Habilita la API de Google+ (o busca "Google+ API")
4. Ve a "Credenciales" en el menú izquierdo
5. Clic en "Crear credenciales" > "ID de cliente OAuth 2.0"
6. Selecciona "Aplicación web" como tipo de aplicación
7. Agrega las siguientes URLs autorizadas en "Orígenes de JavaScript autorizados":
   - `http://localhost:5173` (desarrollo)
   - `https://hdagbgxumbskxaetqqhq.supabase.co` (Supabase)
   - Tu dominio de producción

8. Agrega estas URLs en "URIs de redirección autorizados":
   - `https://hdagbgxumbskxaetqqhq.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback` (desarrollo)

9. Copia el **Client ID** y el **Client Secret**

### 2. Configurar en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com/)
2. Ve a **Authentication** > **Providers**
3. Busca **Google** y haz clic en él
4. Habilita el provider
5. Pega el **Client ID** en el campo correspondiente
6. Pega el **Client Secret** en el campo correspondiente
7. Guarda los cambios

### 3. Configurar en tu aplicación

La configuración de la aplicación ya está lista en estos archivos:
- `src/routes/auth.tsx` - Maneja el botón de Google Sign In
- `src/integrations/lovable/index.ts` - Configura la integración con Lovable

### 4. Probar la funcionalidad

1. Inicia la aplicación: `npm run dev`
2. Ve a la página de autenticación
3. Haz clic en "Continuar con Google"
4. Deberías ser redirigido a Google para autenticarte
5. Después de autenticarte, se creará tu perfil automáticamente

## Solución de problemas

### Error: "Redirect URI mismatch"
- Verifica que las URLs de redirección en Google Cloud coincidan exactamente con las configuradas en Supabase
- La URL debe incluir la ruta completa: `https://hdagbgxumbskxaetqqhq.supabase.co/auth/v1/callback`

### Error: "Invalid client"
- Verifica que el Client ID sea el correcto (no el Client Secret)
- Asegúrate de haber copiado sin espacios en blanco

### No se crea el perfil automáticamente
- Verifica que el trigger `handle_new_user()` esté habilitado en la base de datos
- Revisa los logs de Supabase para ver si hay errores

## Más información

- [Documentación de Google OAuth en Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)

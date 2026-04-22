# Flujo de Autenticación — M4

Documentación del flujo de login/logout y protección admin implementado en M4.

---

## Rutas Involucradas

```
/negocios/[slug]/login              → Página pública de login
/negocios/[slug]/admin              → Dashboard admin protegido
/negocios/[slug]/(admin)/layout.tsx → Layout con guard y sidebar
```

---

## Componentes Principales

### 1. **Actions** — `actions/auth.ts`

Server Actions con firma compatible con React 19 `useActionState`:

- **`loginAction(slug, prevState, formData)`**
  - Valida email y password
  - Llama a `supabase.auth.signInWithPassword()`
  - Devuelve `{ error }` si falla
  - Redirige a `/negocios/[slug]/admin` si tiene éxito

- **`logoutAction(slug)`**
  - Llama a `supabase.auth.signOut()`
  - Invalida la sesión
  - Redirige a `/negocios/[slug]/login`

### 2. **Client Component** — `login/login-form.tsx`

Renderiza el formulario de login:
- Usa `useActionState(loginAction.bind(null, slug))`
- Muestra error desde `state.error`
- Deshabilita campos mientras `isPending`
- Cambia botón a "Verificando…" mientras se procesa

### 3. **Middlewares y Guards**

#### **Proxy** — `proxy.ts`
- Guard **optimista** (cookie-based, sin red)
- Actúa en rutas `/negocios/*`
- Si `/admin`: verifica sesión en cookie
- Si sin sesión: redirige a login
- **Nuevo en M4.5**: `Cache-Control: no-store` en admin para evitar caché del navegador

#### **Admin Layout** — `(admin)/layout.tsx`
- Guard **seguro** (verifica JWT contra servidor)
- Usa `getUser()` que valida contra Supabase
- Si no hay usuario: `redirect()` a login
- Renderiza sidebar con email + botón logout

---

## Flujos de Usuario

### ✅ Login Exitoso

```
1. Usuario llega a /negocios/[slug]/login
   ↓
2. getUser() → null → muestra formulario
   ↓
3. Ingresa email + password
   ↓
4. loginAction valida con Supabase
   ↓
5. Session creada
   ↓
6. redirect() a /negocios/[slug]/admin
   ↓
7. Admin layout: getUser() → user (válido)
   ↓
8. ✓ Acceso permitido
```

### ❌ Login Fallido

```
1. Usuario ingresa credenciales incorrectas
   ↓
2. loginAction devuelve { error: "Credenciales inválidas..." }
   ↓
3. state.error se muestra en la UI
   ↓
4. Formulario permanece visible para reintentar
```

### 🔓 Sin Autenticación → Admin

```
1. Usuario intenta entrar a /negocios/[slug]/admin
   ↓
2. Proxy: getSession() → null
   ↓
3. Redirige a /negocios/[slug]/login
   ↓
4. Usuario ve formulario de login
```

### 🔐 Con Autenticación → Login

```
1. Usuario autenticado entra a /negocios/[slug]/login
   ↓
2. getUser() → user (válido)
   ↓
3. redirect() a /negocios/[slug]/admin
   ↓
4. No ve el formulario de login
```

### 🚪 Logout

```
1. Usuario hace click en "Cerrar sesión"
   ↓
2. Form action → logoutAction(slug)
   ↓
3. Server: supabase.auth.signOut()
   ↓
4. Session invalidada
   ↓
5. redirect() a /negocios/[slug]/login
   ↓
6. Cache-Control: no-store previene que botón atrás muestre admin
```

---

## Capas de Protección

| Capa | Ubicación | Tipo | Verificación |
|------|-----------|------|--------------|
| 1️⃣ **Optimista** | `proxy.ts` | Cookie | Rápida, sin red |
| 2️⃣ **Segura** | `(admin)/layout.tsx` | JWT + servidor | Autoridades, válida contra Supabase |

Ambas deben pasar. Proxy es primera línea, layout es segunda línea defensiva.

---

## Headers de Caché

**M4.5 — Prevenir exposición post-logout:**

```javascript
// En proxy.ts, cuando el usuario está autenticado:
response.headers.set('Cache-Control', 'no-store')
```

Esto asegura que:
- El navegador NO cachea respuestas del admin
- Tras logout → botón atrás NO muestra HTML protegido
- Cualquier navegación requiere nuevas requests al servidor

---

## Estado Temporal vs Refinado

| Aspecto | M4 (Ahora) | M5+ (Futuro) |
|--------|-----------|------------|
| **Login UI** | Minimal, solo email + password | Refinada, branding, validación mejorada |
| **Dashboard** | Placeholder con módulos | CRUD reales, estadísticas, gráficos |
| **Errors** | Mensajes amigables simples | Categorización de errores, logs |
| **Sessions** | Supabase SSR | Posible refinamiento de duración |
| **Roles** | Sin roles aún | Superadmin, roles por tenant |
| **2FA** | No implementado | Considerado para M7+ |

---

## Checklist para Validar M4

- [ ] `/negocios/[slug]/login` sin autenticación muestra formulario
- [ ] Login válido redirige a `/negocios/[slug]/admin`
- [ ] Login inválido muestra error amigable
- [ ] Usuario autenticado en login se redirige a admin
- [ ] Sin autenticación en admin redirige a login
- [ ] Botón "Cerrar sesión" funciona
- [ ] Post-logout → `/negocios/[slug]/login` carga
- [ ] Botón atrás tras logout NO expone admin
- [ ] Build limpio (`npm run build`)

---

## Archivos Clave

```
actions/
  └── auth.ts                                 ← Server Actions login/logout

app/negocios/[slug]/
  ├── login/
  │   ├── page.tsx                           ← Página pública, redirige si autenticado
  │   └── login-form.tsx                     ← Client Component con useActionState
  │
  └── (admin)/
      ├── layout.tsx                         ← Guard seguro + sidebar
      └── admin/
          └── page.tsx                       ← Dashboard placeholder

proxy.ts                                      ← Guard optimista + Cache-Control

lib/auth/index.ts                            ← getUser(), isAuthenticated()
```

---

**Siguiente fase: M5 — Sitio público base (layout + home)**

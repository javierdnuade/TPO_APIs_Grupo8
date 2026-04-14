# Detalle del DER — TPO APIs Grupo 8

## 1) Alcance del modelo

El DER representa dos dominios:

1. **Dominio de negocio (créditos y cobranzas)**  
   `CLIENTES`, `CREDITOS`, `CUOTAS`, `COBRANZAS`
2. **Dominio de seguridad (autenticación JWT)**  
   `USUARIOS`

No existen relaciones físicas entre ambos dominios en la base de datos actual.

---

## 2) Entidades y atributos

### CLIENTES
- **Tabla:** `clientes`
- **PK:** `dni` (`VARCHAR(15)`)
- **Campos:**
  - `dni`: identificador natural del cliente.
  - `nombre`: `NOT NULL`.
- **Relaciones:**
  - 1 cliente puede tener 0..N créditos.

### CREDITOS
- **Tabla:** `creditos`
- **PK:** `id` (`BIGINT`, `IDENTITY`)
- **FK:** `dni_cliente` → `clientes.dni` (`NOT NULL`)
- **Campos:**
  - `deuda_original`: `DECIMAL(12,2)`, `NOT NULL`.
  - `fecha`: `DATE`, `NOT NULL`.
  - `importe_cuota`: `DECIMAL(12,2)`, `NOT NULL`.
  - `cantidad_cuotas`: `INT`, `NOT NULL`, validación mínima lógica `>= 1`.
- **Relaciones:**
  - N créditos pertenecen a 1 cliente.
  - 1 crédito tiene 1..N cuotas (se generan automáticamente al crear crédito).

### CUOTAS
- **Tabla:** `cuotas`
- **PK compuesta:** (`id_credito`, `id_cuota`)
  - Definida con `@EmbeddedId` (`CuotaId`).
- **FK:** `id_credito` → `creditos.id`.
- **Campos:**
  - `fecha_vencimiento`: `DATE`, `NOT NULL`.
- **Relaciones:**
  - N cuotas pertenecen a 1 crédito.
  - 1 cuota puede tener 0..N cobranzas en el esquema físico.

### COBRANZAS
- **Tabla:** `cobranzas`
- **PK:** `id` (`BIGINT`, `IDENTITY`)
- **FK compuesta:** (`id_credito`, `id_cuota`) → `cuotas(id_credito, id_cuota)`
- **Campos:**
  - `importe`: `DECIMAL(12,2)`, `NOT NULL`.
- **Relaciones:**
  - N cobranzas corresponden a 1 cuota.

### USUARIOS
- **Tabla:** `usuarios`
- **PK:** `id` (`BIGINT`, `IDENTITY`)
- **Campos:**
  - `username`: `UNIQUE`, `NOT NULL`.
  - `password`: `NOT NULL` (almacenada encriptada con BCrypt en la app).
  - `rol`: `NOT NULL`, enum persistido como texto (`ADMIN`, `USER`).
- **Relaciones:**
  - Sin FK a tablas de negocio en el modelo actual.

---

## 3) Cardinalidades del modelo

1. `CLIENTES (1) ── (0..N) CREDITOS`
2. `CREDITOS (1) ── (1..N) CUOTAS`
3. `CUOTAS (1) ── (0..N) COBRANZAS` *(físico)*

> Regla de negocio implementada: para una cuota específica, la aplicación evita registrar más de una cobranza.  
> Esto está validado en servicio (`existsByCuotaIdIdCreditoAndCuotaIdIdCuota`) y no por una restricción `UNIQUE` explícita en la tabla.

---

## 4) Reglas y decisiones de modelado relevantes

- **Clave natural en CLIENTES:** se usa `dni` como PK.
- **Clave surrogate en CREDITOS/COBRANZAS/USUARIOS:** `id` autogenerado.
- **PK compuesta en CUOTAS:** permite identificar cada cuota por su número dentro del crédito.
- **Integridad referencial de COBRANZAS:** se mantiene con FK compuesta hacia la PK compuesta de `CUOTAS`.
- **Separación seguridad-negocio:** usuarios/autenticación desacoplados de entidades operativas.

---

## 5) Lectura funcional del DER

1. Se crea un **cliente**.
2. Se crea un **crédito** para ese cliente.
3. Al crear el crédito, se generan sus **cuotas**.
4. Cuando se paga una cuota, se registra una **cobranza** asociada a esa cuota.
5. Los **usuarios** solo controlan acceso/autorización a la API.

Este flujo coincide con la estructura relacional y con la lógica de servicios del backend.

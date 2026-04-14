# Esquema DER — TPO APIs Grupo 8

```mermaid
erDiagram
    CLIENTES {
        VARCHAR(15) dni PK
        VARCHAR nombre "NOT NULL"
    }

    CREDITOS {
        BIGINT id PK "IDENTITY"
        VARCHAR(15) dni_cliente FK "NOT NULL -> CLIENTES.dni"
        DECIMAL(12,2) deuda_original "NOT NULL"
        DATE fecha "NOT NULL"
        DECIMAL(12,2) importe_cuota "NOT NULL"
        INT cantidad_cuotas "NOT NULL, MIN 1"
    }

    CUOTAS {
        BIGINT id_credito PK,FK "-> CREDITOS.id"
        INT id_cuota PK
        DATE fecha_vencimiento "NOT NULL"
    }

    COBRANZAS {
        BIGINT id PK "IDENTITY"
        BIGINT id_credito FK "NOT NULL -> CUOTAS.id_credito"
        INT id_cuota FK "NOT NULL -> CUOTAS.id_cuota"
        DECIMAL(12,2) importe "NOT NULL"
    }

    USUARIOS {
        BIGINT id PK "IDENTITY"
        VARCHAR username "UNIQUE, NOT NULL"
        VARCHAR password "NOT NULL"
        VARCHAR rol "ENUM STRING: ADMIN | USER, NOT NULL"
    }

    CLIENTES ||--o{ CREDITOS : "posee"
    CREDITOS ||--|{ CUOTAS : "genera"
    CUOTAS ||--o{ COBRANZAS : "registra pagos"
```

## Notas del esquema

- `CUOTAS` usa clave primaria compuesta (`id_credito`, `id_cuota`) mediante `@EmbeddedId`.
- `COBRANZAS` referencia a `CUOTAS` con FK compuesta (`id_credito`, `id_cuota`) mediante `@JoinColumns`.
- `USUARIOS` no tiene relaciones FK con las tablas de negocio (autenticación/autorización separada).
- A nivel de lógica de negocio, solo se permite una cobranza por cuota (validado en servicio).

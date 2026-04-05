<div align="center">
  <h1>Apex Finance</h1>
  <p><strong>Plataforma de inteligencia financiera dual-mode</strong></p>

  ![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?style=flat-square&logo=tailwindcss)
  ![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pg-336791?style=flat-square&logo=postgresql)
</div>

---

## ¿Qué es Apex Finance?

**Apex Finance** es una plataforma de inteligencia financiera personal y profesional construida con Next.js 14. Permite gestionar transacciones, categorías, objetivos financieros y genera reportes con gráficos interactivos. Cuenta con un sistema de **workspaces dual-mode** que diferencia entre finanzas personales y corporativas.

---

## Características principales

- **Dashboard (Command Center)** — KPIs en tiempo real, gráfico de flujo de caja y donut de categorías
- **Ledger Journal** — Historial completo de transacciones con búsqueda y filtros por categoría
- **Strategic Objectives** — Seguimiento de metas financieras con barras de progreso
- **Reports** — Gráficos de barras de ingresos vs gastos por día, semana o mes, con exportación a **PDF**
- **Apex Intelligence** — Panel de asesoramiento financiero contextual
- **Workspaces** — Modo personal (verde) y profesional (azul) con temática dinámica

---

## 🛠️ Stack tecnológico

| Capa        | Tecnología                          |
|-------------|--------------------------------------|
| Framework   | Next.js 14 (App Router)              |
| Lenguaje    | TypeScript 5                         |
| Estilos     | Tailwind CSS + Radix UI              |
| ORM         | Drizzle ORM                          |
| Base de datos | PostgreSQL (via `pg`)              |
| Gráficos    | Recharts                             |
| Exportación | jsPDF + jspdf-autotable              |
| Validación  | Zod                                  |
| Iconos      | Lucide React                         |

---

## 📊 Esquema de Base de Datos

El siguiente diagrama muestra la estructura de la base de datos PostgreSQL gestionada con Drizzle ORM:

```mermaid
erDiagram
    users ||--o{ workspaces : "posee"
    users ||--o{ financial_goals : "seguimiento"
    workspaces ||--o{ categories : "contiene"
    workspaces ||--o{ projects : "gestiona"
    workspaces ||--o{ transactions : "registra"
    categories ||--o{ categories : "subcategoría de"
    categories ||--o{ transactions : "clasifica"
    projects ||--o{ transactions : "asociado a"

    users {
        bigint id PK
        string name
        string email UK
        timestamp created_at
    }

    workspaces {
        bigint id PK
        bigint user_id FK
        string name
        boolean is_professional
        string currency
    }

    categories {
        bigint id PK
        bigint workspace_id FK
        string name
        numeric monthly_budget
        bigint parent_id FK
        boolean is_project
    }

    financial_goals {
        bigint id PK
        bigint user_id FK
        string name
        numeric target_amount
        numeric current_amount
        date deadline
    }

    projects {
        bigint id PK
        bigint workspace_id FK
        string name
        string description
    }

    transactions {
        bigint id PK
        bigint workspace_id FK
        bigint category_id FK
        numeric amount
        string description
        boolean is_essential
        date date
        bigint project_id FK
    }
```


---

## Instalación y uso

### Pre-requisitos

- Node.js 18+
- PostgreSQL corriendo localmente o en la nube

### 1. Clona el repositorio

```bash
git clone https://github.com/dferram/Apex-Finance.git
cd Apex-Finance
```

### 2. Instala las dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Configura las variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/apex_finance
```

### 4. Ejecuta las migraciones de la base de datos

```bash
npx drizzle-kit push
```

### 5. Inicia el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx              # Dashboard principal (Command Center)
│   ├── transactions/         # Ledger Journal
│   ├── goals/                # Strategic Objectives
│   ├── reports/              # Reportes y exportación PDF
│   ├── insights/             # Apex Intelligence
│   └── actions/              # Server Actions (CRUD con Drizzle)
├── components/
│   ├── dashboard/            # KPICards, CashFlowChart, CategoryDonut...
│   ├── layout/               # Header, Sidebar
│   ├── transactions/         # TransactionDialog, CategoryDialog
│   ├── goals/                # GoalDialog
│   ├── insights/             # ApexInsights
│   └── ui/                   # Componentes base (shadcn/ui)
├── context/
│   └── ApexContext.tsx       # Estado global de la app
├── db/                       # Configuración de Drizzle
├── lib/                      # Schema, utils, helpers
└── types/                    # Tipos TypeScript globales
```

---

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter ESLint
```

---

---

## 🤝 Guía para Colaboradores

Si deseas clonar este repositorio y trabajar en conjunto, sigue estas pautas:

### 1. Preparación del Entorno
- Asegúrate de tener **PostgreSQL** instalado y una base de datos vacía llamada `apex_finance`.
- Copia el archivo `.env.local` (si se proporciona) o crea uno nuevo siguiendo la sección de [Instalación](#instalación-y-uso).

### 2. Restauración de Datos (Opcional)
Si deseas empezar con datos de prueba o la estructura exacta del autor, puedes importar el archivo `backup.sql`:
```bash
psql -U tu_usuario -d apex_finance < backup.sql
```

### 3. Workflow de Desarrollo
- **Ramas**: Crea una rama para cada nueva característica (`feature/nombre-mejora`).
- **Base de Datos**: Si realizas cambios en el esquema (`src/lib/schema.ts`), recuerda generar y ejecutar las migraciones con:
  ```bash
  npx drizzle-kit generate
  npx drizzle-kit push
  ```
- **Linter**: Antes de hacer commit, asegúrate de que el código pase el linter: `npm run lint`.

### 4. Estructura de Carpetas Clave
- `src/app/actions`: Lógica de servidor y mutaciones de BD.
- `src/components`: UI modular siguiendo principios de Atomic Design.
- `src/context`: Estado global para el manejo de workspaces y filtros.
- `src/lib`: Definición del esquema de BD y utilidades compartidas.

---

## Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras algún bug o tienes una idea de mejora, abre un issue o un pull request.

---

## Licencia

Este proyecto es privado. Todos los derechos reservados © 2026 xCore.

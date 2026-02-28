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

## Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras algún bug o tienes una idea de mejora, abre un issue o un pull request.

---

## Licencia

Este proyecto es privado. Todos los derechos reservados © 2026 xCore.

// ============================================================
//  AGREGAR ESTAS RUTAS AL router/index.ts DEL PROYECTO
// ============================================================
//
//  Copia estas rutas dentro del array `routes` de tu router.
//  Ajusta el meta.role según el sistema de autenticación existente.
// ============================================================

import CalendarView from "../views/CalendarView.vue";
import ScheduleVisitView from "../views/ScheduleVisitView.vue";
import PropertiesClientView from "../views/PropertiesClientView.vue";

// ── Rutas a agregar en el array routes ──────────────────────

export const visitCalendarRoutes = [
  // HU1: Calendario compartido del equipo (solo agentes)
  {
    path: "/calendar",
    name: "Calendar",
    component: CalendarView,
    meta: {
      requiresAuth: true,
      roles: ["ADMIN", "AGENT", "SUPERVISOR"],
      title: "Calendario del equipo",
    },
  },

  // HU2: Programar visita (solo agentes)
  {
    path: "/schedule-visit",
    name: "ScheduleVisit",
    component: ScheduleVisitView,
    meta: {
      requiresAuth: true,
      roles: ["AGENT", "ADMIN"],
      title: "Programar visita",
    },
  },

  // HU3: Portal cliente — ver propiedades disponibles y solicitar cita
  {
    path: "/properties",
    name: "Properties",
    component: PropertiesClientView,
    meta: {
      requiresAuth: true,
      roles: ["CLIENT"],
      title: "Propiedades disponibles",
    },
  },
];

// ============================================================
//  EJEMPLO de cómo integrarlo en tu router/index.ts:
//
//  import { visitCalendarRoutes } from './visitCalendarRoutes'
//
//  const router = createRouter({
//    history: createWebHistory(),
//    routes: [
//      ...existingRoutes,
//      ...visitCalendarRoutes,   // <-- agregar aquí
//    ],
//  })
//
//  Si ya tienes un guard de navegación (beforeEach) que verifica
//  meta.requiresAuth y meta.roles, las rutas se protegen
//  automáticamente con el sistema de autenticación existente.
// ============================================================

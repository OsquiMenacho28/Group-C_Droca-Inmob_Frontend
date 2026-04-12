import CalendarView from '@/views/CalendarView.vue';
import ScheduleVisitView from '@/views/ScheduleVisitView.vue';
import PropertiesClientView from '@/views/PropertiesClientView.vue';

export const visitCalendarRoutes = [
  {
    path: '/calendar',
    name: 'Calendar',
    component: CalendarView,
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'AGENT', 'SUPERVISOR'],
      title: 'Calendario del equipo',
    },
  },

  {
    path: '/schedule-visit',
    name: 'ScheduleVisit',
    component: ScheduleVisitView,
    meta: {
      requiresAuth: true,
      roles: ['AGENT', 'ADMIN'],
      title: 'Programar visita',
    },
  },

  {
    path: '/properties',
    name: 'Properties',
    component: PropertiesClientView,
    meta: {
      requiresAuth: true,
      roles: ['CLIENT'],
      title: 'Propiedades disponibles',
    },
  },
];

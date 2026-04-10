import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "../composables/useAuth";
import MainLayout from "../layouts/MainLayout.vue";
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import UsersView from "../views/UsersView.vue";
import AdminProperties from "../views/AdminProperties.vue";
import AgentDashboard from "../views/AgentDashboard.vue";
import AgentClients from "../views/AgentClients.vue";
import CalendarView from "../views/CalendarView.vue";
import ScheduleVisitView from "../views/ScheduleVisitView.vue";
import PropertiesClientView from "../views/PropertiesClientView.vue";
import OwnerDashboard from "../views/OwnerDashboard.vue";
import ClientDashboard from "../views/ClientDashboard.vue";
import ReassignmentInboxView from "../views/ReassignmentInboxView.vue";
import OperationDetailView from "../views/OperationDetailView.vue";
import PropertyAuditView from "../views/PropertyAuditView.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: { requiresGuest: true },
  },
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: DashboardView,
      },
      {
        path: "admin/users",
        name: "Users",
        component: UsersView,
        meta: { role: "ADMIN" },
      },
      {
        path: "admin/properties",
        name: "AdminProperties",
        component: AdminProperties,
        meta: { role: "ADMIN" },
      },
      {
        path: "agent",
        name: "AgentDashboard",
        component: AgentDashboard,
        meta: { role: "AGENT" },
      },
      {
        path: "agent/clients",
        name: "AgentClients",
        component: AgentClients,
        meta: { role: "AGENT" },
      },
      {
        path: "/reassignments/inbox",
        name: "reassignment-inbox",
        component: ReassignmentInboxView,
        meta: {
          role: "AGENT", // Only agents can access the inbox
          title: "Reassignment Requests",
        },
      },
      {
        path: "/calendar",
        name: "Calendar",
        component: CalendarView,
        meta: { role: "AGENT" },
      },
      {
        path: "/schedule-visit",
        name: "ScheduleVisit",
        component: ScheduleVisitView,
        meta: { role: "AGENT" },
      },
      {
        path: "/properties",
        name: "Properties",
        component: PropertiesClientView,
        meta: { role: "CLIENT" },
      },
      {
        path: "owner",
        name: "OwnerDashboard",
        component: OwnerDashboard,
        meta: { role: "OWNER" }, // ← Already exists, good!
      },
      {
        path: "client/favorites",
        name: "ClientFavorites",
        component: () => import("../views/ClientFavorites.vue"),
        meta: { role: "CLIENT" },
      },
      {
        path: "client",
        name: "ClientDashboard",
        component: ClientDashboard,
        meta: { role: "CLIENT" },
      },
      {
        path: "admin/audit",
        name: "AuditLogs",
        component: () => import("../views/AuditLogsView.vue"),
        meta: { requiresAuth: true, role: "ADMIN" },
      },
      {
        path: "/operations/:id",
        name: "operation-detail",
        component: OperationDetailView,
        meta: {
          role: "AGENT",
          title: "Operation Detail",
        },
      },
      {
        path: "admin/properties/audit",
        name: "PropertyAudit",
        component: PropertyAuditView,
        meta: { requiresAuth: true, role: "ADMIN" }
      }
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated.value && to.name !== "Login") {
    next({ name: "Login" });
  } else if (to.meta.requiresGuest && isAuthenticated.value) {
    next({ name: "Dashboard" });
  } else if (to.meta.role) {
    const roles = user.value?.roles || [];
    const userType = user.value?.userType;
    const hasRole =
      roles.includes(to.meta.role) ||
      userType === "ADMIN" ||
      (to.meta.role === "AGENT" && userType === "EMPLOYEE") ||
      (to.meta.role === "CLIENT" && userType === "INTERESTED_CLIENT");

    hasRole ? next() : next({ name: "Dashboard" });
  } else {
    next();
  }
});

router.onError((error) => {
  console.error("Router error:", error);
  if (error.message?.includes("Cannot destructure property")) {
    window.location.reload();
  }
});

export default router;

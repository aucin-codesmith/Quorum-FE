import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { HomeRedirect, RequireRole } from "./guards";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardPage from "@/pages/employee/DashboardPage";
import FindRoomPage from "@/pages/employee/FindRoomPage";
import RoomDetailPage from "@/pages/employee/RoomDetailPage";
import BookingPage from "@/pages/employee/BookingPage";
import MyReservationsPage from "@/pages/employee/MyReservationsPage";
import ReservationDetailPage from "@/pages/employee/ReservationDetailPage";
const AdminOverviewPage = lazy(() => import("@/pages/admin/AdminOverviewPage"));
const AdminRoomsPage = lazy(() => import("@/pages/admin/AdminRoomsPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminReservationsPage = lazy(() => import("@/pages/admin/AdminReservationsPage"));
const AdminNewReservationPage = lazy(() => import("@/pages/admin/AdminNewReservationPage"));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireRole role="employee" />}>
        <Route element={<AppLayout area="employee" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rooms" element={<FindRoomPage />} />
          <Route path="/rooms/:id" element={<RoomDetailPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/my-reservations" element={<MyReservationsPage />} />
          <Route path="/my-reservations/:id" element={<ReservationDetailPage />} />
        </Route>
      </Route>

      <Route path="/admin" element={<RequireRole role="admin" />}>
        <Route element={<AppLayout area="admin" />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="rooms" element={<AdminRoomsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="reservations" element={<AdminReservationsPage />} />
          <Route path="reservations/new" element={<AdminNewReservationPage />} />
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

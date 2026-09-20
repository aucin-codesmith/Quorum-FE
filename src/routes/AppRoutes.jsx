import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/employee/DashboardPage";
import FindRoomPage from "../pages/employee/FindRoomPage";
import RoomDetailPage from "../pages/employee/RoomDetailPage";
import BookingPage from "../pages/employee/BookingPage";
import MyReservationsPage from "../pages/employee/MyReservationsPage";
import ReservationDetailPage from "../pages/employee/ReservationDetailPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/rooms" element={<FindRoomPage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/my-reservations" element={<MyReservationsPage />} />
        <Route path="/my-reservations/:id" element={<ReservationDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

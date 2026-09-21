import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@/hooks/useToast";
import { UsersProvider } from "@/hooks/useUsers";
import { RoomsProvider } from "@/hooks/useRooms";
import { AuthProvider } from "@/hooks/useAuth";
import { ReservationsProvider } from "@/hooks/useReservations";
import AppRoutes from "@/routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <UsersProvider>
          <RoomsProvider>
            <AuthProvider>
              <ReservationsProvider>
                <AppRoutes />
              </ReservationsProvider>
            </AuthProvider>
          </RoomsProvider>
        </UsersProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./hooks/useToast";
import { ReservationsProvider } from "./hooks/useReservations";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ReservationsProvider>
          <AppRoutes />
        </ReservationsProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

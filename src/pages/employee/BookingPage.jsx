import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import ReservationForm from "@/components/reservations/ReservationForm";

export default function BookingPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <PageHeader
        title="New reservation"
        description="Choose a room and a time. Your booking summary updates as you go."
      />
      <ReservationForm mode="employee" onDone={() => navigate("/my-reservations")} />
    </div>
  );
}

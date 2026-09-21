import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import ReservationForm from "@/components/reservations/ReservationForm";
import { Button } from "@/components/ui/button";

export default function AdminNewReservationPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" className="-ml-4" onClick={() => navigate("/admin/reservations")}>
        <ArrowLeft /> Back to reservations
      </Button>
      <PageHeader
        title="New reservation"
        description="Book a room on behalf of someone. The room's existing bookings are checked for you."
      />
      <ReservationForm mode="admin" onDone={() => navigate("/admin/reservations")} />
    </div>
  );
}

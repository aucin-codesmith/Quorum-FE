import { useNavigate } from "react-router-dom";
import { Users, MapPin } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Only what matters at a glance: name, capacity, floor, status. Facilities live on the detail page.
export default function RoomCard({ room }) {
  const navigate = useNavigate();
  const isAvailable = room.status === "available";

  return (
    <Card className="gap-0 py-0 transition-shadow duration-200 hover:shadow-md">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-tint-soft">
        <img src={room.image} alt={room.name} loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute top-4 left-4">
          <StatusBadge status={room.status} className="bg-background" />
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{room.name}</h3>
          <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users size={16} /> {room.capacity}
          </span>
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={16} className="text-primary-soft" /> {room.floor}
        </p>

        <div className="mt-6 flex gap-3">
          <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate(`/rooms/${room.id}`)}>
            View details
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={!isAvailable}
            onClick={() => navigate(`/booking?room=${room.id}`)}
          >
            Book room
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

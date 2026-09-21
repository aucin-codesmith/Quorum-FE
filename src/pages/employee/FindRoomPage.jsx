import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, DoorClosed } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import IconInput from "@/components/common/IconInput";
import SimpleSelect from "@/components/common/SimpleSelect";
import EmptyState from "@/components/common/EmptyState";
import FacilitiesFilter from "@/components/rooms/FacilitiesFilter";
import RoomCard from "@/components/rooms/RoomCard";
import { Card, CardContent } from "@/components/ui/card";
import { facilitiesCatalog } from "@/data/mockData";
import { useRooms } from "@/hooks/useRooms";

const capacityOptions = [
  { label: "Any capacity", value: "0" },
  { label: "4 or more", value: "4" },
  { label: "6 or more", value: "6" },
  { label: "8 or more", value: "8" },
  { label: "12 or more", value: "12" },
];

const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Capacity: Low to High", value: "capacity-asc" },
  { label: "Capacity: High to Low", value: "capacity-desc" },
  { label: "Name: A–Z", value: "name-asc" },
];

export default function FindRoomPage() {
  const { rooms } = useRooms();
  const [query, setQuery] = useState("");
  const [capacity, setCapacity] = useState("0");
  const [availability, setAvailability] = useState("any");
  const [sort, setSort] = useState("recommended");
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  const toggleFacility = (facility) => {
    setSelectedFacilities((current) =>
      current.includes(facility) ? current.filter((f) => f !== facility) : [...current, facility]
    );
  };

  const filteredRooms = useMemo(() => {
    let result = rooms.filter((room) => {
      const matchesQuery =
        room.name.toLowerCase().includes(query.toLowerCase()) ||
        room.floor.toLowerCase().includes(query.toLowerCase());
      const matchesCapacity = room.capacity >= Number(capacity);
      const matchesAvailability = availability === "any" || room.status === availability;
      const matchesFacilities = selectedFacilities.every((f) => room.facilities.includes(f));
      return matchesQuery && matchesCapacity && matchesAvailability && matchesFacilities;
    });

    switch (sort) {
      case "capacity-asc":
        result = [...result].sort((a, b) => a.capacity - b.capacity);
        break;
      case "capacity-desc":
        result = [...result].sort((a, b) => b.capacity - a.capacity);
        break;
      case "name-asc":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result = [...result].sort((a) => (a.status === "available" ? -1 : 1));
    }
    return result;
  }, [rooms, query, capacity, availability, selectedFacilities, sort]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Find a room"
        description="Browse every meeting room across the building, filtered to fit your meeting."
      />

      <Card className="border-0 bg-tint-soft shadow-none ring-0">
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <IconInput
              icon={Search}
              placeholder="Search by room or floor…"
              aria-label="Search rooms"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              wrapperClassName="lg:col-span-2"
            />
            <SimpleSelect aria-label="Capacity" value={capacity} onValueChange={setCapacity} options={capacityOptions} />
            <SimpleSelect
              aria-label="Availability"
              value={availability}
              onValueChange={setAvailability}
              options={[
                { value: "any", label: "Any availability" },
                { value: "available", label: "Available now" },
                { value: "occupied", label: "Occupied" },
                { value: "maintenance", label: "Under maintenance" },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <SlidersHorizontal size={16} className="mt-3 shrink-0 text-primary-soft" />
              <FacilitiesFilter options={facilitiesCatalog} selected={selectedFacilities} onToggle={toggleFacility} />
            </div>
            <SimpleSelect
              aria-label="Sort rooms"
              value={sort}
              onValueChange={setSort}
              options={sortOptions}
              className="w-full shrink-0 sm:w-56"
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-sm font-medium text-muted-foreground">
        {filteredRooms.length} {filteredRooms.length === 1 ? "room" : "rooms"} found
      </p>

      {filteredRooms.length === 0 ? (
        <EmptyState
          icon={DoorClosed}
          title="No rooms match your filters"
          description="Try a lower capacity or remove a facility to see more rooms."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}

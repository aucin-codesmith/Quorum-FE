import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, DoorClosed } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import FacilitiesFilter from "../../components/rooms/FacilitiesFilter";
import RoomCard from "../../components/rooms/RoomCard";
import EmptyState from "../../components/common/EmptyState";
import { rooms, facilitiesCatalog } from "../../data/mockData";

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
  }, [query, capacity, availability, selectedFacilities, sort]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Rooms"
        title="Find a Room"
        description="Browse every meeting room across the building, filtered to fit your meeting."
      />

      <div className="rounded-2xl border border-mist-200 bg-white p-4.5 sm:p-5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            icon={Search}
            placeholder="Search by room or floor…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="lg:col-span-2"
          />
          <Select label={null} value={capacity} onChange={(e) => setCapacity(e.target.value)}>
            {capacityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Select label={null} value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="any">Any availability</option>
            <option value="available">Available now</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Under maintenance</option>
          </Select>
        </div>

        <div className="mt-4 flex flex-col gap-3.5 border-t border-mist-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2.5">
            <SlidersHorizontal size={15} className="mt-1 shrink-0 text-mist-300" />
            <FacilitiesFilter
              options={facilitiesCatalog}
              selected={selectedFacilities}
              onToggle={toggleFacility}
            />
          </div>
          <Select
            label={null}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full shrink-0 sm:w-56"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <p className="text-[13px] font-medium text-slate-500">
        {filteredRooms.length} {filteredRooms.length === 1 ? "room" : "rooms"} found
      </p>

      {filteredRooms.length === 0 ? (
        <EmptyState
          icon={DoorClosed}
          title="No rooms match your filters"
          description="Try adjusting your search, capacity, or facility filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}

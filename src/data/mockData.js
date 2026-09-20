// ---------------------------------------------------------------------------
// QUORUM — MOCK DATA LAYER
// ---------------------------------------------------------------------------
// Everything in this file is placeholder/demonstration data only. Nothing
// here is persisted to a real database. When backend integration begins,
// each export below should be replaced by the corresponding API call
// (e.g. getRooms() -> GET /api/rooms) while keeping the same shape so the
// UI components do not need to change.
// ---------------------------------------------------------------------------

export const currentUser = {
  id: "u-001",
  name: "Alya Ramadhani",
  role: "Product Design Lead",
  department: "Design & Research",
  email: "alya.ramadhani@company.com",
  initials: "AR",
};

export const facilitiesCatalog = [
  "4K Display",
  "Video Conferencing",
  "Whiteboard",
  "Wireless Presentation",
  "Sound System",
  "Natural Light",
  "Standing Desks",
  "Phone Line",
];

export const rooms = [
  {
    id: "r-01",
    name: "Meridian",
    floor: "Floor 8, West Wing",
    capacity: 12,
    facilities: ["4K Display", "Video Conferencing", "Whiteboard", "Sound System"],
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    description:
      "Our largest boardroom, built for leadership reviews and client presentations. Floor-to-ceiling windows overlook the city skyline, and the room is wired for full hybrid conferencing.",
    status: "available",
  },
  {
    id: "r-02",
    name: "Harbor",
    floor: "Floor 5, North Wing",
    capacity: 6,
    facilities: ["Video Conferencing", "Whiteboard", "Wireless Presentation"],
    image:
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1200&auto=format&fit=crop",
    description:
      "A calm mid-size room suited to team stand-ups and stakeholder syncs, with a wireless presentation dock and an oversized writable wall.",
    status: "available",
  },
  {
    id: "r-03",
    name: "Cascade",
    floor: "Floor 5, South Wing",
    capacity: 4,
    facilities: ["Whiteboard", "Natural Light"],
    image:
      "https://images.unsplash.com/photo-1503389152951-9f343605f61e?q=80&w=1200&auto=format&fit=crop",
    description:
      "A compact focus room for small working sessions and 1:1s, tucked beside the south atrium with plenty of daylight.",
    status: "occupied",
  },
  {
    id: "r-04",
    name: "Beacon",
    floor: "Floor 12, East Wing",
    capacity: 8,
    facilities: ["4K Display", "Video Conferencing", "Sound System", "Phone Line"],
    image:
      "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=1200&auto=format&fit=crop",
    description:
      "An executive-grade meeting room on the top floor, frequently used for external partner calls and quarterly planning.",
    status: "available",
  },
  {
    id: "r-05",
    name: "Junction",
    floor: "Floor 3, Core",
    capacity: 10,
    facilities: ["Video Conferencing", "Whiteboard", "Standing Desks", "Wireless Presentation"],
    image:
      "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?q=80&w=1200&auto=format&fit=crop",
    description:
      "A flexible workshop-style room with standing desks and movable furniture, ideal for design sprints and cross-team collaboration.",
    status: "available",
  },
  {
    id: "r-06",
    name: "Anchor",
    floor: "Floor 3, Core",
    capacity: 4,
    facilities: ["Whiteboard", "Phone Line"],
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop",
    description:
      "A quiet phone-booth-adjacent room best suited for interviews, coaching conversations, and small confidential discussions.",
    status: "maintenance",
  },
];

// Today's schedule preview per room — used on the Room Detail page.
export const roomSchedules = {
  "r-01": [
    { start: "09:00", end: "10:00", title: "Leadership Sync" },
    { start: "13:00", end: "14:30", title: "Client QBR — Nimbus Co." },
  ],
  "r-02": [{ start: "11:00", end: "11:30", title: "Design Critique" }],
  "r-03": [
    { start: "08:30", end: "12:00", title: "1:1 Coaching Block" },
    { start: "14:00", end: "15:00", title: "Vendor Interview" },
  ],
  "r-04": [{ start: "16:00", end: "17:00", title: "APAC Partner Call" }],
  "r-05": [
    { start: "10:00", end: "12:00", title: "Q4 Planning Workshop" },
  ],
  "r-06": [],
};

export const initialReservations = [
  {
    id: "res-1042",
    roomId: "r-02",
    roomName: "Harbor",
    roomFloor: "Floor 5, North Wing",
    title: "Weekly Design Sync",
    description: "Review current sprint progress and unblock design handoffs with engineering.",
    date: "2026-09-22",
    startTime: "10:00",
    endTime: "10:45",
    participants: 6,
    status: "upcoming",
    createdAt: "2026-09-18T09:12:00",
  },
  {
    id: "res-1041",
    roomId: "r-05",
    roomName: "Junction",
    roomFloor: "Floor 3, Core",
    title: "Q4 Planning Workshop",
    description: "Cross-functional planning session for Q4 roadmap alignment across three teams.",
    date: "2026-09-24",
    startTime: "10:00",
    endTime: "12:00",
    participants: 9,
    status: "upcoming",
    createdAt: "2026-09-17T14:30:00",
  },
  {
    id: "res-1035",
    roomId: "r-01",
    roomName: "Meridian",
    roomFloor: "Floor 8, West Wing",
    title: "Client QBR — Nimbus Co.",
    description: "Quarterly business review with the Nimbus account team, including renewal discussion.",
    date: "2026-09-12",
    startTime: "13:00",
    endTime: "14:30",
    participants: 8,
    status: "completed",
    createdAt: "2026-09-05T11:00:00",
  },
  {
    id: "res-1029",
    roomId: "r-04",
    roomName: "Beacon",
    roomFloor: "Floor 12, East Wing",
    title: "Executive Budget Review",
    description: "Annual budget walkthrough with finance leadership.",
    date: "2026-09-08",
    startTime: "09:00",
    endTime: "10:00",
    participants: 5,
    status: "completed",
    createdAt: "2026-08-29T08:45:00",
  },
  {
    id: "res-1021",
    roomId: "r-06",
    roomName: "Anchor",
    roomFloor: "Floor 3, Core",
    title: "Candidate Interview — Senior PM",
    description: "Final-round interview loop for the Senior Product Manager opening.",
    date: "2026-09-05",
    startTime: "15:00",
    endTime: "15:45",
    participants: 3,
    status: "cancelled",
    createdAt: "2026-08-27T16:20:00",
  },
];

export const activityFeed = [
  { id: "a1", text: "You booked Harbor for \u201CWeekly Design Sync\u201D", time: "2 days ago" },
  { id: "a2", text: "Your Meridian reservation for Sept 12 was completed", time: "1 week ago" },
  { id: "a3", text: "You cancelled a reservation for Anchor", time: "2 weeks ago" },
];

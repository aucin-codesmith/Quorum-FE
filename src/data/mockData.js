// ---------------------------------------------------------------------------
// QUORUM — MOCK DATA LAYER
// ---------------------------------------------------------------------------
// Everything in this file is placeholder/demonstration data only. Nothing
// here is persisted to a real database. When backend integration begins,
// each export below should be replaced by the corresponding API call
// (e.g. getRooms() -> GET /api/rooms) while keeping the same shape so the
// UI components do not need to change.
// ---------------------------------------------------------------------------

import { isoDate, isoDateTime } from "../utils/date";

export const initialUsers = [
  { id: "u-001", name: "Alya Ramadhani", email: "alya.ramadhani@company.com", jobTitle: "Product Design Lead", department: "Design & Research", role: "employee", status: "active" },
  { id: "u-002", name: "Bima Prasetyo", email: "bima.prasetyo@company.com", jobTitle: "Senior Engineer", department: "Engineering", role: "employee", status: "active" },
  { id: "u-003", name: "Citra Lestari", email: "citra.lestari@company.com", jobTitle: "Finance Manager", department: "Finance", role: "employee", status: "active" },
  { id: "u-004", name: "Dimas Anggara", email: "dimas.anggara@company.com", jobTitle: "Sales Director", department: "Sales", role: "employee", status: "active" },
  { id: "u-005", name: "Eka Wulandari", email: "eka.wulandari@company.com", jobTitle: "HR Business Partner", department: "People", role: "employee", status: "active" },
  { id: "u-006", name: "Farhan Malik", email: "farhan.malik@company.com", jobTitle: "Marketing Lead", department: "Marketing", role: "employee", status: "inactive" },
  { id: "u-007", name: "Gita Permata", email: "admin@company.com", jobTitle: "Facilities Administrator", department: "Operations", role: "admin", status: "active" },
  { id: "u-008", name: "Hendra Kusuma", email: "hendra.kusuma@company.com", jobTitle: "IT Administrator", department: "Operations", role: "admin", status: "active" },
];

// Sign-in fallbacks for the prototype: any unknown email still signs in.
export const DEFAULT_EMPLOYEE_ID = "u-001";
export const DEFAULT_ADMIN_ID = "u-007";

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

export const initialRooms = [
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

// Dates are relative to "today" so the admin monitoring views always have live-looking data.
// roomName / roomFloor / userName are resolved from rooms and users at read time.
const res = (id, roomId, userId, title, description, dayOffset, startTime, endTime, participants, status, createdOffset, createdTime) => ({
  id,
  roomId,
  userId,
  title,
  description,
  date: isoDate(dayOffset),
  startTime,
  endTime,
  participants,
  status,
  createdAt: isoDateTime(createdOffset, createdTime),
});

export const initialReservations = [
  // Today
  res("res-1050", "r-01", "u-004", "Leadership Sync", "Weekly leadership alignment on pipeline and hiring.", 0, "09:00", "10:00", 8, "upcoming", -3, "09:20"),
  res("res-1051", "r-01", "u-004", "Client Kickoff — Orion", "Kickoff with the Orion account team and delivery leads.", 0, "13:00", "14:30", 9, "upcoming", -4, "15:05"),
  res("res-1052", "r-02", "u-001", "Design Critique", "Round of critique on the new booking flow.", 0, "11:00", "11:30", 5, "upcoming", -1, "16:40"),
  res("res-1053", "r-03", "u-005", "1:1 Coaching Block", "Back-to-back coaching sessions.", 0, "08:30", "12:00", 2, "upcoming", -2, "10:10"),
  res("res-1054", "r-03", "u-005", "Vendor Interview", "Interview with the shortlisted recruiting vendor.", 0, "14:00", "15:00", 3, "upcoming", -2, "10:15"),
  res("res-1055", "r-04", "u-003", "APAC Partner Call", "Quarterly call with APAC channel partners.", 0, "16:00", "17:00", 6, "upcoming", -5, "11:30"),
  res("res-1056", "r-05", "u-002", "Sprint Planning", "Plan the next two-week sprint with the platform team.", 0, "14:00", "15:30", 9, "upcoming", -1, "08:50"),
  // Upcoming
  res("res-1042", "r-02", "u-001", "Weekly Design Sync", "Review current sprint progress and unblock design handoffs with engineering.", 1, "10:00", "10:45", 6, "upcoming", -3, "09:12"),
  res("res-1049", "r-01", "u-003", "Budget Planning FY27", "First pass on the FY27 budget with department heads.", 1, "14:00", "15:00", 10, "upcoming", -2, "13:25"),
  res("res-1048", "r-04", "u-004", "Board Pre-read", "Walk through the board deck before circulation.", 2, "09:00", "10:00", 5, "upcoming", -1, "17:45"),
  res("res-1047", "r-05", "u-002", "Design Sprint Day 1", "Kick off a three-day design sprint on onboarding.", 2, "13:00", "16:00", 8, "upcoming", -4, "12:00"),
  res("res-1041", "r-05", "u-001", "Q4 Planning Workshop", "Cross-functional planning session for Q4 roadmap alignment across three teams.", 3, "10:00", "12:00", 9, "upcoming", -4, "14:30"),
  // Past
  res("res-1040", "r-02", "u-002", "Team Retro", "Sprint retrospective.", -2, "15:00", "16:00", 6, "completed", -9, "10:00"),
  res("res-1039", "r-01", "u-004", "Investor Update", "Monthly update for the investor group.", -3, "11:00", "12:00", 7, "completed", -10, "09:30"),
  res("res-1038", "r-04", "u-005", "Candidate Debrief", "Debrief after the final interview loop.", -5, "10:00", "11:00", 4, "cancelled", -8, "16:00"),
  res("res-1037", "r-03", "u-006", "Mentoring Session", "Monthly mentoring catch-up.", -6, "13:00", "14:00", 2, "completed", -12, "11:00"),
  res("res-1035", "r-01", "u-001", "Client QBR — Nimbus Co.", "Quarterly business review with the Nimbus account team, including renewal discussion.", -9, "13:00", "14:30", 8, "completed", -16, "11:00"),
  res("res-1029", "r-04", "u-001", "Executive Budget Review", "Annual budget walkthrough with finance leadership.", -13, "09:00", "10:00", 5, "completed", -22, "08:45"),
  res("res-1021", "r-06", "u-001", "Candidate Interview — Senior PM", "Final-round interview loop for the Senior Product Manager opening.", -16, "15:00", "15:45", 3, "cancelled", -25, "16:20"),
];

export const activityFeed = [
  { id: "a1", text: "You booked Harbor for \u201CWeekly Design Sync\u201D", time: "2 days ago" },
  { id: "a2", text: "Your Meridian reservation for Client QBR was completed", time: "1 week ago" },
  { id: "a3", text: "You cancelled a reservation for Anchor", time: "2 weeks ago" },
];

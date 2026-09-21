const pad = (n) => String(n).padStart(2, "0");

export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Local calendar date as YYYY-MM-DD, `offset` days from today.
export function isoDate(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toISODate(d);
}

export function todayISO() {
  return isoDate(0);
}

export function nowTime() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Parses YYYY-MM-DD as a local date (not UTC).
export function parseISODate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isoDateTime(offset, time) {
  return `${isoDate(offset)}T${time}:00`;
}

export function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Half-open interval overlap: 10:00–11:00 and 11:00–12:00 do not conflict.
export function overlaps(startA, endA, startB, endB) {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
}

export const WORK_START = "08:00";
export const WORK_END = "18:00";

// 30-minute slots between WORK_START and WORK_END inclusive.
export const timeSlots = (() => {
  const slots = [];
  for (let m = timeToMinutes(WORK_START); m <= timeToMinutes(WORK_END); m += 30) {
    slots.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }
  return slots;
})();

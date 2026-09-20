export function formatDate(dateStr, options = {}) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: options.short ? undefined : "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function formatTimeRange(start, end) {
  return `${formatTime(start)} \u2013 ${formatTime(end)}`;
}

export function formatTime(time24) {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function statusMeta(status) {
  switch (status) {
    case "available":
      return { label: "Available", tone: "success" };
    case "occupied":
      return { label: "Occupied", tone: "danger" };
    case "maintenance":
      return { label: "Under Maintenance", tone: "warning" };
    case "upcoming":
      return { label: "Upcoming", tone: "accent" };
    case "completed":
      return { label: "Completed", tone: "neutral" };
    case "cancelled":
      return { label: "Cancelled", tone: "danger" };
    default:
      return { label: status, tone: "neutral" };
  }
}

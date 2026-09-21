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

// Maps a status onto a Badge variant. The label always carries the meaning; colour is secondary.
export function statusMeta(status) {
  switch (status) {
    case "available":
      return { label: "Available", variant: "success" };
    case "occupied":
      return { label: "Occupied", variant: "danger" };
    case "maintenance":
      return { label: "Under maintenance", variant: "neutral" };
    case "upcoming":
      return { label: "Upcoming", variant: "accent" };
    case "completed":
      return { label: "Completed", variant: "neutral" };
    case "cancelled":
      return { label: "Cancelled", variant: "danger" };
    case "active":
      return { label: "Active", variant: "success" };
    case "inactive":
      return { label: "Inactive", variant: "neutral" };
    default:
      return { label: status, variant: "neutral" };
  }
}

export function roleLabel(role) {
  return role === "admin" ? "Administrator" : "Employee";
}

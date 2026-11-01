export const STATUSES = [
  { key: "backlog", label: "Backlog" },
  { key: "todo", label: "Da fare" },
  { key: "doing", label: "In corso" },
  { key: "done", label: "Fatto" },
];

export function initials(name = "") {
  return name.split(" ").filter(Boolean).map(w => w[0].toUpperCase()).slice(0, 2).join("");
}

// data ISO -> "02/11/2026"
export function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString("it-IT") : "";
}

// data ISO -> "2026-11-02", il formato di <input type="date">
export function toDateInput(iso) {
  return iso ? iso.slice(0, 10) : "";
}

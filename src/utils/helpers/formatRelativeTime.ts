export default function formatRelativeTime(value?: string | null): string {
  if (!value) return "";
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return "";

  const diff = Math.max(0, Date.now() - target);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

export function getStatusColor(status: string) {
  switch (status) {
    case "win":
      return "text-emerald-400"
    case "lost":
      return "text-red-400"
    case "in-progress":
      return "text-amber-400"
    default:
      return "text-muted-foreground"
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case "win":
      return "Victory"
    case "lost":
      return "Defeated"
    case "in-progress":
      return "In Progress"
    default:
      return status
  }
}
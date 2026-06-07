import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"

/** Resolves backend-hosted image URLs. Relative /uploads/ paths get the backend origin prepended. */
export function imgUrl(url: string | null | undefined): string {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("/uploads/")) return `${BACKEND}${url}`
  return url
}

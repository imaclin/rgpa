"use client"

import { useCallback } from "react"

/**
 * Returns a function that resolves admin paths based on the current hostname.
 * On admin subdomain: /projects (clean URL)
 * On localhost/main domain: /admin/projects (standard routing)
 */
export function useAdminPath() {
  const adminPath = useCallback((path: string) => {
    if (typeof window === "undefined") return path

    const hostname = window.location.hostname
    const isAdminSubdomain = hostname.startsWith("admin.")

    if (isAdminSubdomain) {
      // Strip /admin prefix for clean URLs on subdomain
      if (path === "/admin") return "/"
      if (path.startsWith("/admin/")) return path.replace("/admin", "")
      return path
    }

    // On localhost or main domain, keep /admin prefix
    return path
  }, [])

  return adminPath
}

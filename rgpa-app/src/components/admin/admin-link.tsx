"use client"

import Link from "next/link"
import { useAdminPath } from "@/hooks/use-admin-path"

interface AdminLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

export function AdminLink({ href, children, ...props }: AdminLinkProps) {
  const adminPath = useAdminPath()
  return (
    <Link href={adminPath(href)} {...props}>
      {children}
    </Link>
  )
}

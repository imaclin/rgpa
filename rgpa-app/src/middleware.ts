import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  const isLocalDev = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  const isAdminSubdomain = hostname.startsWith('admin.')

  // In production: block /admin on the main domain (not admin subdomain)
  if (!isLocalDev && pathname.startsWith('/admin') && !isAdminSubdomain) {
    return NextResponse.rewrite(new URL('/not-found', request.url), { status: 404 })
  }

  // On admin subdomain: rewrite paths to /admin/* so URLs stay clean
  // e.g. admin.revifi.com/projects -> serves /admin/projects
  if (isAdminSubdomain && !pathname.startsWith('/admin') && !pathname.startsWith('/login') && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    const adminRoutes = ['/projects', '/services', '/about', '/messages', '/tasks', '/media', '/team', '/testimonials', '/settings']
    const isAdminRoute = pathname === '/' || adminRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

    if (isAdminRoute) {
      const rewritePath = pathname === '/' ? '/admin' : `/admin${pathname}`
      return NextResponse.rewrite(new URL(rewritePath, request.url))
    }

    // Non-admin routes on admin subdomain -> redirect to main domain
    const mainDomain = hostname.replace('admin.', '')
    return NextResponse.redirect(new URL(`https://${mainDomain}${pathname}`, request.url))
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

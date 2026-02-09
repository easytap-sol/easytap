import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function updateSession(request: NextRequest) {
  // 1. Prepare Request Headers (to pass path to layouts)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-url', request.nextUrl.pathname + request.nextUrl.search)

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // 2. Initialize Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders, // Important: Keep headers even when cookies change
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Basic protection: If no user and trying to access dashboard, redirect to login
  if (!user && (path.startsWith("/admin") || path.startsWith("/customer"))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to dashboard if logged in and trying to access login/signup
  if (user && (path.startsWith("/login") || path.startsWith("/signup"))) {
    // We'll let the layout handle the specific role redirect
    return NextResponse.redirect(new URL("/admin/overview", request.url)) // Default fallback
  }

  return supabaseResponse
}
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  Link,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'HostelGuard AI - Secure Outing Management' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <div className="flex h-screen bg-[#D6E6F3] text-slate-900 font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl shrink-0">
          <div className="p-6 bg-[#0f52ba] shadow-lg">
            <Link to="/" className="text-xl font-bold flex items-center gap-2">
              <span className="bg-white/20 p-1.5 rounded-lg">🛡️</span>
              Digital Dorms
            </Link>
            <p className="text-[10px] text-white/70 mt-2 uppercase tracking-[0.2em] font-black">
              Security Portal
            </p>
          </div>
          
          <nav className="flex-1 mt-6 px-3 space-y-1">
            <NavItem to="/" icon="🏠" label="Dashboard" />
            <NavItem to="/gate" icon="🚪" label="Gate Terminal" />
            <NavItem to="/students" icon="👥" label="Directory" />
            <NavItem to="/reports" icon="📊" label="Logs" />
          </nav>

          <div className="p-4 bg-slate-800/40 mt-auto border-t border-slate-700/50">
             <div className="text-[10px] text-slate-500 uppercase font-bold text-center">Standalone Version</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-10">
          <Outlet />
        </main>
      </div>
    </RootDocument>
  )
}

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <Link 
      to={to} 
      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-white group"
      activeProps={{ className: 'bg-[#0f52ba] !text-white shadow-lg' }}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-bold text-sm uppercase tracking-tight">{label}</span>
    </Link>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

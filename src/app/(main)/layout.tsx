import { Sidebar } from '@/shared/components/sidebar'
import { WorkspaceActions } from '@/shared/components/workspace-actions'
import { createClient } from '@/lib/supabase/server'
import { DEMO_USER } from '@/features/demo/auth'
import { isDemoSession } from '@/features/demo/server'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const demoSession = await isDemoSession()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userName = demoSession ? DEMO_USER.name : 'Coach'
  let userEmail = demoSession ? DEMO_USER.email : user?.email ?? ''

  if (user && !demoSession) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    userName = profile?.full_name || user.email?.split('@')[0] || 'Coach'
    userEmail = user.email ?? ''
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#080C14]">
      {/* Sidebar — fixed on desktop */}
      <div className="hidden md:flex flex-col shrink-0">
        <Sidebar userName={userName} userEmail={userEmail} />
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        {/* Gradient mesh background */}
        <div className="pointer-events-none fixed inset-0 -z-0">
          <div
            className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full opacity-5 blur-[120px]"
            style={{ background: '#FF6A00', animation: 'blob 12s ease-in-out infinite' }}
          />
          <div
            className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full opacity-5 blur-[100px]"
            style={{ background: '#FFB000', animation: 'blob 10s ease-in-out infinite 3s' }}
          />
        </div>

        <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#080C14]/88 px-4 py-3 backdrop-blur-xl lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 md:hidden">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6A00]">Panel coach</p>
              <p className="truncate text-[11px] text-[#94A3B8]">Clientes y programas</p>
            </div>
            <div className="hidden min-w-0 md:block">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF6A00]">Panel coach</p>
              <p className="truncate text-[11px] text-[#94A3B8]">Clientes, planes y operaciones del negocio.</p>
            </div>
            <WorkspaceActions mode="admin" userName={userName} userEmail={userEmail} settingsHref="/dashboard/settings" />
          </div>
        </div>

        <div className="relative z-10 min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}

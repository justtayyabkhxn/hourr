import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import AsciiClockBg from '@/components/AsciiClockBg'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full overflow-hidden grid-bg" style={{ background: 'var(--bg)' }}>
      <AsciiClockBg />
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto app-main">
          <div className="max-w-5xl mx-auto px-0 md:px-6 py-4 md:py-6">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

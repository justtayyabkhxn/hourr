import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import AsciiClockBg from '@/components/AsciiClockBg'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-full overflow-hidden grid-bg" style={{ background: 'var(--bg)' }}>
      <AsciiClockBg />
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 app-main">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

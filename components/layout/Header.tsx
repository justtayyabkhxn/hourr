export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      className="px-6 py-4 mb-1 shrink-0"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <h1 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-1)' }}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

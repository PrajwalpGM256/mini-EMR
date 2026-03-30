import { AnimatedLogo } from '@/components/admin/AnimatedLogo'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6">
          <AnimatedLogo />
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}
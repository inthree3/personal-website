import Nav from '@/components/Nav'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-content px-4 py-12">
        {children}
      </main>
    </>
  )
}

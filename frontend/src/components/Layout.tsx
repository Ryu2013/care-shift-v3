export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* メインコンテンツ（全幅） */}
      <main className="flex-1 w-full">{children}</main>
    </div>
  )
}

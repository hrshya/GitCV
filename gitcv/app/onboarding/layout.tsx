import { LogOut } from "lucide-react";




export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#F6F7F9] font-sans">
      {/* top accent bar */}
      <div className="h-[3px] bg-[#111318]" />

      {/* header */}
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        <div className="text-xl font-semibold tracking-tight text-[#111318]">Gitume</div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-slate-500">harshyadav6075@gmail.com</span>
          <button className="flex items-center gap-1.5 text-sm font-medium text-[#111318] hover:opacity-70 transition">
            <LogOut size={15} />
            Log out
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}

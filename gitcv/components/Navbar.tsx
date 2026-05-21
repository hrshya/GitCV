"use client";

export default function Navbar() {
  return (
    <header className="border-b border-hairline bg-canvas py-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full border border-hairline bg-surface px-3 py-2 text-sm font-semibold tracking-[0.16em] uppercase text-ink">Gitume</div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-body md:flex">
            <a href="#how-it-works" className="transition hover:text-ink">How it works</a>
            <a href="#resume-tips" className="transition hover:text-ink">Resume tips</a>
            <a href="#docs" className="transition hover:text-ink">Docs</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="button-pill border border-hairline bg-transparent px-5 py-3 text-sm font-semibold text-ink transition hover:bg-surface">Sign in</button>
          <button className="button-pill bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-active">Try free</button>
        </div>
      </div>
    </header>
  );
}

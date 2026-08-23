"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import Button from "./Button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/discover", label: "Squad Deck" },
  { href: "/matches", label: "Matches" },
  { href: "/profile", label: "Builder Profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/discover" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 p-0.5 shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
            <span className="flex h-full w-full items-center justify-center rounded-[10px] bg-background font-mono text-xs font-black text-cyan-300">
              SST
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-200 bg-clip-text text-transparent">
                HackMates
              </span>
              <span className="hidden rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 sm:inline-block">
                Scaler
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200",
                pathname === href
                  ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-sm shadow-cyan-500/10"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              )}
            >
              {label}
            </Link>
          ))}
          <Button
            variant="ghost"
            className="ml-2 hidden sm:inline-flex"
            onClick={() => signOut(router)}
          >
            Sign out
          </Button>
          <Button
            variant="secondary"
            className="sm:hidden text-xs px-2.5 py-1.5"
            onClick={() => signOut(router)}
            aria-label="Sign out"
          >
            Exit
          </Button>
        </div>
      </nav>
    </header>
  );
}

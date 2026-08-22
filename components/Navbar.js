"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import Button from "./Button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/matches", label: "Matches" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/discover" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm font-black text-white">
            H
          </span>
          <span className="text-lg font-extrabold tracking-tight">HackMate</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-white/10 text-foreground"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              )}
            >
              {label}
            </Link>
          ))}
          <Button
            variant="ghost"
            className="ml-1 hidden sm:inline-flex"
            onClick={() => signOut(router)}
          >
            Log out
          </Button>
          <Button
            variant="secondary"
            className="sm:hidden"
            onClick={() => signOut(router)}
            aria-label="Log out"
          >
            Exit
          </Button>
        </div>
      </nav>
    </header>
  );
}

"use client";

import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const { user, loading, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-100 flex items-center justify-between px-[clamp(20px,4vw,48px)] h-16 bg-transparent font-montserrat">
      {/* Logo */}
      <a
        href="/"
        className="text-xl font-bold text-white no-underline tracking-tight"
      >
        Nailart
      </a>

      {/* Center links */}
      <ul className="flex gap-8 list-none m-0 p-0 absolute left-1/2 -translate-x-1/2">
        {NAV_LINKS.map(({ label, href }) => (
          <li key={href}>
            <a
              href={href}
              className="text-white/75 hover:text-white no-underline text-sm font-medium transition-colors duration-200"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA / User */}
      {loading ? (
        <div className="w-[100px]" />
      ) : user ? (
        <div className="flex items-center gap-3">
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              className="w-8 h-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <button
            onClick={signOut}
            className="px-[18px] py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm transition-colors duration-200 border-none cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <a
          href="/auth"
          className="px-[18px] py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white no-underline text-sm font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] backdrop-blur-sm transition-colors duration-200"
        >
          Get Started
        </a>
      )}
    </nav>
  );
}

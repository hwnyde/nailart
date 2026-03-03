"use client";

import { useAuth } from "@/context/AuthContext";

export function DashboardNavbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="flex items-center justify-between px-[clamp(20px,4vw,48px)] h-16 bg-transparent font-montserrat">
      {/* Logo — same size as landing Navbar */}
      <a
        href="/"
        className="text-xl font-bold text-white no-underline tracking-tight"
      >
        Nailart
      </a>

      {/* Profile with hover popover */}
      <div className="relative group">
        <button className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-none bg-transparent p-0">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              className="w-8 h-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-medium">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </button>

        {/* Hover popover */}
        <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="w-52 rounded-xl bg-[#252525] border border-white/[0.08] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {/* User info */}
            <div className="px-3 py-2.5 border-b border-white/[0.08]">
              <p className="text-white text-sm font-medium truncate m-0">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-white/40 text-xs truncate m-0 mt-0.5">
                {user?.email}
              </p>
            </div>

            {/* Logout */}
            <button
              onClick={signOut}
              className="w-full text-left px-3 py-2.5 mt-1 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg cursor-pointer border-none bg-transparent transition-colors duration-150"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

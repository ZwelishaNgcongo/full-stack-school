// components/Navbar.tsx
import Image from "next/image";
import Link from "next/link";

async function getCurrentUser(): Promise<{ role: "admin" | "teacher" | "student" | "parent" | null; id?: string; name?: string }> {
  return { role: "admin", id: "mock-user-id", name: "Zwelisha Ngcongo" };
}

const Navbar = async () => {
  const user = await getCurrentUser();

  return (
    <div className="navbar sticky top-0 z-40 shadow-md bg-white/70 backdrop-blur-md border-b border-gray-200 rounded-b-xl px-4 py-3 flex items-center justify-between">
      {/* Search Bar */}
      <div className="hidden md:flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-1 shadow-sm hover:shadow-md transition">
        <Image src="/search.png" alt="search" width={16} height={16} className="opacity-60" />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-1.5 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* User Section */}
      <div className="flex items-center gap-6">
        {/* Message Icon */}
        <Link href="/list/messages" className="relative flex items-center justify-center bg-white border border-gray-200 rounded-full w-9 h-9 shadow hover:shadow-md transition hover:bg-gray-100">
          <Image src="/message.png" alt="Messages" width={18} height={18} />
        </Link>

        {/* Announcement Icon */}
        <Link href="/list/announcements" className="relative flex items-center justify-center bg-white border border-gray-200 rounded-full w-9 h-9 shadow hover:shadow-md transition hover:bg-gray-100">
          <Image src="/announcement.png" alt="Announcements" width={18} height={18} />
          <div className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-purple-600 text-white rounded-full text-xs font-semibold shadow">
            1
          </div>
        </Link>

        {/* User Info */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-semibold text-gray-800">{user?.name || "Guest"}</span>
          <span className="text-[11px] text-gray-500 capitalize">{user?.role || "guest"}</span>
        </div>

        {/* Avatar */}
        <Link href="/profile" className="hover:opacity-90 transition">
          <Image
            src="/avatar.png"
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-full border border-gray-200 shadow"
          />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;

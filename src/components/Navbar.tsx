import Image from "next/image";
import Link from "next/link";

// Mock auth to remove Clerk dependency - matching the Menu component
async function getCurrentUser(): Promise<{ 
  role: "admin" | "teacher" | "student" | "parent" | null; 
  id?: string;
  name?: string;
}> {
  return { 
    role: "admin", 
    id: "mock-user-id", 
    name: "John Doe" 
  };
}

const Navbar = async () => {
  const user = await getCurrentUser();
  
  return (
    <div className="flex items-center justify-between p-4">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>
      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        <Link href="/list/messages" className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-gray-100">
          <Image src="/message.png" alt="" width={20} height={20} />
        </Link>
        <Link href="/list/announcements" className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative hover:bg-gray-100">
          <Image src="/announcement.png" alt="" width={20} height={20} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div>
        </Link>
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">
            {user?.name || "Guest"}
          </span>
          <span className="text-[10px] text-gray-500 text-right">
            {user?.role || "guest"}
          </span>
        </div>
        <Link href="/profile" className="hover:opacity-80">
          <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
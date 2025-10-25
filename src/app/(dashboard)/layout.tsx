// app/(dashboard)/layout.tsx
import Menu from "@/components/Menu";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} h-screen flex`}>
      {/* LEFT SIDEBAR */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] bg-white border-r border-gray-200">
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="hidden lg:block font-bold text-gray-800">School MS</span>
            </div>
          </div>
          
          {/* Menu */}
          <div className="flex-1 overflow-y-auto">
            <Menu />
          </div>
        </div>
      </div>
      
      {/* RIGHT CONTENT */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-scroll">
        <div className="min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
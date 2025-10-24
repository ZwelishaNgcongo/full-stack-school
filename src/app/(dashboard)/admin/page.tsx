import UserCard from "@/components/UserCard";
import CountChartContainer from "@/components/CountChartContainer";

import EventCalendarContainer from "@/components/EventCalendarContainer";
import Announcements from "@/components/Announcements";

interface DashboardPageProps {
  searchParams?: { [key: string]: string | undefined };
}

export default function DashboardPage({ searchParams = {} }: DashboardPageProps) {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row bg-gray-100">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <div className="card flex-1"><UserCard type="admin" /></div>
          <div className="card flex-1"><UserCard type="student" /></div>
          <div className="card flex-1"><UserCard type="teacher" /></div>
          <div className="card flex-1"><UserCard type="parent" /></div>
        </div>
        
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="card w-full lg:w-1/3 h-[450px]">
            <CountChartContainer />
          </div>
         
        </div>
      </div>
      
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <div className="card"><EventCalendarContainer searchParams={searchParams} /></div>
        <div className="card"><Announcements /></div>
      </div>
    </div>
  );
}

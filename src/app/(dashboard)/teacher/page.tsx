
import BigCalendarContainer from "@/components/BigCalendarContainer";

interface TeacherPageProps {
  searchParams: { [key: string]: string | undefined };
}

const TeacherPage = ({ searchParams }: TeacherPageProps) => {
  // You can replace this with your own user ID logic
  // For example, from your own auth system or get it from searchParams
  const userId = searchParams.userId || "teacher-1"; // fallback ID

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule</h1>
          <BigCalendarContainer type="teacherId" id={userId} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
       
      </div>
    </div>
  );
};

export default TeacherPage;
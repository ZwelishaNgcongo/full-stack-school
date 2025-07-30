import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import { Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GetServerSidePropsContext } from "next";

interface Props {
  id: string;
}

const getTeacherData = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subjects: true,
          lessons: true,
          classes: true,
        },
      },
    },
  });
  return teacher;
};

export default async function SingleTeacherPage({ params }: { params: { id: string } }) {
  const role = "admin";
  const teacher = await getTeacherData(params.id);

  if (!teacher) return notFound();

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 xl:flex-row bg-gray-50">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 space-y-6">
        {/* USER INFO CARD */}
        <div className="bg-white shadow-md p-6 rounded-lg flex gap-6 items-start">
          <Image
            src={teacher.img || "/noAvatar.png"}
            alt=""
            width={144}
            height={144}
            className="w-36 h-36 rounded-full object-cover"
          />
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">
                {teacher.name + " " + teacher.surname}
              </h1>
              {role === "admin" && <FormContainer table="teacher" type="update" data={teacher} />}
            </div>
            <p className="text-gray-600 text-sm">
              Passionate educator dedicated to inspiring and empowering students.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Image src="/date.png" alt="" width={16} height={16} />
                <span>{new Intl.DateTimeFormat("en-GB").format(teacher.birthday)}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Image src="/mail.png" alt="" width={16} height={16} />
                <span className="truncate">{teacher.email || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Image src="/phone.png" alt="" width={16} height={16} />
                <span>{teacher.phone || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "/singleAttendance.png", label: "Attendance", value: "90%" },
            { icon: "/singleBranch.png", label: "Branches", value: teacher._count.subjects },
            { icon: "/singleLesson.png", label: "Lessons", value: teacher._count.lessons },
            { icon: "/singleClass.png", label: "Classes", value: teacher._count.classes },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-white shadow-sm p-4 rounded-lg flex items-center gap-4">
              <Image src={icon} alt="" width={24} height={24} />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{value}</h2>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CALENDAR */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Schedule</h2>
          <BigCalendarContainer type="teacherId" id={teacher.id} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 space-y-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Shortcuts</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
  {[
    { label: "Classes", href: `/list/classes?supervisorId=${teacher.id}`, color: "from-blue-400 to-blue-600", text: "text-white" },
    { label: "Students", href: `/list/students?teacherId=${teacher.id}`, color: "from-purple-400 to-purple-600", text: "text-white" },
    { label: "Lessons", href: `/list/lessons?teacherId=${teacher.id}`, color: "from-yellow-400 to-yellow-600", text: "text-gray-900" },
    { label: "Exams", href: `/list/exams?teacherId=${teacher.id}`, color: "from-pink-400 to-pink-600", text: "text-white" },
    { label: "Assignments", href: `/list/assignments?teacherId=${teacher.id}`, color: "from-green-400 to-green-600", text: "text-white" },
  ].map(({ label, href, color, text }) => (
    <Link
      key={label}
      href={href}
      className={`bg-gradient-to-br ${color} ${text} px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition duration-300`}
    >
      {label}
    </Link>
  ))}
</div>

        </div>

        <Performance />
        <Announcements />
      </div>
    </div>
  );
}

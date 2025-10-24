// components/Menu.tsx
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "MENU",
    items: [
      { icon: "/home.png", label: "Home", href: "/", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/teacher.png", label: "Teachers", href: "/list/teachers", visible: ["admin", "teacher"] },
      { icon: "/student.png", label: "Students", href: "/list/students", visible: ["admin", "teacher"] },
      { icon: "/parent.png", label: "Parents", href: "/list/parents", visible: ["admin", "teacher"] },
      { icon: "/subject.png", label: "Subjects", href: "/list/subjects", visible: ["admin"] },
      { icon: "/class.png", label: "Classes", href: "/list/classes", visible: ["admin", "teacher"] },
      { icon: "/lesson.png", label: "Lessons", href: "/list/lessons", visible: ["admin", "teacher"] },
      { icon: "/exam.png", label: "Exams", href: "/list/exams", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/assignment.png", label: "Assignments", href: "/list/assignments", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/result.png", label: "Results", href: "/list/results", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/result.png", label: "Reports", href: "/list/reports", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/calendar.png", label: "Events", href: "/list/events", visible: ["admin", "teacher", "student", "parent"] },
      { icon: "/announcement.png", label: "Announcements", href: "/list/announcements", visible: ["admin", "teacher", "student", "parent"] },
    ],
  },
  
];

// Mock user role
async function getCurrentUser(): Promise<{ role: "admin" | "teacher" | "student" | "parent" | null; id?: string }> {
  return { role: "admin", id: "mock-user-id" };
}

const Menu = async () => {
  const user = await getCurrentUser();
  const role = user?.role;

  return (
    <aside className="mt-4 px-2 text-sm text-gray-700">
      {menuItems.map((section) => (
        <div key={section.title} className="mb-6">
          <span className="hidden lg:block text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
            {section.title}
          </span>
          <div className="space-y-1">
            {section.items.map((item) => {
              if (role && item.visible.includes(role)) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group flex items-center gap-4 text-gray-600 hover:text-indigo-600 py-2 px-2 rounded-md transition-all hover:bg-indigo-50"
                  >
                    <div className="min-w-[24px]">
                      <Image src={item.icon} alt={item.label} width={20} height={20} className="opacity-80 group-hover:opacity-100" />
                    </div>
                    <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                  </Link>
                );
              }
            })}
          </div>
        </div>
      ))}
    </aside>
  );
};

export default Menu;

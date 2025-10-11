import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";

async function getCurrentUser (): Promise<{ role: "admin" | "teacher" | "student" | "parent" | null }> {
  // Replace with actual auth logic
  return { role: "admin" };
}

type ClassWithDetails = {
  id: number;
  name: string;
  capacity: number;
  supervisorId: string | null;
  supervisor: { name: string; surname: string } | null;
  grade: { level: number };
  gradeId: number;
  students: Array<{
    id: string;
    studentId: string;
    name: string;
    surname: string;
    sex: "MALE" | "FEMALE";
    email: string | null;
  }>;
  _count: {
    students: number;
  };
  description?: string;
};

async function getClasses(query: any, p: number): Promise<[ClassWithDetails[], number]> {
  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: { 
          select: { name: true, surname: true } 
        },
        grade: { 
          select: { level: true } 
        },
        students: {
          select: {
            id: true,
            studentId: true,
            name: true,
            surname: true,
            sex: true,
            email: true,
          },
          orderBy: [
            { surname: "asc" },
            { name: "asc" },
          ],
        },
        _count: {
          select: { students: true },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: [
        { grade: { level: "asc" } },
        { name: "asc" },
      ],
    }),
    prisma.class.count({ where: query }),
  ]);
  return [data, count];
}

interface ClassListPageProps {
  searchParams: { [key: string]: string | undefined };
}

const ClassListPage = async ({ searchParams }: ClassListPageProps) => {
  const { role } = await getCurrentUser ();
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) || 1 : 1;

  const query: any = {};
  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;
    if (key === "supervisorId") query.supervisorId = value;
    if (key === "search") query.name = { contains: value, mode: "insensitive" };
  }

  const [data, count] = await getClasses(query, p);

  const columns = [
    { header: "Class Name", accessor: "name" },
    { header: "Grade", accessor: "grade", className: "hidden lg:table-cell" },
    { header: "Students", accessor: "students", className: "hidden md:table-cell" },
    { header: "Male/Female", accessor: "gender", className: "hidden lg:table-cell" },
    { header: "Capacity", accessor: "capacity", className: "hidden xl:table-cell" },
    { header: "Supervisor", accessor: "supervisor", className: "hidden md:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ClassWithDetails) => {
    const maleCount = item.students.filter(s => s.sex === "MALE").length;
    const femaleCount = item.students.filter(s => s.sex === "FEMALE").length;
    const totalStudents = item._count.students;
    const capacityPercentage = (totalStudents / item.capacity) * 100;

    // ✅ FIXED: Extract only class letter from name, use database grade.level for grade
    const parseClassName = (className: string): { classLetter: string } => {
      // Match pattern: optional digits or 'R', followed by a letter
      const match = className.match(/^(?:R|\d{1,2})([A-F])$/i);
      
      if (match) {
        return {
          classLetter: match[1].toUpperCase() // "A", "B", "C", etc.
        };
      }
      
      // Fallback if pattern doesn't match
      console.warn(`⚠️ Could not parse class name: ${className}`);
      return {
        classLetter: 'A'
      };
    };

    const { classLetter } = parseClassName(item.name);
    
    // ✅ CRITICAL FIX: Use item.grade.level directly from database
    // Convert level to the format expected by the form:
    // - level 0 → "R"
    // - level 1 → "1"
    // - level 2 → "2", etc.
    const gradeForForm = item.grade.level === 0 ? "R" : item.grade.level.toString();

    // ✅ FIXED: Prepare complete form data with CORRECT grade from database
    const formData = {
      id: item.id,
      name: item.name,
      capacity: item.capacity,
      supervisorId: item.supervisorId || '', // ✅ Keep empty string if null
      gradeId: item.gradeId,
      grade: gradeForForm, // ✅ Use actual grade level from database
      classLetter: classLetter, // ✅ Extracted from class name
      studentCount: totalStudents,
      description: item.description || '',
    };

    // ✅ DEBUG: Log the data being passed
    console.log('FormContainer - Data passed to ClassForm:', formData);

    return (
      <tr 
        key={item.id} 
        className="border-b border-gray-200 even:bg-slate-50 hover:bg-purple-50 transition text-sm"
      >
        <td className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              {item.name}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{item.name}</p>
              <p className="text-xs text-gray-500">Grade {item.grade.level === 0 ? 'R' : item.grade.level}</p>
            </div>
          </div>
        </td>
        
        <td className="hidden lg:table-cell p-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            Grade {item.grade.level === 0 ? 'R' : item.grade.level}
          </span>
        </td>

        <td className="hidden md:table-cell p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-800">{totalStudents}</span>
            <div className="flex flex-col">
              <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    capacityPercentage >= 90 ? 'bg-red-500' :
                    capacityPercentage >= 75 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-0.5">
                {Math.round(capacityPercentage)}% full
              </span>
            </div>
          </div>
        </td>

        <td className="hidden lg:table-cell p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-semibold text-blue-700">{maleCount}</span>
            </div>
            <span className="text-gray-400">/</span>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-semibold text-pink-700">{femaleCount}</span>
            </div>
          </div>
        </td>

        <td className="hidden xl:table-cell p-4">
          <span className="text-gray-600">
            {totalStudents} / {item.capacity}
          </span>
        </td>

        <td className="hidden md:table-cell p-4">
          {item.supervisor ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-700 font-semibold text-xs">
                  {item.supervisor.name[0]}{item.supervisor.surname[0]}
                </span>
              </div>
              <span className="text-gray-700 text-sm">
                {item.supervisor.name} {item.supervisor.surname}
              </span>
            </div>
          ) : (
            <span className="text-gray-400 italic text-sm">No supervisor</span>
          )}
        </td>

        {role === "admin" && (
          <td className="p-4">
            <div className="flex items-center gap-2">
              <FormContainer 
                table="class" 
                type="update" 
                data={formData} 
              />
              <FormContainer table="class" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="card flex-1 m-4 mt-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">All Classes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage class registers, supervisors, and student assignments
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="btn-icon" title="Filter classes">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="btn-icon" title="Sort classes">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="class" type="create" />}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Classes</p>
              <p className="text-2xl font-bold text-blue-800">{count}</p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Students</p>
              <p className="text-2xl font-bold text-green-800">
                {data.reduce((sum, cls) => sum + cls._count.students, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Avg. Class Size</p>
              <p className="text-2xl font-bold text-purple-800">
                {count > 0 
                  ? Math.round(data.reduce((sum, cls) => sum + cls._count.students, 0) / count)
                  : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      
      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ClassListPage;
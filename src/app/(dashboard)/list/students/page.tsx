// app/(dashboard)/list/students/page.tsx
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type StudentList = Student & { class: Class };

// Helper function to extract grade from class name
const extractGradeFromClassName = (className: string): string => {
  // Match patterns like "Grade 10A", "10A", "Grade RA", "RA"
  const match = className.match(/(?:Grade\s*)?([R0-9]+)[A-F]?/i);
  if (match) {
    return match[1]; // Returns "R", "1", "10", "11", "12", etc.
  }
  return className; // Fallback to full name if pattern doesn't match
};

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // Hardcoded role for now, replace this with real auth logic
  const role = "admin";
  
  const { page, search, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Columns
  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Student ID",
      accessor: "studentId",
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  // Render Row
  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.class.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.studentId}</td>
      <td className="hidden md:table-cell">{extractGradeFromClassName(item.class.name)}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <FormContainer table="student" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  // QUERY CONDITIONS
  const query: Prisma.StudentWhereInput = {};

  if (search) {
    // Trim and normalize search input
    const trimmedSearch = search.trim();
    
    if (trimmedSearch) {
      console.log('Search query:', trimmedSearch);
      
      // Search by studentId, username, name, and surname
      query.OR = [
        { studentId: { contains: trimmedSearch, mode: "insensitive" } },
        { username: { contains: trimmedSearch, mode: "insensitive" } },
        { name: { contains: trimmedSearch, mode: "insensitive" } },
        { surname: { contains: trimmedSearch, mode: "insensitive" } },
      ];
    }
  }

  // Additional filters
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "teacherId":
            query.class = {
              lessons: {
                some: {
                  teacherId: value,
                },
              },
            };
            break;
          case "classId":
            query.classId = parseInt(value);
            break;
          default:
            break;
        }
      }
    }
  }

  // Log for debugging - you can remove this in production
  console.log('Final query object:', JSON.stringify(query, null, 2));

  // Fetch students
  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: {
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: [
        { surname: "asc" },
        { name: "asc" },
      ],
    }),
    prisma.student.count({ where: query }),
  ]);

  // Log search results count for debugging
  if (search) {
    console.log(`Search for "${search}" returned ${count} result(s)`);
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch placeholder="Search by Student ID or Name..." />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="student" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default StudentListPage;
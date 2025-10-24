// app/api/reports/search/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("query");
    
    if (!query) {
      return NextResponse.json([]);
    }

    // Search for reports by student name, surname, studentId, or subject
    const reports = await prisma.report.findMany({
      where: {
        OR: [
          { student: { studentId: { contains: query, mode: "insensitive" } } },
          { student: { name: { contains: query, mode: "insensitive" } } },
          { student: { surname: { contains: query, mode: "insensitive" } } },
          { subject: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      take: 20,
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            surname: true,
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { year: "desc" },
        { term: "asc" },
      ],
    });

    // Get teacher information for each report
    const reportsWithTeachers = await Promise.all(
      reports.map(async (report) => {
        const lesson = await prisma.lesson.findFirst({
          where: {
            subjectId: report.subjectId,
            classId: report.student.class?.id,
          },
          include: {
            teacher: {
              select: {
                name: true,
                surname: true,
              },
            },
          },
        });

        return {
          id: report.id,
          studentName: report.student.name,
          studentSurname: report.student.surname,
          studentId: report.student.studentId || report.student.id,
          subject: report.subject.name,
          term: report.term,
          year: report.year,
          marks: report.marks,
          grade: report.grade,
          teacherName: lesson ? `${lesson.teacher.name} ${lesson.teacher.surname}` : "N/A",
        };
      })
    );

    return NextResponse.json(reportsWithTeachers);
  } catch (error) {
    console.error('Failed to search reports:', error);
    return NextResponse.json(
      { error: 'Failed to search reports' },
      { status: 500 }
    );
  }
}
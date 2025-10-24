// app/api/results/search/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("query");
    
    if (!query) {
      return NextResponse.json([]);
    }

    // Search for results by student name, surname, studentId, exam title, or assignment title
    const results = await prisma.result.findMany({
      where: {
        OR: [
          { student: { studentId: { contains: query, mode: "insensitive" } } },
          { student: { name: { contains: query, mode: "insensitive" } } },
          { student: { surname: { contains: query, mode: "insensitive" } } },
          { exam: { title: { contains: query, mode: "insensitive" } } },
          { assignment: { title: { contains: query, mode: "insensitive" } } },
        ],
      },
      take: 20,
      include: {
        student: {
          select: {
            name: true,
            surname: true,
            class: {
              select: {
                name: true,
              },
            },
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
            startTime: true,
            lessons: {
              take: 1,
              include: {
                lesson: {
                  select: {
                    teacher: { select: { name: true, surname: true } },
                  },
                },
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    // Transform results
    const transformedResults = results
      .map((item) => {
        const assessment = item.exam || item.assignment;
        if (!assessment) return null;

        const isExam = "startTime" in assessment;
        const studentClass = (item.student as any).class?.name || "No Class";

        if (isExam && item.exam) {
          const firstLesson = item.exam.lessons[0]?.lesson;
          if (!firstLesson) return null;

          return {
            id: item.id,
            title: item.exam.title,
            studentName: item.student.name,
            studentSurname: item.student.surname,
            teacherName: firstLesson.teacher.name,
            teacherSurname: firstLesson.teacher.surname,
            score: item.score,
            className: studentClass,
            startTime: item.exam.startTime,
          };
        }

        if (item.assignment) {
          return {
            id: item.id,
            title: item.assignment.title,
            studentName: item.student.name,
            studentSurname: item.student.surname,
            teacherName: item.assignment.lesson.teacher.name,
            teacherSurname: item.assignment.lesson.teacher.surname,
            score: item.score,
            className: studentClass,
            startTime: item.assignment.startDate,
          };
        }

        return null;
      })
      .filter(Boolean);

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error('Failed to search results:', error);
    return NextResponse.json(
      { error: 'Failed to search results' },
      { status: 500 }
    );
  }
}
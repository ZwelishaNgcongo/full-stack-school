// app/api/students/search/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("query");

    if (!query) {
      return NextResponse.json([]);
    }

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { studentId: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
          { surname: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
      select: {
        id: true,
        studentId: true,
        name: true,
        surname: true,
        img: true,
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Failed to search students:', error);
    return NextResponse.json(
      { error: 'Failed to search students' },
      { status: 500 }
    );
  }
}
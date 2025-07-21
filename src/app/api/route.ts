// app/api/announcements/route.ts
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    // For testing, allow fetching without userId/role (will get admin view)
    if (!userId && !role) {
      console.log('No userId/role provided, fetching admin view');
    }

    // Build the where clause based on role and userId
    let whereClause = {};

    if (role && role !== "admin" && userId) {
      // Type-safe role conditions
      const roleCondition = (() => {
        switch (role) {
          case 'teacher':
            return { lessons: { some: { teacherId: userId } } };
          case 'student':
            return { students: { some: { id: userId } } };
          case 'parent':
            return { students: { some: { parentId: userId } } };
          default:
            return {};
        }
      })();

      whereClause = {
        OR: [
          { classId: null },
          { class: roleCondition },
        ],
      };
    }

    const data = await prisma.announcement.findMany({
      take: 3,
      orderBy: { date: "desc" },
      where: whereClause,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
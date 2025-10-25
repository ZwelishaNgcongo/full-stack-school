// app/api/announcements/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    const { title, description, date, classId } = body;

    // Validate required fields
    if (!title || !description || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate date
    const announcementDate = new Date(date);
    if (isNaN(announcementDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Validate classId if provided
    if (classId !== null && classId !== undefined) {
      const classExists = await prisma.class.findUnique({
        where: { id: classId },
      });

      if (!classExists) {
        return NextResponse.json(
          { error: "Class not found" },
          { status: 404 }
        );
      }
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        date: announcementDate,
        classId: classId || null,
      },
      include: {
        class: true,
      },
    });

    console.log("Created announcement:", announcement);

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { 
        error: "Failed to create announcement",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}
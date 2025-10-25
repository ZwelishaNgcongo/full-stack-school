// app/api/announcements/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { title, description, date, classId } = body;

    if (!title || !description || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        description,
        date: new Date(date),
        classId: classId || null,
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
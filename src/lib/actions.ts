"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  ParentSchema,
  ResultSchema,
  ReportSchema,
  examSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import fs from "fs";
import path from "path";

type CurrentState = { success: boolean; error: boolean };

// Type definitions for Prisma results
interface LessonResult {
  id: number;
  name: string;
  startTime: Date;
  endTime: Date;
  day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";
  subjectId: number;
  classId: number;
  teacherId: string;
}

/* ------------------- PARENT ------------------- */

export const createParent = async (state: any, data: ParentSchema) => {
  try {
    console.log("Creating parent with data:", data);

    if (!data.password) {
      console.error("Password is required for parent creation");
      return { success: false, error: true };
    }

    if (!data.studentId) {
      console.error("Student ID is required for parent creation");
      return { success: false, error: true };
    }

    console.log("Checking if student exists with studentId:", data.studentId);
    const studentExists = await prisma.student.findUnique({
      where: { studentId: data.studentId },
      select: { id: true, studentId: true, name: true, surname: true }
    });

    if (!studentExists) {
      console.error("Student not found with studentId:", data.studentId);
      const availableStudents = await prisma.student.findMany({ 
        select: { id: true, studentId: true, name: true, surname: true } 
      });
      console.log("Available students:", availableStudents);
      return { success: false, error: true };
    }

    console.log("Student found:", studentExists.name, studentExists.surname, "ID:", studentExists.studentId);

    const existingParent = await prisma.parent.findUnique({
      where: { username: data.username },
    });

    if (existingParent) {
      console.error("Username already exists:", data.username);
      return { success: false, error: true };
    }

    const existingParentForStudent = await prisma.parent.findFirst({
      where: {
        students: {
          some: { id: studentExists.id }
        }
      }
    });

    if (existingParentForStudent) {
      console.error("Student already has a parent assigned:", data.studentId);
      return { success: false, error: true };
    }

    const createdParent = await prisma.parent.create({
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        password: data.password,
        students: {
          connect: { id: studentExists.id },
        },
      },
      include: {
        students: {
          select: { id: true, studentId: true, name: true, surname: true }
        },
      },
    });

    console.log("Parent created successfully:", createdParent.id);
    console.log("Connected to student:", createdParent.students);
    
    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error("createParent error:", err);
    if (err instanceof Error) {
      console.error("Error details:", err.message);
      console.error("Error stack:", err.stack);
    }
    return { success: false, error: true };
  }
};

export const updateParent = async (state: any, data: ParentSchema) => {
  try {
    console.log("Updating parent with data:", data);

    if (!data.id) {
      console.error("Parent ID is required for update");
      return { success: false, error: true };
    }

    const parentExists = await prisma.parent.findUnique({
      where: { id: data.id },
      include: { 
        students: {
          select: { id: true, studentId: true, name: true, surname: true }
        }
      }
    });

    if (!parentExists) {
      console.error("Parent not found with ID:", data.id);
      return { success: false, error: true };
    }

    let studentDatabaseId = null;
    if (data.studentId) {
      const studentExists = await prisma.student.findUnique({
        where: { studentId: data.studentId },
        select: { id: true, studentId: true, name: true, surname: true }
      });

      if (!studentExists) {
        console.error("Student not found with studentId:", data.studentId);
        return { success: false, error: true };
      }
      
      studentDatabaseId = studentExists.id;
      console.log("Student found for update:", studentExists.name, studentExists.surname, "ID:", studentExists.studentId);
    }

    const updateData: any = {
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
    };

    if (data.studentId && studentDatabaseId) {
      updateData.students = {
        set: [{ id: studentDatabaseId }],
      };
    }

    const updatedParent = await prisma.parent.update({
      where: { id: data.id },
      data: updateData,
      include: {
        students: {
          select: { id: true, studentId: true, name: true, surname: true }
        },
      },
    });

    console.log("Parent updated successfully:", updatedParent.id);
    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateParent error:", err);
    if (err instanceof Error) {
      console.error("Error details:", err.message);
    }
    return { success: false, error: true };
  }
};

export const deleteParent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.parent.delete({ where: { id } });
    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteParent error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- SUBJECT ------------------- */

export const createSubject = async (currentState: CurrentState, data: SubjectSchema) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers?.map((teacherId) => ({ id: teacherId })) || [],
        },
      },
    });
    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error("createSubject error:", err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (currentState: CurrentState, data: SubjectSchema) => {
  try {
    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers?.map((teacherId) => ({ id: teacherId })) || [],
        },
      },
    });
    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateSubject error:", err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  try {
    await prisma.subject.delete({ where: { id } });
    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteSubject error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- CLASS ------------------- */

export const createClass = async (currentState: CurrentState, data: ClassSchema) => {
  try {
    await prisma.class.create({ data });
    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error("createClass error:", err);
    return { success: false, error: true };
  }
};

export const updateClass = async (currentState: CurrentState, data: ClassSchema) => {
  try {
    await prisma.class.update({
      where: { id: data.id },
      data,
    });
    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateClass error:", err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  try {
    await prisma.class.delete({ where: { id } });
    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteClass error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- TEACHER ------------------- */

export const createTeacher = async (currentState: CurrentState, data: TeacherSchema) => {
  try {
    const { password, ...teacherData } = data;

    if (!password) {
      throw new Error("Password is required.");
    }

    await prisma.teacher.create({
      data: {
        username: teacherData.username,
        name: teacherData.name,
        surname: teacherData.surname,
        email: teacherData.email || null,
        phone: teacherData.phone || null,
        address: teacherData.address,
        img: teacherData.img || null,
        sex: teacherData.sex,
        birthday: teacherData.birthday,
        password,
        subjects: {
          connect: teacherData.subjects?.map((subjectId) => ({
            id: Number(subjectId),
          })) || [],
        },
      },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error("createTeacher error:", err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (currentState: CurrentState, data: TeacherSchema) => {
  if (!data.id) return { success: false, error: true };
  try {
    const { password, ...teacherData } = data;
    
    await prisma.teacher.update({
      where: { id: data.id },
      data: {
        username: teacherData.username,
        name: teacherData.name,
        surname: teacherData.surname,
        email: teacherData.email || null,
        phone: teacherData.phone || null,
        address: teacherData.address,
        img: teacherData.img || null,
        sex: teacherData.sex,
        birthday: teacherData.birthday,
        subjects: {
          set: teacherData.subjects?.map((subjectId) => ({
            id: Number(subjectId),
          })) || [],
        },
      },
    });
    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateTeacher error:", err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.teacher.delete({ where: { id } });
    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteTeacher error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- STUDENT ------------------- */

export const createStudent = async (currentState: CurrentState, data: StudentSchema) => {
  try {
    console.log("createStudent called with data:", data);

    if (!data.username || !data.name || !data.surname || !data.birthday || !data.sex) {
      console.error("Missing required fields:", { 
        username: !!data.username, 
        name: !!data.name, 
        surname: !!data.surname, 
        birthday: !!data.birthday, 
        sex: !!data.sex 
      });
      return { success: false, error: true };
    }

    if (!data.gradeId || !data.classId) {
      console.error("Missing grade or class:", { gradeId: data.gradeId, classId: data.classId });
      return { success: false, error: true };
    }

    const generateUniqueId = () => {
      return `stu_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    };

    const studentData = {
      id: data.id || generateUniqueId(),
      studentId: data.studentId || data.username,
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      password: data.password || "defaultpass123",
      sex: data.sex,
      birthday: typeof data.birthday === 'string' ? new Date(data.birthday) : data.birthday,
      gradeId: data.gradeId,
      classId: data.classId,
      parentId: data.parentId || null,
      img: null,
    };

    console.log("Prepared student data:", studentData);

    const [gradeExists, classExists] = await Promise.all([
      prisma.grade.findUnique({ where: { id: studentData.gradeId } }),
      prisma.class.findUnique({ where: { id: studentData.classId } })
    ]);

    if (!gradeExists) {
      console.error("Grade not found:", studentData.gradeId);
      return { success: false, error: true };
    }

    if (!classExists) {
      console.error("Class not found:", studentData.classId);
      return { success: false, error: true };
    }

    console.log("Grade and class validation passed");

    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [
          { username: studentData.username },
          { studentId: studentData.studentId }
        ]
      }
    });

    if (existingStudent) {
      console.error("Student already exists:", existingStudent);
      return { success: false, error: true };
    }

    const createdStudent = await prisma.student.create({ 
      data: studentData,
      include: {
        class: true,
        grade: true
      }
    });

    console.log("Student created successfully:", createdStudent.id);
    
    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("createStudent error:", err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (currentState: CurrentState, data: StudentSchema) => {
  try {
    console.log("Updating student with data object");

    if (!data.id) throw new Error("Database ID is required for update.");

    const updateData: any = {
      studentId: data.studentId || data.username,
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || "Not provided",
      sex: data.sex,
      birthday: new Date(data.birthday),
    };

    if (data.gradeId) updateData.gradeId = data.gradeId;
    if (data.classId) updateData.classId = data.classId;
    if (data.parentId) updateData.parentId = data.parentId;

    console.log("Updating student with:", updateData);

    await prisma.student.update({
      where: { id: data.id },
      data: updateData,
    });

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateStudent error:", err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.student.delete({ where: { id } });
    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteStudent error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- LESSON ------------------- */

export const createLesson = async (currentState: CurrentState, data: any) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(`1970-01-01T${data.startTime}:00`),
        endTime: new Date(`1970-01-01T${data.endTime}:00`),
        subjectId: Number(data.subjectId),
        classId: Number(data.classId),
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.error("createLesson error:", err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (currentState: CurrentState, data: any) => {
  try {
    if (!data.id) {
      return { success: false, error: true };
    }

    await prisma.lesson.update({
      where: {
        id: Number(data.id),
      },
      data: {
        name: data.name,
        day: data.day,
        startTime: new Date(`1970-01-01T${data.startTime}:00`),
        endTime: new Date(`1970-01-01T${data.endTime}:00`),
        subjectId: Number(data.subjectId),
        classId: Number(data.classId),
        teacherId: data.teacherId,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.error("updateLesson error:", err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  
  try {
    await prisma.lesson.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteLesson error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- EXAM ------------------- */

export const createExam = async (
  currentState: { success: boolean; error: boolean },
  data: ExamSchema
) => {
  try {
    const examData = {
      title: data.title,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    };

    const exam = await prisma.exam.create({
      data: examData,
    });

    if (data.lessonIds && data.lessonIds.length > 0) {
      await prisma.examLesson.createMany({
        data: data.lessonIds.map((lessonId: number) => ({
          examId: exam.id,
          lessonId: lessonId,
        })),
      });
    }

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating exam:", err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: { success: boolean; error: boolean },
  data: ExamSchema
) => {
  try {
    if (!data.id) {
      return { success: false, error: true };
    }

    const examData = {
      title: data.title,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    };

    await prisma.exam.update({
      where: { id: data.id },
      data: examData,
    });

    // Delete existing lesson associations
    await prisma.examLesson.deleteMany({
      where: { examId: data.id },
    });

    // Create new lesson associations
    if (data.lessonIds && data.lessonIds.length > 0) {
      await prisma.examLesson.createMany({
        data: data.lessonIds.map((lessonId: number) => ({
          examId: data.id!,
          lessonId: lessonId,
        })),
      });
    }

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating exam:", err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: { success: boolean; error: boolean },
  formData: FormData
) => {
  try {
    const id = formData.get("id");
    
    // The examLesson records will be deleted automatically if you have
    // onDelete: Cascade in your Prisma schema
    await prisma.exam.delete({
      where: { id: Number(id) },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting exam:", err);
    return { success: false, error: true };
  }
};

// Helper function to get exam details with all related data
export const getExamWithDetails = async (examId: number) => {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        lessons: {
          include: {
            lesson: {
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                class: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                teacher: {
                  select: {
                    id: true,
                    name: true,
                    surname: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!exam) return null;

    // Transform the data for easier consumption
    return {
      id: exam.id,
      title: exam.title,
      startTime: exam.startTime,
      endTime: exam.endTime,
      lessons: exam.lessons.map((el) => ({
        id: el.lesson.id,
        name: el.lesson.name,
        subject: el.lesson.subject,
        class: el.lesson.class,
        teacher: el.lesson.teacher,
      })),
    };
  } catch (err) {
    console.error("Error getting exam details:", err);
    return null;
  }
};

// Helper function to get all exams with their lessons
export const getAllExamsWithLessons = async () => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        lessons: {
          include: {
            lesson: {
              include: {
                subject: {
                  select: {
                    name: true,
                  },
                },
                class: {
                  select: {
                    name: true,
                    grade: {
                      select: {
                        level: true,
                      },
                    },
                  },
                },
                teacher: {
                  select: {
                    name: true,
                    surname: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return exams;
  } catch (err) {
    console.error("Error getting all exams:", err);
    return [];
  }
};

export const getLessons = async (type: "teacherId" | "classId", id: string | number) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number },
    });

    const events = lessons.map((lesson: LessonResult) => ({
      title: lesson.name,
      start: lesson.startTime,
      end: lesson.endTime,
    }));

    return { success: true, data: events, error: false };
  } catch (err) {
    console.error("getLessons error:", err);
    return { success: false, data: [], error: true };
  }
};

/* ------------------- ASSIGNMENT ------------------- */

export const createAssignment = async (currentState: any, formData: FormData) => {
  try {
    console.log("=== CREATE ASSIGNMENT START ===");

    // Extract data from FormData
    const title = formData.get("title") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const dueDate = new Date(formData.get("dueDate") as string);
    const lessonIds = formData.getAll("lessonIds").map(id => Number(id));
    const file = formData.get("file") as File | null;

    console.log("Parsed data:", { title, startDate, dueDate, lessonIds });

    // Validate required fields
    if (!title || !startDate || !dueDate || lessonIds.length === 0) {
      console.error("Missing required fields");
      return { success: false, error: true };
    }

    // Validate all lessons exist
    const lessonsExist = await prisma.lesson.findMany({
      where: { id: { in: lessonIds } },
    });

    if (lessonsExist.length !== lessonIds.length) {
      console.error("Some lessons not found");
      return { success: false, error: true };
    }

    console.log("All lessons found:", lessonsExist.map(l => l.name));

    // Handle file upload if present
    let fileUrl: string | null = null;
    
    if (file && file.size > 0) {
      console.log("Processing file:", file.name, "Size:", file.size);
      
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "assignments");
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFilename = `${timestamp}_${sanitizedFilename}`;
      
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(uploadsDir, uniqueFilename);
      fs.writeFileSync(filePath, buffer);

      fileUrl = `/uploads/assignments/${uniqueFilename}`;
      console.log("File saved:", fileUrl);
    }

    // Create assignment for each selected lesson
    const createdAssignments = await Promise.all(
      lessonIds.map(async (lessonId) => {
        return await prisma.assignment.create({
          data: {
            title,
            startDate,
            dueDate,
            lessonId,
            fileUrl,
          },
        });
      })
    );

    console.log("Assignments created successfully:", createdAssignments.length);
    console.log("=== CREATE ASSIGNMENT END ===");

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.error("=== CREATE ASSIGNMENT ERROR ===");
    console.error("Error:", err);
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }
    return { success: false, error: true };
  }
};

export const updateAssignment = async (currentState: any, formData: FormData) => {
  try {
    console.log("=== UPDATE ASSIGNMENT START ===");

    const id = Number(formData.get("id"));
    const title = formData.get("title") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const dueDate = new Date(formData.get("dueDate") as string);
    const lessonIds = formData.getAll("lessonIds").map(id => Number(id));
    const file = formData.get("file") as File | null;

    console.log("Parsed data:", { id, title, startDate, dueDate, lessonIds });

    if (!id || !title || !startDate || !dueDate || lessonIds.length === 0) {
      console.error("Missing required fields");
      return { success: false, error: true };
    }

    // Check if assignment exists
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id },
    });

    if (!existingAssignment) {
      console.error("Assignment not found:", id);
      return { success: false, error: true };
    }

    console.log("Existing assignment found:", existingAssignment.title);

    // Handle file upload
    let fileUrl: string | undefined;

    if (file && file.size > 0) {
      console.log("Processing new file:", file.name);
      
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "assignments");
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFilename = `${timestamp}_${sanitizedFilename}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(uploadsDir, uniqueFilename);
      fs.writeFileSync(filePath, buffer);

      fileUrl = `/uploads/assignments/${uniqueFilename}`;
      console.log("New file saved:", fileUrl);

      // Delete old file
      if (existingAssignment.fileUrl) {
        const oldFilePath = path.join(process.cwd(), "public", existingAssignment.fileUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log("Old file deleted");
        }
      }
    }

    // Delete existing assignments with the same title (old approach)
    // or just update the current one if only one lesson is selected
    if (lessonIds.length === 1) {
      // Simple update for single lesson
      const updateData: any = {
        title,
        startDate,
        dueDate,
        lessonId: lessonIds[0],
      };

      if (fileUrl) {
        updateData.fileUrl = fileUrl;
      }

      await prisma.assignment.update({
        where: { id },
        data: updateData,
      });
    } else {
      // For multiple lessons: delete old, create new ones
      await prisma.assignment.delete({ where: { id } });

      await Promise.all(
        lessonIds.map(async (lessonId) => {
          return await prisma.assignment.create({
            data: {
              title,
              startDate,
              dueDate,
              lessonId,
              fileUrl: fileUrl || existingAssignment.fileUrl,
            },
          });
        })
      );
    }

    console.log("Assignment(s) updated successfully");
    console.log("=== UPDATE ASSIGNMENT END ===");

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.error("=== UPDATE ASSIGNMENT ERROR ===");
    console.error("Error:", err);
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (currentState: any, formData: FormData) => {
  const id = Number(formData.get("id"));
  try {
    // Get assignment to delete file
    const assignment = await prisma.assignment.findUnique({
      where: { id },
    });

    if (assignment?.fileUrl) {
      const filePath = path.join(process.cwd(), "public", assignment.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("File deleted:", assignment.fileUrl);
      }
    }

    await prisma.assignment.delete({
      where: { id },
    });
    
    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteAssignment error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- HELPER FUNCTIONS ------------------- */

/**
 * Fetch class with all students for the form
 */
export async function getClassWithStudents(classId: number) {
  return await prisma.class.findUnique({
    where: { id: classId },
    include: {
      supervisor: {
        select: {
          id: true,
          name: true,
          surname: true,
        },
      },
      grade: {
        select: {
          id: true,
          level: true,
        },
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
        select: {
          students: true,
        },
      },
    },
  });
}

/**
 * Get all teachers for supervisor assignment
 */
export async function getAllTeachers() {
  return await prisma.teacher.findMany({
    select: {
      id: true,
      name: true,
      surname: true,
    },
    orderBy: [
      { surname: "asc" },
      { name: "asc" },
    ],
  });
}

/**
 * Helper to get related data for forms
 */
export async function getClassFormRelatedData() {
  const [teachers, grades] = await Promise.all([
    prisma.teacher.findMany({
      select: { id: true, name: true, surname: true },
      orderBy: [{ surname: "asc" }, { name: "asc" }],
    }),
    prisma.grade.findMany({
      select: { id: true, level: true },
      orderBy: { level: "asc" },
    }),
  ]);

  return { teachers, grades };
}

/**
 * Get class statistics for dashboard
 */
export async function getClassStatistics() {
  const classes = await prisma.class.findMany({
    include: {
      _count: {
        select: { students: true },
      },
      students: {
        select: { sex: true },
      },
    },
  });

  const stats = classes.map(cls => {
    const maleCount = cls.students.filter(s => s.sex === "MALE").length;
    const femaleCount = cls.students.filter(s => s.sex === "FEMALE").length;

    return {
      id: cls.id,
      name: cls.name,
      totalStudents: cls._count.students,
      maleCount,
      femaleCount,
      capacity: cls.capacity,
      utilizationRate: (cls._count.students / cls.capacity) * 100,
    };
  });

  return stats;
}

/**
 * Export class register to CSV or similar format
 */
export async function exportClassRegister(classId: number) {
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: {
        select: {
          studentId: true,
          name: true,
          surname: true,
          sex: true,
          birthday: true,
          email: true,
          phone: true,
        },
        orderBy: [
          { surname: "asc" },
          { name: "asc" },
        ],
      },
      supervisor: {
        select: {
          name: true,
          surname: true,
        },
      },
      grade: {
        select: {
          level: true,
        },
      },
    },
  });

  if (!classData) {
    throw new Error("Class not found");
  }

  const registerData = {
    className: classData.name,
    grade: `Grade ${classData.grade.level === 0 ? 'R' : classData.grade.level}`,
    supervisor: classData.supervisor 
      ? `${classData.supervisor.name} ${classData.supervisor.surname}`
      : "No supervisor assigned",
    capacity: classData.capacity,
    totalStudents: classData.students.length,
    maleCount: classData.students.filter(s => s.sex === "MALE").length,
    femaleCount: classData.students.filter(s => s.sex === "FEMALE").length,
    students: classData.students,
  };

  return registerData;
}

/**
 * Bulk assign students to a class
 */
export async function bulkAssignStudentsToClass(
  studentIds: string[],
  classId: number
) {
  try {
    await prisma.student.updateMany({
      where: {
        id: {
          in: studentIds,
        },
      },
      data: {
        classId: classId,
      },
    });

    revalidatePath("/list/classes");
    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error bulk assigning students:", err);
    return { success: false, error: true };
  }
}

/**
 * Fetch all lessons for assignment selection
 */
export const getAllLessons = async () => {
  try {
    const lessons = await prisma.lesson.findMany({
      select: {
        id: true,
        name: true,
        subject: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
        class: { 
          select: { 
            name: true,
            grade: { select: { level: true } }
          } 
        },
      },
      orderBy: { name: "asc" },
    });
    return lessons;
  } catch (err) {
    console.error("getAllLessons error:", err);
    return [];
  }
};

/* ------------------- RESULTS ------------------- */

export const createResult = async (currentState: CurrentState, data: ResultSchema) => {
  try {
    console.log("=== CREATE RESULT START ===");
    console.log("Received data:", data);

    // Validate required fields
    if (!data.studentId || data.score === undefined || data.score === null) {
      console.error("Missing required fields");
      return { success: false, error: true };
    }

    // Validate score range
    if (data.score < 0 || data.score > 100) {
      console.error("Score out of range:", data.score);
      return { success: false, error: true };
    }

    // Check if student exists
    const studentExists = await prisma.student.findUnique({
      where: { id: data.studentId },
    });

    if (!studentExists) {
      console.error("Student not found:", data.studentId);
      return { success: false, error: true };
    }

    // Prepare result data based on assessment type
    const resultData: any = {
      score: data.score,
      studentId: data.studentId,
    };

    if (data.assessmentType === "exam" && data.examId) {
      // Verify exam exists
      const examExists = await prisma.exam.findUnique({
        where: { id: data.examId },
      });

      if (!examExists) {
        console.error("Exam not found:", data.examId);
        return { success: false, error: true };
      }

      resultData.examId = data.examId;
      
      // Check for duplicate result
      const existingResult = await prisma.result.findFirst({
        where: {
          studentId: data.studentId,
          examId: data.examId,
        },
      });

      if (existingResult) {
        console.error("Result already exists for this student and exam");
        return { success: false, error: true };
      }
    } else if (data.assessmentType === "assignment" && data.assignmentId) {
      // Verify assignment exists
      const assignmentExists = await prisma.assignment.findUnique({
        where: { id: data.assignmentId },
      });

      if (!assignmentExists) {
        console.error("Assignment not found:", data.assignmentId);
        return { success: false, error: true };
      }

      resultData.assignmentId = data.assignmentId;
      
      // Check for duplicate result
      const existingResult = await prisma.result.findFirst({
        where: {
          studentId: data.studentId,
          assignmentId: data.assignmentId,
        },
      });

      if (existingResult) {
        console.error("Result already exists for this student and assignment");
        return { success: false, error: true };
      }
    } else {
      console.error("Invalid assessment type or missing assessment ID");
      return { success: false, error: true };
    }

    // Create the result
    const createdResult = await prisma.result.create({
      data: resultData,
      include: {
        student: { select: { name: true, surname: true } },
        exam: { 
          select: { 
            title: true,
            lessons: {
              include: {
                lesson: {
                  select: {
                    subject: { select: { name: true } },
                    class: { select: { name: true } },
                  }
                }
              }
            }
          } 
        },
        assignment: { 
          select: { 
            title: true,
            lesson: {
              select: {
                subject: { select: { name: true } },
                class: { select: { name: true } },
              }
            }
          } 
        },
      },
    });

    console.log("Result created successfully:", createdResult.id);
    console.log("=== CREATE RESULT END ===");

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error("=== CREATE RESULT ERROR ===");
    console.error("Error:", err);
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }
    return { success: false, error: true };
  }
};

export const updateResult = async (currentState: CurrentState, data: ResultSchema) => {
  try {
    console.log("=== UPDATE RESULT START ===");
    console.log("Received data:", data);

    if (!data.id) {
      console.error("Result ID is required for update");
      return { success: false, error: true };
    }

    // Check if result exists
    const existingResult = await prisma.result.findUnique({
      where: { id: data.id },
    });

    if (!existingResult) {
      console.error("Result not found:", data.id);
      return { success: false, error: true };
    }

    // Validate score range
    if (data.score < 0 || data.score > 100) {
      console.error("Score out of range:", data.score);
      return { success: false, error: true };
    }

    // Prepare update data
    const updateData: any = {
      score: data.score,
    };

    // Optionally update student if changed
    if (data.studentId && data.studentId !== existingResult.studentId) {
      const studentExists = await prisma.student.findUnique({
        where: { id: data.studentId },
      });

      if (!studentExists) {
        console.error("Student not found:", data.studentId);
        return { success: false, error: true };
      }

      updateData.studentId = data.studentId;
    }

    // Update exam or assignment if changed
    if (data.assessmentType === "exam" && data.examId) {
      const examExists = await prisma.exam.findUnique({
        where: { id: data.examId },
      });

      if (!examExists) {
        console.error("Exam not found:", data.examId);
        return { success: false, error: true };
      }

      updateData.examId = data.examId;
      updateData.assignmentId = null; // Clear assignment if switching to exam
    } else if (data.assessmentType === "assignment" && data.assignmentId) {
      const assignmentExists = await prisma.assignment.findUnique({
        where: { id: data.assignmentId },
      });

      if (!assignmentExists) {
        console.error("Assignment not found:", data.assignmentId);
        return { success: false, error: true };
      }

      updateData.assignmentId = data.assignmentId;
      updateData.examId = null; // Clear exam if switching to assignment
    }

    // Update the result
    const updatedResult = await prisma.result.update({
      where: { id: data.id },
      data: updateData,
      include: {
        student: { select: { name: true, surname: true } },
        exam: { 
          select: { 
            title: true,
            lessons: {
              include: {
                lesson: {
                  select: {
                    subject: { select: { name: true } },
                    class: { select: { name: true } },
                  }
                }
              }
            }
          } 
        },
        assignment: { 
          select: { 
            title: true,
            lesson: {
              select: {
                subject: { select: { name: true } },
                class: { select: { name: true } },
              }
            }
          } 
        },
      },
    });

    console.log("Result updated successfully:", updatedResult.id);
    console.log("=== UPDATE RESULT END ===");

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error("=== UPDATE RESULT ERROR ===");
    console.error("Error:", err);
    if (err instanceof Error) {
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
    }
    return { success: false, error: true };
  }
};

export const deleteResult = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  
  try {
    console.log("Deleting result:", id);

    const resultExists = await prisma.result.findUnique({
      where: { id },
    });

    if (!resultExists) {
      console.error("Result not found:", id);
      return { success: false, error: true };
    }

    await prisma.result.delete({
      where: { id },
    });

    console.log("Result deleted successfully:", id);
    
    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteResult error:", err);
    return { success: false, error: true };
  }
};

/* ------------------- REPORTS ------------------- */

export const createReport = async (currentState: any, data: ReportSchema) => {
  try {
    console.log("=== CREATE REPORT START ===");
    console.log("Received data:", data);

    // Validate required fields
    if (!data.studentId || !data.subjectId || !data.term || !data.year || data.marks === undefined) {
      console.error("Missing required fields");
      return { success: false, error: true };
    }

    // Check if student exists
    const studentExists = await prisma.student.findUnique({
      where: { id: data.studentId },
      include: {
        class: {
          include: {
            grade: true,
          },
        },
      },
    });

    if (!studentExists) {
      console.error("Student not found:", data.studentId);
      return { success: false, error: true };
    }

    // Check if subject exists
    const subjectExists = await prisma.subject.findUnique({
      where: { id: data.subjectId },
    });

    if (!subjectExists) {
      console.error("Subject not found:", data.subjectId);
      return { success: false, error: true };
    }

    // Check for duplicate report
    const existingReport = await prisma.report.findFirst({
      where: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        term: data.term,
        year: data.year,
      },
    });

    if (existingReport) {
      console.error("Report already exists for this student, subject, term, and year");
      return { success: false, error: true };
    }

    // Calculate grade based on marks
    const calculateGrade = (marks: number): string => {
      if (marks >= 80) return "A";
      if (marks >= 70) return "B";
      if (marks >= 60) return "C";
      if (marks >= 50) return "D";
      if (marks >= 40) return "E";
      return "F";
    };

    const grade = calculateGrade(data.marks);

    // Create the report
    const createdReport = await prisma.report.create({
      data: {
        studentId: data.studentId,
        subjectId: data.subjectId,
        term: data.term,
        year: data.year,
        marks: data.marks,
        grade: grade,
        teacherComment: data.teacherComment || null,
      },
      include: {
        student: { select: { name: true, surname: true, studentId: true } },
        subject: { select: { name: true } },
      },
    });

    console.log("Report created successfully:", createdReport.id);
    console.log("=== CREATE REPORT END ===");

    revalidatePath("/list/reports");
    return { success: true, error: false };
  } catch (err) {
    console.error("=== CREATE REPORT ERROR ===");
    console.error("Error:", err);
    return { success: false, error: true };
  }
};

export const updateReport = async (currentState: any, data: ReportSchema) => {
  try {
    console.log("=== UPDATE REPORT START ===");
    console.log("Received data:", data);

    if (!data.id) {
      console.error("Report ID is required for update");
      return { success: false, error: true };
    }

    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id: data.id },
    });

    if (!existingReport) {
      console.error("Report not found:", data.id);
      return { success: false, error: true };
    }

    // Calculate grade based on marks
    const calculateGrade = (marks: number): string => {
      if (marks >= 80) return "A";
      if (marks >= 70) return "B";
      if (marks >= 60) return "C";
      if (marks >= 50) return "D";
      if (marks >= 40) return "E";
      return "F";
    };

    const grade = calculateGrade(data.marks);

    // Update the report
    const updatedReport = await prisma.report.update({
      where: { id: data.id },
      data: {
        marks: data.marks,
        grade: grade,
        teacherComment: data.teacherComment || null,
      },
      include: {
        student: { select: { name: true, surname: true, studentId: true } },
        subject: { select: { name: true } },
      },
    });

    console.log("Report updated successfully:", updatedReport.id);
    console.log("=== UPDATE REPORT END ===");

    revalidatePath("/list/reports");
    return { success: true, error: false };
  } catch (err) {
    console.error("=== UPDATE REPORT ERROR ===");
    console.error("Error:", err);
    return { success: false, error: true };
  }
};

export const deleteReport = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  
  try {
    console.log("Deleting report:", id);

    const reportExists = await prisma.report.findUnique({
      where: { id },
    });

    if (!reportExists) {
      console.error("Report not found:", id);
      return { success: false, error: true };
    }

    await prisma.report.delete({
      where: { id },
    });

    console.log("Report deleted successfully:", id);
    
    revalidatePath("/list/reports");
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteReport error:", err);
    return { success: false, error: true };
  }
};
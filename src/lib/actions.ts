"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  ParentSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";

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

    // Validate required fields
    if (!data.password) {
      console.error("Password is required for parent creation");
      return { success: false, error: true };
    }

    if (!data.studentId) {
      console.error("Student ID is required for parent creation");
      return { success: false, error: true };
    }

    // Check if student exists before creating parent
    console.log("Checking if student exists with ID:", data.studentId);
    const studentExists = await prisma.student.findUnique({
      where: { id: data.studentId },
      select: { id: true, name: true, surname: true }
    });

    if (!studentExists) {
      console.error("Student not found with ID:", data.studentId);
      // Log available students for debugging
      const availableStudents = await prisma.student.findMany({ 
        select: { id: true, name: true, surname: true } 
      });
      console.log("Available students:", availableStudents);
      return { success: false, error: true };
    }

    console.log("Student found:", studentExists.name, studentExists.surname);

    // Check if username is already taken
    const existingParent = await prisma.parent.findUnique({
      where: { username: data.username },
    });

    if (existingParent) {
      console.error("Username already exists:", data.username);
      return { success: false, error: true };
    }

    // Check if this student already has a parent
    const existingParentForStudent = await prisma.parent.findFirst({
      where: {
        students: {
          some: { id: data.studentId }
        }
      }
    });

    if (existingParentForStudent) {
      console.error("Student already has a parent assigned:", data.studentId);
      return { success: false, error: true };
    }

    // Create the parent
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
          connect: { id: data.studentId },
        },
      },
      include: {
        students: {
          select: { id: true, name: true, surname: true }
        },
      },
    });

    console.log("Parent created successfully:", createdParent.id);
    console.log("Connected to student:", createdParent.students);
    
    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error("createParent error:", err);
    // Log the specific Prisma error details
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

    // Check if parent exists
    const parentExists = await prisma.parent.findUnique({
      where: { id: data.id },
      include: { students: true }
    });

    if (!parentExists) {
      console.error("Parent not found with ID:", data.id);
      return { success: false, error: true };
    }

    // If studentId is provided, check if student exists
    if (data.studentId) {
      const studentExists = await prisma.student.findUnique({
        where: { id: data.studentId },
      });

      if (!studentExists) {
        console.error("Student not found with ID:", data.studentId);
        return { success: false, error: true };
      }
    }

    // Build update data
    const updateData: any = {
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
    };

    // Only update student relationship if studentId is provided
    if (data.studentId) {
      updateData.students = {
        set: [{ id: data.studentId }],
      };
    }

    // Update the parent
    const updatedParent = await prisma.parent.update({
      where: { id: data.id },
      data: updateData,
      include: {
        students: {
          select: { id: true, name: true, surname: true }
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
          connect: data.teachers?.map((teacherId) => ({ id: teacherId })) || [], // Handle undefined teachers
        },
      },
    });
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
          set: data.teachers?.map((teacherId) => ({ id: teacherId })) || [], // Handle undefined teachers
        },
      },
    });
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
          })) || [], // Handle undefined subjects
        },
      },
    });

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
          })) || [], // Handle undefined subjects
        },
      },
    });
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

    // Validate required fields
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

    // Generate a unique ID for the student if not provided
    const generateUniqueId = () => {
      return `stu_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    };

    // Prepare student data for database - simplified like TeacherForm
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

    // Check that grade and class exist
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

    // Check for existing student with same username or studentId
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

    // Create the student
    const createdStudent = await prisma.student.create({ 
      data: studentData,
      include: {
        class: true,
        grade: true
      }
    });

    console.log("Student created successfully:", createdStudent.id);
    
    // IMPORTANT: Use revalidatePath to refresh the data
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
      birthday: new Date(data.birthday), // Convert string to Date
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

/* ------------------- EXAM ------------------- */

export const createExam = async (currentState: CurrentState, data: ExamSchema) => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("createExam error:", err);
    return { success: false, error: true };
  }
};

export const updateExam = async (currentState: CurrentState, data: ExamSchema) => {
  try {
    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("updateExam error:", err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (currentState: CurrentState, data: FormData) => {
  const id = Number(data.get("id"));
  try {
    await prisma.exam.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err) {
    console.error("deleteExam error:", err);
    return { success: false, error: true };
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
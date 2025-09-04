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

export const createParent = async (state: any, data: ParentSchema) => {
  try {
    if (!data.password) throw new Error("Password is required");

    await prisma.parent.create({
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
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("createParent error:", err);
    return { success: false, error: true };
  }
};

export const updateParent = async (state: any, data: ParentSchema) => {
  try {
    await prisma.parent.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        students: {
          set: [{ id: data.studentId }],
        },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("updateParent error:", err);
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
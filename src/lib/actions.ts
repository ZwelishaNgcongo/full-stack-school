"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";

type CurrentState = { success: boolean; error: boolean };

/* ------------------- SUBJECT ------------------- */

export const createSubject = async (currentState: CurrentState, data: SubjectSchema) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
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
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
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
        password, // ✅ Now guaranteed to be string
        subjects: {
          connect: teacherData.subjects?.map((subjectId) => ({
            id: Number(subjectId),
          })),
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
    // Destructure password from data and create update object without it
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
          })),
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
  const id = data.get("id") as string; // Teacher ID is a string
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
    if (!data.id) {
      throw new Error("Student ID is required.");
    }

    if (!data.password) {
      throw new Error("Password is required.");
    }

    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    await prisma.student.create({
      data: {
        id: data.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        password: data.password, // Safe now
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.error("createStudent error:", err);
    return { success: false, error: true };
  }
};



export const updateStudent = async (currentState: CurrentState, data: StudentSchema) => {
  if (!data.id) return { success: false, error: true };
  try {
    // Destructure password from data and create update object without it
    const { password, ...studentData } = data;
    
    await prisma.student.update({
      where: { id: data.id },
      data: {
        username: studentData.username,
        name: studentData.name,
        surname: studentData.surname,
        email: studentData.email || null,
        phone: studentData.phone || null,
        address: studentData.address,
        img: studentData.img || null,
       /*  bloodType: studentData.bloodType, */
        sex: studentData.sex,
        birthday: studentData.birthday,
        gradeId: studentData.gradeId,
        classId: studentData.classId,
        parentId: studentData.parentId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.error("updateStudent error:", err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (currentState: CurrentState, data: FormData) => {
  const id = data.get("id") as string; // Student ID is a string
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
        ? { teacherId: id as string } // teacherId is a string in schema
        : { classId: id as number },   // classId is a number in schema
    });

    const events = lessons.map((lesson) => ({
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
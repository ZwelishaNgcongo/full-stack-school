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
export const createStudent = async (currentState: CurrentState, formData: FormData) => {
  try {
    const studentData = {
      studentId: formData.get("studentId") as string,
      username: formData.get("username") as string,
      name: formData.get("name") as string,
      surname: formData.get("surname") as string,
      email: formData.get("email") ? String(formData.get("email")) : null,
      phone: formData.get("phone") ? String(formData.get("phone")) : null,
      address: formData.get("address") ? String(formData.get("address")) : null,
      password: formData.get("password") as string,
      sex: formData.get("sex") as "MALE" | "FEMALE",
      birthday: formData.get("birthday")
        ? new Date(formData.get("birthday") as string)
        : null,
      gradeId: formData.get("gradeId") ? Number(formData.get("gradeId")) : null,
      classId: formData.get("classId") ? Number(formData.get("classId")) : null,
      parentId: formData.get("parentId") ? Number(formData.get("parentId")) : null,
      img: null,
    };

    await prisma.student.create({ data: studentData });
    revalidatePath("/list/students");

    return { success: true, error: false };
  } catch (err) {
    console.error("createStudent error:", err);
    return { success: false, error: true };
  }
};




export const updateStudent = async (currentState: CurrentState, formData: FormData) => {
  try {
    console.log("Updating student with FormData");

    // Extract data from FormData
    const data = {
      id: formData.get("id") as string, // database primary key
      studentId: formData.get("studentId") as string, // school ID
      name: formData.get("name") as string,
      surname: formData.get("surname") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      birthday: formData.get("birthday") as string,
      sex: formData.get("sex") as string,
      classId: formData.get("classId") as string,
      gradeId: formData.get("gradeId") as string,
      parentId: formData.get("parentId") as string | null,
    };

    if (!data.id) throw new Error("Database ID is required for update.");

    const updateData: any = {
      studentId: data.studentId,
      username: data.studentId, // keep username aligned with Student ID
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || "Not provided",
      sex: data.sex as "MALE" | "FEMALE",
      birthday: new Date(data.birthday),
    };

    if (data.gradeId) updateData.gradeId = Number(data.gradeId);
    if (data.classId) updateData.classId = Number(data.classId);
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
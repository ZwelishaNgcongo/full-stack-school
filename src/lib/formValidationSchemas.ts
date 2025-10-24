import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()).optional(),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  supervisorId: z.string().optional(),
  description: z.string().optional()
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().min(1, { message: "Address is required!" }),
  img: z.string().optional(),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(),
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, { message: "Student ID is required!" }),
  username: z.string().min(1, { message: "Username is required!" }),
  name: z.string().min(1, { message: "Name is required!" }),
  surname: z.string().min(1, { message: "Surname is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"]),
  password: z.string().min(8, { message: "Password must be at least 8 characters!" }).optional(),
  gradeId: z.coerce.number(),
  classId: z.coerce.number(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  parentId: z.string().optional(),
});

export type StudentSchema = z.infer<typeof studentSchema>;



export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  lessonIds: z.array(z.number()).min(1, { message: "At least one class must be selected" }),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export type ExamSchema = z.infer<typeof examSchema>;

export const parentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "First name is required!" }),
  username: z.string().min(1, { message: "Username is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z.string().email({ message: "Invalid email address!" }).optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  password: z.string().min(8, { message: "Password must be at least 8 characters!" }).optional(),
  studentId: z.string().min(1, { message: "Student selection is required!" }),
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Lesson name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], {
    message: "Day is required!",
  }),
  startTime: z.string().min(1, { message: "Start time is required!" }),
  endTime: z.string().min(1, { message: "End time is required!" }),
  subjectId: z.coerce.number().min(1, { message: "Subject is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  teacherId: z.string().min(1, { message: "Teacher is required!" }),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  startDate: z.string().min(1, { message: "Start date is required!" }),
  dueDate: z.string().min(1, { message: "Due date is required!" }),
  lessonId: z.coerce.number().optional(), // Keep for backward compatibility
  lessonIds: z.array(z.coerce.number()).optional(), // For multiple lessons
  file: z.any().optional(),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  score: z.coerce.number()
    .min(0, { message: "Score must be at least 0!" })
    .max(100, { message: "Score cannot exceed 100!" }),
  assessmentType: z.enum(["exam", "assignment"], { 
    message: "Assessment type is required!" 
  }),
  examId: z.coerce.number().optional(),
  assignmentId: z.coerce.number().optional(),
  studentId: z.string().min(1, { message: "Student is required!" }),
}).refine(
  (data) => {
    // If assessmentType is exam, examId must be provided
    if (data.assessmentType === "exam") {
      return !!data.examId;
    }
    // If assessmentType is assignment, assignmentId must be provided
    if (data.assessmentType === "assignment") {
      return !!data.assignmentId;
    }
    return true;
  },
  {
    message: "Please select an exam or assignment",
    path: ["examId"], // This will show error on examId field
  }
);

export type ResultSchema = z.infer<typeof resultSchema>;
export const reportSchema = z.object({
  id: z.coerce.number().optional(),
  studentId: z.string().min(1, { message: "Student is required!" }),
  subjectId: z.coerce.number().min(1, { message: "Subject is required!" }),
  term: z.enum(["TERM1", "TERM2", "TERM3", "TERM4"], {
    message: "Term is required!",
  }),
  year: z.coerce.number().min(2020).max(2100, { message: "Valid year is required!" }),
  marks: z.coerce.number().min(0).max(100, { message: "Marks must be between 0 and 100!" }),
  grade: z.string().min(1, { message: "Grade is required!" }),
  teacherComment: z.string().optional(),
});

export type ReportSchema = z.infer<typeof reportSchema>;


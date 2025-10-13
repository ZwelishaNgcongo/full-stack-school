"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteParent,
  deleteLesson,
  deleteAssignment,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";

// Define the table types
type TableType =
  | "subject"
  | "class"
  | "teacher"
  | "student"
  | "exam"
  | "parent"
  | "lesson"
  | "assignment"
  | "result"
  | "attendance"
  | "event"
  | "announcement";

const deleteActionMap: Record<TableType, any> = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  parent: deleteParent,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteSubject,
  attendance: deleteSubject,
  event: deleteSubject,
  announcement: deleteSubject,
};

// USE LAZY LOADING
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const LessonForm = dynamic(() => import("./forms/lessonform"), {
  loading: () => <h1>Loading...</h1>,
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <h1>Loading...</h1>,
});

const forms: Record<
  string,
  (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element
> = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};

// Separate Delete Form Component
const DeleteForm = ({
  table,
  id,
  setOpen,
}: {
  table: TableType;
  id: string | number;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [state, formAction] = useFormState(deleteActionMap[table], {
    success: false,
    error: false,
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`${table.charAt(0).toUpperCase() + table.slice(1)} has been deleted!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, table, setOpen]);

  return (
    <div className="relative">
      {/* Close button for delete form */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="absolute -top-2 -right-2 w-8 h-8 bg-gray-100 hover:bg-red-100 border border-gray-300 hover:border-red-400 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md group z-10"
        aria-label="Close delete confirmation"
      >
        <svg
          className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <form action={formAction} className="p-4 flex flex-col gap-4">
        <input type="text" name="id" value={id} hidden readOnly />

        {/* Warning icon and message */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete {table.charAt(0).toUpperCase() + table.slice(1)}?
            </h3>
            <p className="text-gray-600">
              All data will be lost. Are you sure you want to delete this{" "}
              {table}?
            </p>
          </div>
        </div>

        {state.error && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
            <span className="text-red-700 text-center block">
              Something went wrong!
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
};

// Update the FormContainerProps interface or create a new interface
interface FormModalProps extends FormContainerProps {
  table: TableType;
  relatedData?: any;
}

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormModalProps) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);

  const renderForm = () => {
    if (type === "delete" && id) {
      return <DeleteForm table={table} id={id} setOpen={setOpen} />;
    } else if (type === "create" || type === "update") {
      return forms[table]
        ? forms[table](setOpen, type, data, relatedData)
        : "Form not found!";
    } else {
      return "Form not found!";
    }
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg shadow-lg relative 
                       w-full max-w-2xl lg:max-w-3xl 
                       max-h-[90vh] overflow-y-auto 
                       p-6 animate-scaleIn"
          >
            {renderForm()}
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
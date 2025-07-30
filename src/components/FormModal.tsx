"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
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
  // TODO: OTHER DELETE ACTIONS
  parent: deleteSubject,
  lesson: deleteSubject,
  assignment: deleteSubject,
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

const forms: Record<string, (
  setOpen: Dispatch<SetStateAction<boolean>>,
  type: "create" | "update",
  data?: any,
  relatedData?: any
) => JSX.Element> = {
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
};

// Separate Delete Form Component
const DeleteForm = ({ 
  table, 
  id, 
  setOpen 
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
      toast(`${table} has been deleted!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, table, setOpen]);

  return (
    <form action={formAction} className="p-4 flex flex-col gap-4">
      <input type="text" name="id" value={id} hidden readOnly />
      <span className="text-center font-medium">
        All data will be lost. Are you sure you want to delete this {table}?
      </span>
      {state.error && (
        <span className="text-red-500 text-center">Something went wrong!</span>
      )}
      <button 
        type="submit"
        className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center hover:bg-red-800 transition-colors"
      >
        Delete
      </button>
    </form>
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
      return forms[table] ? forms[table](setOpen, type, data, relatedData) : "Form not found!";
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
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            {renderForm()}
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
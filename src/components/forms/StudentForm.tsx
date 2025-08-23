"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useFormState } from "react-dom";

// ✅ Reusable InputField
const InputField = ({
  label,
  name,
  type = "text",
  defaultValue,
  register,
  error,
  hidden = false,
}: {
  label: string;
  name: keyof StudentSchema;
  type?: string;
  defaultValue?: string | number;
  register: any;
  error?: any;
  hidden?: boolean;
}) => (
  <div className={`w-full ${hidden ? "hidden" : ""}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      defaultValue={defaultValue}
      {...register(name)}
      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 transition text-base"
    />
    {error && (
      <p className="text-xs text-red-500 mt-1">{error.message?.toString()}</p>
    )}
  </div>
);

const GRADE_LEVELS = [
  { id: "R", label: "Grade R", level: 0 },
  { id: "1", label: "Grade 1", level: 1 },
  { id: "2", label: "Grade 2", level: 2 },
  { id: "3", label: "Grade 3", level: 3 },
  { id: "4", label: "Grade 4", level: 4 },
  { id: "5", label: "Grade 5", level: 5 },
  { id: "6", label: "Grade 6", level: 6 },
  { id: "7", label: "Grade 7", level: 7 },
  { id: "8", label: "Grade 8", level: 8 },
  { id: "9", label: "Grade 9", level: 9 },
  { id: "10", label: "Grade 10", level: 10 },
  { id: "11", label: "Grade 11", level: 11 },
  { id: "12", label: "Grade 12", level: 12 },
];

const CLASS_OPTIONS = ["A", "B", "C", "D", "E", "F"];

interface ClassData {
  id: number;
  name: string;
}

interface GradeData {
  id: number;
  level: number;
}

interface RelatedData {
  classes: ClassData[];
  grades: GradeData[];
}

const StudentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: RelatedData;
}) => {
  const {
    register,
    formState: { errors },
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createStudent : updateStudent,
    { success: false, error: false }
  );

  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    if (data?.class?.name) {
      const gradeMatch = data.class.name.match(/^(\d+|R)/);
      return gradeMatch ? gradeMatch[1] : "";
    }
    return "";
  });

  const [selectedClasses, setSelectedClasses] = useState<string[]>(() => {
    if (data?.class?.name) {
      const classMatch = data.class.name.match(/(\d+|R)([A-F])$/);
      return classMatch ? [classMatch[2]] : [];
    }
    return [];
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        type === "create"
          ? "Student created successfully!"
          : "Student updated successfully!"
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error("Something went wrong. Please try again.");
    }
  }, [state, type, setOpen, router]);

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedClasses([]);
  };

  const handleClassToggle = (classLetter: string) => {
    setSelectedClasses([classLetter]);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(false);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <form
        className="flex flex-col gap-8 max-h-[90vh] overflow-y-auto p-8 bg-white shadow-2xl rounded-2xl border border-gray-200"
        action={async (formData: FormData) => {
          if (!selectedGrade) {
            toast.error("Please select a grade");
            return;
          }
          if (selectedClasses.length === 0) {
            toast.error("Please select a class");
            return;
          }

          const selectedClassName = `${selectedGrade}${selectedClasses[0]}`;
          const matchedClass = relatedData?.classes?.find(
            (cls: ClassData) => cls.name === selectedClassName
          );
          const matchedGrade = relatedData?.grades?.find(
            (grade: GradeData) =>
              grade.level ===
              GRADE_LEVELS.find((g) => g.id === selectedGrade)?.level
          );

          if (!matchedClass || !matchedGrade) {
            toast.error("Matching class or grade not found.");
            return;
          }

          // Create a new FormData object and append all the necessary fields
          const finalFormData = new FormData();
          
          // Add all form fields to FormData
          if (data?.id) finalFormData.append("id", data.id);
          finalFormData.append("studentId", formData.get("username")?.toString() || data?.studentId || data?.username || "");
          finalFormData.append("username", formData.get("username")?.toString() || "");
          finalFormData.append("name", formData.get("name")?.toString() || "");
          finalFormData.append("surname", formData.get("surname")?.toString() || "");
          finalFormData.append("birthday", formData.get("birthday")?.toString() || "");
          finalFormData.append("sex", formData.get("sex")?.toString() || "");
          finalFormData.append("gradeId", matchedGrade.id.toString());
          finalFormData.append("classId", matchedClass.id.toString());
          
          // Optional fields
          const email = formData.get("email")?.toString();
          if (email) finalFormData.append("email", email);
          
          const phone = formData.get("phone")?.toString();
          if (phone) finalFormData.append("phone", phone);
          
          const address = formData.get("address")?.toString();
          if (address) finalFormData.append("address", address);
          
          if (data?.parentId) finalFormData.append("parentId", data.parentId.toString());
          
          // Password only for create
          if (type === "create") {
            const password = formData.get("password")?.toString();
            if (password) finalFormData.append("password", password);
          }

          await formAction(finalFormData);
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-extrabold text-indigo-700">
            {type === "create" ? "🎓 Register New Student" : "✏️ Update Student"}
          </h1>
          <button
            type="button"
            onClick={handleClose}
            className="flex-shrink-0 w-10 h-10 bg-gray-100 hover:bg-red-100 border border-gray-300 hover:border-red-400 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md group"
            aria-label="Close form"
          >
            <svg
              className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors duration-200"
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
        </div>

        {/* Student Info */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            Student Information
          </h2>
          <div className="flex flex-col gap-6">
            {data && (
              <InputField
                label="Id"
                name="id"
                defaultValue={data?.id}
                register={register}
                error={errors?.id}
                hidden
              />
            )}
            <InputField
              label="Student ID"
              name="username"
              defaultValue={data?.studentId || data?.username}
              register={register}
              error={errors.username}
            />
            <InputField
              label="First Name"
              name="name"
              defaultValue={data?.name}
              register={register}
              error={errors.name}
            />
            <InputField
              label="Last Name"
              name="surname"
              defaultValue={data?.surname}
              register={register}
              error={errors.surname}
            />
            <InputField
              label="Date of Birth"
              name="birthday"
              type="date"
              defaultValue={
                data?.birthday
                  ? new Date(data.birthday).toISOString().split("T")[0]
                  : ""
              }
              register={register}
              error={errors.birthday}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 transition text-base"
                {...register("sex")}
                defaultValue={data?.sex || ""}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {errors.sex?.message && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.sex.message.toString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Grade & Class */}
        <div className="space-y-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <span className="text-base uppercase text-gray-700 font-bold block">
            Grade & Class Assignment
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {GRADE_LEVELS.map((grade) => (
              <button
                key={grade.id}
                type="button"
                onClick={() => handleGradeChange(grade.id)}
                className={`p-3 rounded-lg text-sm font-semibold transition
                  ${
                    selectedGrade === grade.id
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  }`}
              >
                {grade.label}
              </button>
            ))}
          </div>

          {selectedGrade && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {CLASS_OPTIONS.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => handleClassToggle(cls)}
                  className={`p-3 rounded-lg text-sm font-semibold transition
                    ${
                      selectedClasses.includes(cls)
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-white border border-green-200 text-green-700 hover:bg-green-100"
                    }`}
                >
                  {selectedGrade}
                  {cls}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl shadow-sm border border-green-200">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            Contact Info (Optional)
          </h2>
          <div className="flex flex-col gap-6">
            <InputField
              label="Phone"
              name="phone"
              defaultValue={data?.phone}
              register={register}
              error={errors.phone}
            />
            <InputField
              label="Address"
              name="address"
              defaultValue={data?.address}
              register={register}
              error={errors.address}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              defaultValue={data?.email}
              register={register}
              error={errors.email}
            />
            {type === "create" && (
              <InputField
                label="Initial Password"
                name="password"
                type="password"
                register={register}
                error={errors.password}
              />
            )}
          </div>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
            <span className="text-red-700 font-medium">
              ⚠️ Something went wrong! Please try again.
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-6 border-t border-gray-300">
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-bold disabled:opacity-50 shadow-lg hover:shadow-xl"
            disabled={!selectedGrade || selectedClasses.length === 0}
          >
            {type === "create" ? "🚀 Create Student" : "💾 Update Student"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
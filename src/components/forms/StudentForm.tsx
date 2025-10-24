"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { z } from "zod";

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

interface ClassData {
  id: number;
  name: string;
  grade?: { level: number }; // Include grade info
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

  const router = useRouter();

  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedClassLetter, setSelectedClassLetter] = useState<string | null>(null);
  const [classExists, setClassExists] = useState<boolean | null>(null);

  // Pre-select when editing - FIXED VERSION
  useEffect(() => {
    if (!relatedData) return;
    
    // Ensure we're working with numbers, not strings
    if (data?.gradeId) {
      const numericGradeId = Number(data.gradeId);
      console.log('🔍 Setting gradeId:', numericGradeId, 'from data:', data.gradeId);
      setSelectedGradeId(numericGradeId);
    }
    
    if (data?.classId) {
      const numericClassId = Number(data.classId);
      console.log('🔍 Setting classId:', numericClassId, 'from data:', data.classId);
      setSelectedClassId(numericClassId);
    }

    // Parse class name to preselect letter
    if (data?.class?.name) {
      const match = data.class.name.match(/^(R|\d{1,2})([A-F])$/i);
      if (match) {
        const letter = match[2].toUpperCase();
        console.log('🔍 Setting class letter:', letter, 'from class name:', data.class.name);
        setSelectedClassLetter(letter);
      }
    }
  }, [data, relatedData]);

  const generateStudentId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `STU${year}${random}`;
  };

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
      toast.error(`Failed to ${type} student`);
    }
  }, [state, type, setOpen, router]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(false);
  };

  // Sort grades by level
  const sortedGrades = (relatedData?.grades ?? []).slice().sort((a, b) => a.level - b.level);

  // Find the selected grade's level - FIXED
  const selectedGradeLevel = selectedGradeId != null
    ? sortedGrades.find((g) => g.id === selectedGradeId)?.level
    : undefined;

  // Debug log
  useEffect(() => {
    if (selectedGradeId !== null) {
      const foundGrade = sortedGrades.find((g) => g.id === selectedGradeId);
      console.log('🔍 Selected Grade ID:', selectedGradeId);
      console.log('🔍 Found Grade:', foundGrade);
      console.log('🔍 Grade Level:', selectedGradeLevel);
    }
  }, [selectedGradeId, selectedGradeLevel, sortedGrades]);

  const CLASS_LETTERS = ["A", "B", "C", "D", "E", "F"];

  // Find matching class record
  const findClassRecordFor = (gradeLevel: number | undefined, letter: string) => {
    if (!relatedData?.classes || gradeLevel == null) return undefined;
    const gradePrefix = gradeLevel === 0 ? "R" : String(gradeLevel);
    const targetName = `${gradePrefix}${letter}`;
    
    const found = relatedData.classes.find((c) => c.name.toUpperCase() === targetName.toUpperCase());
    console.log('🔍 Looking for class:', targetName, '- Found:', found);
    return found;
  };

  const handleClassLetterSelect = (letter: string | null) => {
    setSelectedClassLetter(letter);
    if (!letter || selectedGradeLevel == null) {
      setSelectedClassId(null);
      setClassExists(null);
      return;
    }

    const record = findClassRecordFor(selectedGradeLevel, letter);
    if (record) {
      console.log('✅ Class exists:', record.name, 'ID:', record.id);
      setSelectedClassId(record.id);
      setClassExists(true);
    } else {
      console.log('❌ Class does not exist');
      setSelectedClassId(null);
      setClassExists(false);
    }
  };

  const handleGradeChange = (gradeId: number | null) => {
    console.log('📝 Grade changed to:', gradeId);
    setSelectedGradeId(gradeId);
    setSelectedClassId(null);
    setSelectedClassLetter(null);
    setClassExists(null);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <form
        className="flex flex-col gap-8 max-h-[90vh] overflow-y-auto p-8 bg-white shadow-2xl rounded-2xl border border-gray-200"
        action={async (formData: FormData) => {
          console.log("🚀 Form submission started");
          
          if (!selectedGradeId) {
            toast.error("Please select a grade");
            return;
          }
          if (!selectedClassId) {
            const gradePrefix = selectedGradeLevel === 0 ? "R" : String(selectedGradeLevel);
            const missingName = `${gradePrefix}${selectedClassLetter ?? ""}`;
            toast.error(
              selectedClassLetter
                ? `Class ${missingName} not found in database. Please create it before adding students.`
                : "Please select a class."
            );
            return;
          }

          const requiredFields = ['name', 'surname', 'birthday', 'sex'];
          const missingFields = requiredFields.filter(field => !formData.get(field));
          
          if (missingFields.length > 0) {
            toast.error(`Missing required fields: ${missingFields.join(', ')}`);
            return;
          }

          const sexValue = formData.get("sex")?.toString();
          if (!sexValue || (sexValue !== "MALE" && sexValue !== "FEMALE")) {
            toast.error("Please select a valid gender (Male or Female)");
            return;
          }

          const usernameValue = formData.get("username")?.toString();
          const studentIdValue = usernameValue || generateStudentId();
          
          if (!studentIdValue) {
            toast.error("Student ID/Username is required");
            return;
          }

          const dataObject = {
            id: formData.get("id")?.toString() || undefined,
            studentId: studentIdValue,
            username: studentIdValue,
            name: formData.get("name")?.toString()!,
            surname: formData.get("surname")?.toString()!,
            birthday: new Date(formData.get("birthday")!.toString()),
            sex: sexValue as "MALE" | "FEMALE",
            gradeId: selectedGradeId,
            classId: selectedClassId,
            email: formData.get("email")?.toString() || "",
            phone: formData.get("phone")?.toString() || "",
            address: formData.get("address")?.toString() || "",
            parentId: data?.parentId?.toString() || undefined,
            password: type === "create" 
              ? formData.get("password")?.toString() || "defaultpass123" 
              : undefined,
          };

          console.log("📝 Submitting data:", dataObject);

          try {
            const validatedData = studentSchema.parse(dataObject);
            console.log("✅ Zod validation passed");
            await formAction(validatedData);
          } catch (error) {
            if (error instanceof z.ZodError) {
              console.error("❌ Zod validation failed:", error.errors);
              error.errors.forEach(err => {
                toast.error(`${err.path.join('.')}: ${err.message}`);
              });
            } else {
              console.error("❌ Unexpected error:", error);
              toast.error("Failed to submit form");
            }
          }
        }}
      >
        <input type="hidden" name="gradeId" value={selectedGradeId ?? ""} />
        <input type="hidden" name="classId" value={selectedClassId ?? ""} />

        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-extrabold text-indigo-700">
            {type === "create" ? "Register New Student" : "Update Student"}
          </h1>
         
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
              label="Student ID / Username *"
              name="username"
              defaultValue={data?.studentId || data?.username}
              register={register}
              error={errors.username}
            />
            <InputField
              label="First Name *"
              name="name"
              defaultValue={data?.name}
              register={register}
              error={errors.name}
            />
            <InputField
              label="Last Name *"
              name="surname"
              defaultValue={data?.surname}
              register={register}
              error={errors.surname}
            />
            <InputField
              label="Date of Birth *"
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
                {...register("sex", { required: "Gender is required" })}
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
            Grade & Class Assignment *
          </span>

          {!relatedData?.grades?.length ? (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
              <span className="text-red-700">
                No grades found in database. Please create grade records first.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grade select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade *
                </label>
                <select
                  className="w-full p-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 transition text-base bg-white"
                  value={selectedGradeId ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleGradeChange(val ? Number(val) : null);
                  }}
                >
                  <option value="">Select grade</option>
                  {sortedGrades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.level === 0 ? "Grade R" : `Grade ${grade.level}`}
                    </option>
                  ))}
                </select>
                {/* Debug info - remove in production */}
                {selectedGradeId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selected ID: {selectedGradeId}, Level: {selectedGradeLevel}
                  </p>
                )}
              </div>

              {/* Class select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class (A–F) *
                </label>
                <select
                  className="w-full p-3 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-400 transition text-base bg-white"
                  value={selectedClassLetter ?? ""}
                  onChange={(e) =>
                    handleClassLetterSelect(e.target.value ? e.target.value : null)
                  }
                  disabled={!selectedGradeId}
                >
                  <option value="">
                    {selectedGradeId ? "Select class letter" : "Select grade first"}
                  </option>
                  {CLASS_LETTERS.map((L) => (
                    <option key={L} value={L}>
                      {selectedGradeLevel != null
                        ? `${selectedGradeLevel === 0 ? "R" : selectedGradeLevel}${L}`
                        : L}
                    </option>
                  ))}
                </select>

                {classExists === false && selectedClassLetter && (
                  <p className="mt-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                    Class{" "}
                    <span className="font-semibold">
                      {selectedGradeLevel === 0 ? "R" : selectedGradeLevel}
                      {selectedClassLetter}
                    </span>{" "}
                    does not exist in database. Please create it first.
                  </p>
                )}

                {classExists === true && (
                  <p className="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
                    ✓ Class exists (ID: {selectedClassId})
                  </p>
                )}
              </div>
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
                label="Initial Password (min 8 characters)"
                name="password"
                type="password"
                register={register}
                error={errors.password}
              />
            )}
          </div>
        </div>

        {state.error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
            <span className="text-red-700 font-medium">
              Something went wrong! Please check the console for details.
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-6 border-t border-gray-300">
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedGradeId || !selectedClassId}
          >
            {type === "create" ? "Create Student" : "Update Student"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
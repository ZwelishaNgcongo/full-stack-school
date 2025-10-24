"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createParent, updateParent } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { parentSchema, ParentSchema } from "@/lib/formValidationSchemas";
import { z } from "zod";

// Custom InputField component matching StudentForm pattern
const InputField = ({
  label,
  name,
  type = "text",
  defaultValue,
  register,
  error,
  hidden = false,
  required = false,
}: {
  label: string;
  name: keyof ParentSchema;
  type?: string;
  defaultValue?: string;
  register: any;
  error?: any;
  hidden?: boolean;
  required?: boolean;
}) => (
  <div className={`w-full ${hidden ? "hidden" : ""}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
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

// Searchable Student Select Component
const StudentSearchSelect = ({
  students,
  register,
  error,
  defaultValue,
  onChange,
}: {
  students: { id: string; name: string; surname: string; studentId: string }[];
  register: any;
  error?: any;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [filteredStudents, setFilteredStudents] = useState<{ id: string; name: string; surname: string; studentId: string }[]>(students);

  // Initialize selected student if defaultValue exists
  useEffect(() => {
    if (defaultValue && students.length > 0) {
      const student = students.find(s => s.studentId === defaultValue);
      if (student) {
        setSelectedStudent(student);
        setSearchTerm(student.studentId);
      }
    }
  }, [defaultValue, students]);

  // Filter students based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student => 
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.surname.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    
    // Clear selection if search term doesn't match selected student
    if (selectedStudent && !value.includes(selectedStudent.studentId)) {
      setSelectedStudent(null);
      if (onChange) onChange("");
    }
  };

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setSearchTerm(student.studentId);
    setShowDropdown(false);
    if (onChange) onChange(student.studentId);
  };

  const handleBlur = () => {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Search Student by ID, Name, or Surname <span className="text-red-500">*</span>
      </label>
      
      {/* Search Input */}
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={handleBlur}
        placeholder="Type to search (e.g., STU001 or John)"
        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 transition text-base"
      />

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        {...register("studentId", { required: "Student selection is required" })}
        value={selectedStudent?.studentId || ""}
      />

      {/* Selected Student Display */}
      {selectedStudent && !showDropdown && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">
              {selectedStudent.studentId}
            </p>
            <p className="text-xs text-green-600">
              {selectedStudent.name} {selectedStudent.surname}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedStudent(null);
              setSearchTerm("");
              if (onChange) onChange("");
            }}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {/* Dropdown Results */}
      {showDropdown && searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <button
                key={student.studentId}
                type="button"
                onClick={() => handleStudentSelect(student)}
                className="w-full text-left p-3 hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <p className="font-medium text-gray-900">{student.studentId}</p>
                <p className="text-sm text-gray-600">
                  {student.name} {student.surname}
                </p>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No students found matching &quot;{searchTerm}&quot;
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error?.message && (
        <p className="text-xs text-red-500 mt-1">
          {error.message.toString()}
        </p>
      )}

      {/* Helper Text */}
      {!selectedStudent && (
        <p className="text-xs text-gray-500 mt-1">
          Start typing a Student ID or name to search
        </p>
      )}
    </div>
  );
};

export default function ParentForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { students: { id: string; name: string; surname: string; studentId: string }[] };
}) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createParent : updateParent,
    { success: false, error: false }
  );
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Parent ${type === "create" ? "created" : "updated"} successfully`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(`Failed to ${type} parent`);
    }
  }, [state.success, state.error, router, setOpen, type]);

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
          console.log("🚀 Parent form submission started");
          
          // Validate required fields first
          const requiredFields = ['name', 'surname', 'username'];
          if (type === "create") {
            requiredFields.push('password');
          }
          
          const missingFields = requiredFields.filter(field => !formData.get(field));
          
          if (missingFields.length > 0) {
            toast.error(`Missing required fields: ${missingFields.join(', ')}`);
            console.error("❌ Missing fields:", missingFields);
            return;
          }

          // Validate studentId - this is crucial for the Prisma relation
          const studentIdValue = formData.get("studentId")?.toString();
          if (!studentIdValue) {
            toast.error("Please select a student");
            console.error("❌ No student selected");
            return;
          }

          // Build data object following StudentForm pattern
          const dataObject: any = {
            name: formData.get("name")?.toString()!,
            username: formData.get("username")?.toString()!,
            surname: formData.get("surname")?.toString()!,
            email: formData.get("email")?.toString() || "",
            phone: formData.get("phone")?.toString() || "",
            address: formData.get("address")?.toString() || "",
            studentId: studentIdValue,
          };

          // Add ID for updates
          if (type === "update" && data?.id) {
            dataObject.id = data.id;
          }

          // Add password for creates only
          if (type === "create") {
            dataObject.password = formData.get("password")?.toString()!;
          }

          console.log("📝 Parent data object built:", dataObject);

          try {
            // Validate with Zod schema (like StudentForm does)
            const validatedData = parentSchema.parse(dataObject);
            console.log("✅ Zod validation passed:", validatedData);
            
            // Submit to server action
            await formAction(validatedData);
          } catch (error) {
            if (error instanceof z.ZodError) {
              console.error("❌ Zod validation failed:", error.errors);
              error.errors.forEach(err => {
                toast.error(`${err.path.join('.')}: ${err.message}`);
              });
              return;
            } else {
              console.error("❌ Unexpected error:", error);
              toast.error("Failed to submit form");
            }
          }
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-extrabold text-indigo-700">
            {type === "create" ? "Add New Parent" : "Update Parent Information"}
          </h1>
       
        </div>

        {/* Hidden ID field for updates */}
        {data?.id && (
          <InputField
            label="ID"
            name="id"
            defaultValue={data.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        {/* Personal Information */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="First Name"
              name="name"
              defaultValue={data?.name}
              register={register}
              error={errors.name}
              required
            />
            <InputField
              label="Last Name"
              name="surname"
              defaultValue={data?.surname}
              register={register}
              error={errors.surname}
              required
            />
            <InputField
              label="Username"
              name="username"
              defaultValue={data?.username}
              register={register}
              error={errors.username}
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            Contact Information
          </h2>
          <div className="flex flex-col gap-6">
            <InputField
              label="Email Address"
              name="email"
              type="email"
              defaultValue={data?.email}
              register={register}
              error={errors.email}
            />
            <InputField
              label="Phone Number"
              name="phone"
              defaultValue={data?.phone}
              register={register}
              error={errors.phone}
            />
            <InputField
              label="Home Address"
              name="address"
              defaultValue={data?.address}
              register={register}
              error={errors.address}
            />
          </div>
        </div>

        {/* Student & Security Information */}
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-200">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            Student & Security Information
          </h2>
          <div className="space-y-4">
            {/* Searchable Student Selection */}
            <StudentSearchSelect
              students={relatedData?.students || []}
              register={register}
              error={errors.studentId}
              defaultValue={data?.studentId}
              onChange={(value) => setValue("studentId", value)}
            />

            {/* Password field only for create */}
            {type === "create" && (
              <InputField
                label="Password"
                name="password"
                type="password"
                register={register}
                error={errors.password}
                required
              />
            )}
          </div>
        </div>

        {/* Server Error */}
        {state.error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
            <span className="text-red-700 font-medium">
              Something went wrong! Please check the console for details and try again.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end pt-6 border-t border-gray-300">
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
          >
            {type === "create" ? "Create Parent" : "Update Parent"}
          </button>
        </div>
      </form>
    </div>
  );
}
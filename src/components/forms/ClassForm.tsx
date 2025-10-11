"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Define class options
const CLASS_OPTIONS = ["A", "B", "C", "D", "E", "F"];

const ClassForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    formState: { errors },
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
  });

  // ✅ State management - EXACTLY like StudentForm
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedClassLetter, setSelectedClassLetter] = useState<string>("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>("");
  const [capacity, setCapacity] = useState<number>(30);
  const [description, setDescription] = useState<string>("");

  // ✅ Pre-select when editing - EXACTLY like StudentForm pattern
  useEffect(() => {
    if (!relatedData) return;
    
    // Ensure we're working with numbers, not strings
    if (data?.gradeId !== undefined && data?.gradeId !== null) {
      const numericGradeId = Number(data.gradeId);
      console.log('🔍 Setting gradeId:', numericGradeId, 'from data:', data.gradeId);
      setSelectedGradeId(numericGradeId);
    }
    
    // Load class letter
    if (data?.classLetter) {
      console.log('🔍 Setting class letter:', data.classLetter);
      setSelectedClassLetter(String(data.classLetter));
    }
    
    // Load supervisor ID
    if (data?.supervisorId && data.supervisorId !== "") {
      console.log('🔍 Setting supervisor ID:', data.supervisorId);
      setSelectedSupervisorId(String(data.supervisorId));
    } else {
      setSelectedSupervisorId("");
    }
    
    // Load capacity
    if (data?.capacity) {
      console.log('🔍 Setting capacity:', data.capacity);
      setCapacity(Number(data.capacity));
    }
    
    // Load description
    if (data?.description) {
      console.log('🔍 Setting description:', data.description);
      setDescription(String(data.description));
    } else {
      setDescription("");
    }
  }, [data, relatedData]);

  const [state, formAction] = useFormState(
    type === "create" ? createClass : updateClass,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Class has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(`Failed to ${type} class`);
    }
  }, [state, router, type, setOpen]);

  const { teachers = [], grades = [] } = relatedData || {};

  // ✅ Sort grades by level - EXACTLY like StudentForm
  const sortedGrades = grades.slice().sort((a: any, b: any) => a.level - b.level);

  // ✅ Find the selected grade's level - EXACTLY like StudentForm
  const selectedGradeLevel = selectedGradeId !== null
    ? sortedGrades.find((g: any) => g.id === selectedGradeId)?.level
    : undefined;

  // ✅ Debug log - EXACTLY like StudentForm
  useEffect(() => {
    if (selectedGradeId !== null) {
      const foundGrade = sortedGrades.find((g: any) => g.id === selectedGradeId);
      console.log('🔍 Selected Grade ID:', selectedGradeId);
      console.log('🔍 Found Grade:', foundGrade);
      console.log('🔍 Grade Level:', selectedGradeLevel);
    }
  }, [selectedGradeId, selectedGradeLevel, sortedGrades]);

  // Generate class previews
  const getClassNamePreview = () => {
    if (selectedGradeLevel !== undefined && selectedClassLetter) {
      const gradePrefix = selectedGradeLevel === 0 ? "R" : String(selectedGradeLevel);
      return `${gradePrefix}${selectedClassLetter}`;
    }
    return "Select grade and class";
  };

  const getFullClassPreview = () => {
    if (selectedGradeLevel !== undefined && selectedClassLetter) {
      const gradeDisplay = selectedGradeLevel === 0 ? "R" : selectedGradeLevel;
      return `Grade ${gradeDisplay} Class ${selectedClassLetter}`;
    }
    return "Please select grade and class letter to preview";
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(false);
  };

  const handleGradeChange = (gradeId: number | null) => {
    console.log('📝 Grade changed to:', gradeId);
    setSelectedGradeId(gradeId);
    setSelectedClassLetter("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h1 className="text-2xl font-bold text-gray-800">
            {type === "create" ? "Create New Class" : "Update Class"}
          </h1>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-gray-500 group-hover:text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          className="p-6 space-y-8"
          action={async (formData: FormData) => {
            console.log("🚀 Form submission started");
            console.log("📊 Current state - selectedGradeId:", selectedGradeId);
            console.log("📊 Current state - selectedGradeLevel:", selectedGradeLevel);
            console.log("📊 Current state - selectedClassLetter:", selectedClassLetter);

            // Validate required fields
            if (selectedGradeId === null || !selectedClassLetter) {
              toast.error("Please select both grade and class letter");
              return;
            }

            // Generate class name
            const gradePrefix = selectedGradeLevel === 0 ? "R" : String(selectedGradeLevel);
            const fullClassName = `${gradePrefix}${selectedClassLetter}`;

            console.log("✅ Generated class name:", fullClassName);
            console.log("✅ Using gradeId:", selectedGradeId);

            // ✅ Build the data object - use selectedGradeId directly
            const dataObject = {
              id: data?.id ? Number(data.id) : undefined,
              name: fullClassName,
              capacity: capacity,
              gradeId: selectedGradeId, // ✅ Use the actual gradeId from state
              supervisorId: selectedSupervisorId && selectedSupervisorId !== "" 
                ? selectedSupervisorId 
                : undefined,
              description: description && description.trim() !== ""
                ? description.trim()
                : undefined,
            };

            console.log("📝 Submitting class data:", dataObject);

            try {
              // Validate with Zod schema before submitting
              const validatedData = classSchema.parse(dataObject);
              console.log("✅ Zod validation passed:", validatedData);
              await formAction(validatedData);
            } catch (error) {
              console.error("❌ Validation error:", error);
              if (error instanceof z.ZodError) {
                error.errors.forEach(err => {
                  toast.error(`${err.path.join('.')}: ${err.message}`);
                });
              } else if (error instanceof Error) {
                toast.error(error.message);
              } else {
                toast.error("Failed to submit form");
              }
            }
          }}
        >
          {/* Hidden fields */}
          {data && (
            <input type="hidden" name="id" value={data.id} />
          )}
          <input type="hidden" name="gradeId" value={selectedGradeId ?? ""} />

          {/* Debug Info */}
          {type === "update" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs font-mono">
              <p><strong>🔍 Debug Info:</strong></p>
              <p>Data ID: {data?.id}</p>
              <p>Data Grade (passed): {data?.grade}</p>
              <p>Data Grade ID (passed): {data?.gradeId}</p>
              <p>Data Class Letter (passed): {data?.classLetter}</p>
              <hr className="my-2" />
              <p className="text-green-700"><strong>📌 Current Form State:</strong></p>
              <p className="text-green-700">Selected Grade ID: {selectedGradeId ?? "NOT SET"}</p>
              <p className="text-green-700">Selected Grade Level: {selectedGradeLevel ?? "NOT SET"}</p>
              <p className="text-green-700">Selected Class Letter: {selectedClassLetter || "NOT SET"}</p>
              <p className="text-green-700">Selected Supervisor: {selectedSupervisorId || "NONE"}</p>
            </div>
          )}

          {/* Class Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-1">
                  Class Preview
                </h3>
                <p className="text-3xl font-bold text-blue-900">
                  {getClassNamePreview()}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {getFullClassPreview()}
                </p>
              </div>
              <div className="text-blue-400">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 21H5V3H13V9H19Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Step 1: Grade Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                Select Grade Level
              </h2>
            </div>

            {!sortedGrades.length ? (
              <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
                <span className="text-red-700">
                  No grades found in database. Please create grade records first.
                </span>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <select
                  className="w-full p-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-400 transition text-base bg-white"
                  value={selectedGradeId ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleGradeChange(val ? Number(val) : null);
                  }}
                >
                  <option value="">Select grade</option>
                  {sortedGrades.map((grade: any) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.level === 0 ? "Grade R" : `Grade ${grade.level}`}
                    </option>
                  ))}
                </select>
                {/* Debug info */}
                {selectedGradeId !== null && (
                  <p className="mt-2 text-xs text-gray-500">
                    Selected Grade ID: {selectedGradeId}, Level: {selectedGradeLevel}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Class Letter Selection */}
          {selectedGradeId !== null && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Select Class Letter
                </h2>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <select
                  className="w-full p-3 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-400 transition text-base bg-white"
                  value={selectedClassLetter}
                  onChange={(e) => setSelectedClassLetter(e.target.value)}
                >
                  <option value="">Select class letter</option>
                  {CLASS_OPTIONS.map((letter) => {
                    const gradePrefix = selectedGradeLevel === 0 ? "R" : String(selectedGradeLevel);
                    return (
                      <option key={letter} value={letter}>
                        {gradePrefix}{letter}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Class Details */}
          {selectedGradeId !== null && selectedClassLetter && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Class Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={capacity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 30;
                        console.log("📝 Capacity changed to:", val);
                        setCapacity(val);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      min="1"
                    />
                  </div>

                  {/* Supervisor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class Supervisor
                    </label>
                    {teachers.length > 0 ? (
                      <select
                        name="supervisorId"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        value={selectedSupervisorId}
                        onChange={(e) => {
                          console.log("👤 Supervisor changed to:", e.target.value);
                          setSelectedSupervisorId(e.target.value);
                        }}
                      >
                        <option value="">Select a supervisor</option>
                        {teachers.map(
                          (teacher: { id: string; name: string; surname: string }) => (
                            <option value={teacher.id} key={teacher.id}>
                              {teacher.name} {teacher.surname}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <div className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 flex items-center">
                        No teachers available
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    value={description}
                    onChange={(e) => {
                      console.log("📝 Description changed");
                      setDescription(e.target.value);
                    }}
                    placeholder="Enter any additional information..."
                  />
                </div>
              </div>
            </>
          )}

          {/* Server Errors */}
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 font-medium">
              ⚠️ Something went wrong! Please try again.
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedGradeId === null || !selectedClassLetter}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {type === "create" ? "Create Class" : "Update Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
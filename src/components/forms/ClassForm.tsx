"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  classSchema,
  ClassSchema,
} from "@/lib/formValidationSchemas";
import {
  createClass,
  updateClass,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Define comprehensive grade levels (same as StudentForm)
const GRADE_LEVELS = [
  { id: 'R', label: 'Grade R', level: 0 },
  { id: '1', label: 'Grade 1', level: 1 },
  { id: '2', label: 'Grade 2', level: 2 },
  { id: '3', label: 'Grade 3', level: 3 },
  { id: '4', label: 'Grade 4', level: 4 },
  { id: '5', label: 'Grade 5', level: 5 },
  { id: '6', label: 'Grade 6', level: 6 },
  { id: '7', label: 'Grade 7', level: 7 },
  { id: '8', label: 'Grade 8', level: 8 },
  { id: '9', label: 'Grade 9', level: 9 },
  { id: '10', label: 'Grade 10', level: 10 },
  { id: '11', label: 'Grade 11', level: 11 },
  { id: '12', label: 'Grade 12', level: 12 },
];

// Define class options
const CLASS_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

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
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
  });

  const [selectedGrade, setSelectedGrade] = useState<string>(data?.grade || '');
  const [selectedClassLetter, setSelectedClassLetter] = useState<string>(data?.classLetter || '');

  const [state, formAction] = useFormState(
    type === "create" ? createClass : updateClass,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    // Create the full class name and identifier
    const fullClassName = `${selectedGrade}${selectedClassLetter}`;
    
    const classData = {
      ...data,
      grade: selectedGrade,
      classLetter: selectedClassLetter,
      name: fullClassName, // This becomes the class name (e.g., "7A")
      fullName: `Grade ${selectedGrade} Class ${selectedClassLetter}`, // Descriptive name
      gradeLevel: GRADE_LEVELS.find(g => g.id === selectedGrade)?.level || 0,
    };
    
    console.log('Submitting class data:', classData);
    formAction(classData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Class has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers = [] } = relatedData || {};

  // Generate the class name preview
  const getClassNamePreview = () => {
    if (selectedGrade && selectedClassLetter) {
      return `${selectedGrade}${selectedClassLetter}`;
    }
    return 'Select grade and class';
  };

  const getFullClassPreview = () => {
    if (selectedGrade && selectedClassLetter) {
      return `Grade ${selectedGrade} Class ${selectedClassLetter}`;
    }
    return 'Please select grade and class letter to preview';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h1 className="text-2xl font-bold text-gray-800">
            {type === "create" ? "Create New Class" : "Update Class"}
          </h1>
          <button
            type="button"
            onClick={() => setOpen(false)}
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

        {/* Form content */}
        <form className="p-6 space-y-8" onSubmit={onSubmit}>
          {/* Hidden ID field for updates */}
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

          {/* Class Preview Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-1">Class Preview</h3>
                <p className="text-3xl font-bold text-blue-900">{getClassNamePreview()}</p>
                <p className="text-sm text-blue-600 mt-1">{getFullClassPreview()}</p>
              </div>
              <div className="text-blue-400">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 21H5V3H13V9H19Z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Grade Selection Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Select Grade Level</h2>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {GRADE_LEVELS.map((grade) => (
                    <label 
                      key={grade.id} 
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                        selectedGrade === grade.id 
                          ? 'bg-blue-100 border-blue-300 text-blue-800' 
                          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gradeSelection"
                        value={grade.id}
                        checked={selectedGrade === grade.id}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">{grade.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {!selectedGrade && (
                <p className="text-sm text-red-600 mt-3 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Please select a grade level
                </p>
              )}
            </div>
          </div>

          {/* Class Letter Selection Section */}
          {selectedGrade && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Select Class Letter</h2>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {CLASS_OPTIONS.map((classLetter) => (
                    <label 
                      key={classLetter} 
                      className={`flex items-center justify-center gap-2 p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                        selectedClassLetter === classLetter 
                          ? 'bg-green-100 border-green-300 text-green-800' 
                          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="classLetter"
                        value={classLetter}
                        checked={selectedClassLetter === classLetter}
                        onChange={(e) => setSelectedClassLetter(e.target.value)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-lg font-bold">{classLetter}</span>
                    </label>
                  ))}
                </div>
                {!selectedClassLetter && (
                  <p className="text-sm text-red-600 mt-3 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Please select a class letter
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Class Details Section */}
          {selectedGrade && selectedClassLetter && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Class Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class Capacity */}
                <div className="space-y-2">
                  <InputField
                    label="Class Capacity"
                    name="capacity"
                    defaultValue={data?.capacity || "30"}
                    register={register}
                    error={errors?.capacity}
                    type="number"
                  />
                </div>

                {/* Class Supervisor */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Class Supervisor (HOD)
                  </label>
                  {teachers.length > 0 ? (
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white hover:border-gray-400"
                      {...register("supervisorId")}
                      defaultValue={data?.supervisorId}
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
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      No teachers available
                    </div>
                  )}
                  {errors.supervisorId?.message && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.supervisorId.message.toString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Class Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Class Description (Optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 resize-none"
                  rows={3}
                  {...register("description")}
                  defaultValue={data?.description}
                  placeholder="Enter any additional information about this class..."
                />
              </div>
            </div>
          )}

          {/* Information Cards */}
          <div className="space-y-4">
            {/* Management Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">Class Management</h4>
                  <p className="text-sm text-blue-700">
                    Each class is uniquely identified by its grade and class letter combination. 
                    Students will be automatically assigned to this class when you select the corresponding grade and class during student registration.
                  </p>
                </div>
              </div>
            </div>

            {/* Current Students Count (for updates) */}
            {type === "update" && data?.studentCount !== undefined && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800 mb-1">Current Enrollment</h4>
                    <p className="text-sm text-amber-700">
                      This class currently has <span className="font-semibold">{data.studentCount}</span> students enrolled.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800 font-medium">Something went wrong! Please try again.</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!selectedGrade || !selectedClassLetter}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {type === "create" ? "Create Class" : "Update Class"}
              </div>
            </button>
          </div>

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                <strong>Debug:</strong> Grade: {selectedGrade}, Class: {selectedClassLetter}, 
                Full Name: {getClassNamePreview()}, Teachers Available: {teachers.length}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
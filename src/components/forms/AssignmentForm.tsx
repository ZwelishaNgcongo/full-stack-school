"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface AssignmentFormProps {
  type: "create" | "update";
  data?: any;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}

const AssignmentForm = ({ type, data, setOpen, relatedData }: AssignmentFormProps) => {
  const [selectedLessons, setSelectedLessons] = useState<number[]>(
    data?.lessons?.map((l: any) => l.id) || []
  );

  useEffect(() => {
    console.log("AssignmentForm mounted with:", { type, data, relatedData });
  }, [type, data, relatedData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: data?.title || "",
      startDate: data?.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "",
      dueDate: data?.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : "",
      lessonId: data?.lessonId || data?.lesson?.id || "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAssignment : updateAssignment,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Assignment has been ${type === "create" ? "created" : "updated"}!`);
      setOpen?.(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    console.log("Form submitted with data:", formData);
    console.log("Selected lessons:", selectedLessons);
    
    if (selectedLessons.length === 0) {
      toast.error("Please select at least one lesson");
      return;
    }

    const form = new FormData();
    
    form.append("title", formData.title);
    form.append("startDate", formData.startDate);
    form.append("dueDate", formData.dueDate);
    
    selectedLessons.forEach((lessonId) => {
      form.append("lessonIds", lessonId.toString());
    });
    
    if (data?.id) {
      form.append("id", data.id.toString());
    }
    
    if (formData.file && formData.file.length > 0) {
      form.append("file", formData.file[0]);
      console.log("File attached:", formData.file[0].name);
    }
    
    console.log("Calling formAction with FormData");
    formAction(form);
  });

  const { lessons } = relatedData || {};

  const lessonsByGrade = lessons?.reduce((acc: any, lesson: any) => {
    const gradeLevel = lesson.class?.grade?.level;
    if (gradeLevel !== undefined && gradeLevel !== null) {
      const gradeName = gradeLevel === 0 ? "Grade R" : `Grade ${gradeLevel}`;
      if (!acc[gradeName]) {
        acc[gradeName] = [];
      }
      acc[gradeName].push(lesson);
    }
    return acc;
  }, {});

  const grades = lessonsByGrade 
    ? Object.keys(lessonsByGrade).sort((a, b) => {
        const aNum = a === "Grade R" ? 0 : parseInt(a.replace("Grade ", ""));
        const bNum = b === "Grade R" ? 0 : parseInt(b.replace("Grade ", ""));
        return aNum - bNum;
      })
    : [];

  const toggleLesson = (lessonId: number) => {
    setSelectedLessons(prev => {
      if (prev.includes(lessonId)) {
        return prev.filter(id => id !== lessonId);
      } else {
        return [...prev, lessonId];
      }
    });
  };

  const toggleGrade = (gradeName: string) => {
    const gradeLessons = lessonsByGrade[gradeName].map((l: any) => l.id);
    const allSelected = gradeLessons.every((id: number) => selectedLessons.includes(id));
    
    if (allSelected) {
      setSelectedLessons(prev => prev.filter(id => !gradeLessons.includes(id)));
    } else {
      setSelectedLessons(prev => [...new Set([...prev, ...gradeLessons])]);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Background decorations - fixed positioning */}
      <div className="fixed -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>

      

      <form className="flex flex-col h-full relative" onSubmit={onSubmit}>
        {/* Header - fixed at top */}
        <div className="flex-shrink-0 flex items-center gap-4 pb-6 border-b-2 border-gradient-to-r from-purple-200 via-pink-200 to-red-200 pr-12">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl blur-md opacity-50"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              {type === "create" ? "Create New Assignment" : "Update Assignment"}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {type === "create" ? "Create a new assignment for students" : "Modify the assignment details below"}
            </p>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto py-6 space-y-5 pr-2">
          {/* Title */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100 shadow-sm">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Assignment Title *
            </label>
            <input
              {...register("title")}
              placeholder="e.g., Chapter 5 Homework"
              className="w-full p-3 rounded-lg border-2 border-purple-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all duration-300 bg-white"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Dates */}
          <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 rounded-xl border border-violet-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Start Date *
                </label>
                <input
                  type="date"
                  {...register("startDate")}
                  className="w-full p-3 rounded-lg border-2 border-violet-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white"
                />
                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Due Date *
                </label>
                <input
                  type="date"
                  {...register("dueDate")}
                  className="w-full p-3 rounded-lg border-2 border-violet-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white"
                />
                {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate.message}</p>}
              </div>
            </div>
          </div>

          {/* PDF Upload - Improved styling */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-5 rounded-xl border-2 border-purple-200 shadow-sm">
            <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Upload PDF Assignment (Optional)
            </label>
            
            {data?.fileUrl && (
              <div className="mb-3 p-3 bg-white border-2 border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-gray-700">Current file:</span>
                  <a 
                    href={data.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-purple-600 hover:text-purple-700 underline font-medium truncate"
                  >
                    View file
                  </a>
                </div>
              </div>
            )}
            
            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                {...register("file")}
                className="w-full p-3 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer file:transition-colors cursor-pointer border-2 border-dashed border-purple-300 rounded-lg bg-white hover:border-purple-400 transition-colors"
              />
            </div>
            
            <div className="mt-2 flex items-start gap-2 text-xs text-gray-600">
              <svg className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Only PDF files are allowed. Maximum file size: 10MB</span>
            </div>
          </div>

          {/* Multi-Select Lessons */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100 shadow-sm">
            <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
              <span>Select Lessons *</span>
              <span className="text-xs font-normal px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                {selectedLessons.length} selected
              </span>
            </label>
            
            {grades && grades.length > 0 ? (
              <div className="space-y-3 max-h-56 overflow-y-auto bg-white rounded-lg p-3 border-2 border-blue-200 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50">
                {grades.map((gradeName: string) => {
                  const gradeLessons = lessonsByGrade[gradeName];
                  const allGradeSelected = gradeLessons.every((l: any) => selectedLessons.includes(l.id));
                  const someGradeSelected = gradeLessons.some((l: any) => selectedLessons.includes(l.id));
                  
                  return (
                    <div key={gradeName} className="border-b border-gray-200 last:border-b-0 pb-3 last:pb-0">
                      <div 
                        className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                        onClick={() => toggleGrade(gradeName)}
                      >
                        <div className="relative w-5 h-5 flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={allGradeSelected}
                            onChange={() => toggleGrade(gradeName)}
                            className="w-5 h-5 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-200 cursor-pointer"
                          />
                          {someGradeSelected && !allGradeSelected && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-2.5 h-2.5 bg-blue-400 rounded-sm"></div>
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-blue-700 text-sm">{gradeName}</span>
                        <span className="text-xs text-gray-500">
                          ({gradeLessons.filter((l: any) => selectedLessons.includes(l.id)).length}/{gradeLessons.length})
                        </span>
                      </div>
                      
                      <div className="ml-8 mt-2 space-y-2">
                        {gradeLessons.map((lesson: any) => (
                          <label
                            key={lesson.id}
                            className="flex items-start gap-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedLessons.includes(lesson.id)}
                              onChange={() => toggleLesson(lesson.id)}
                              className="w-4 h-4 mt-0.5 flex-shrink-0 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-200 cursor-pointer"
                            />
                            <span className="text-sm text-gray-700">
                              {lesson.subject?.name || "Unknown Subject"} - {lesson.class?.name || "Unknown Class"}
                              <span className="text-xs text-gray-500 ml-2">
                                ({lesson.teacher?.name || "No Teacher"})
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 border border-blue-200 bg-blue-50 text-center rounded-lg text-blue-600">
                No lessons available. Please create classes and lessons first.
              </div>
            )}
            
            {selectedLessons.length === 0 && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Please select at least one lesson
              </p>
            )}
          </div>

          {state.error && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl shadow-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-semibold">
                Something went wrong. Please try again.
              </span>
            </div>
          )}
        </div>

        {/* Buttons - fixed at bottom */}
        <div className="flex-shrink-0 flex gap-4 pt-4 border-t-2 border-gray-100 bg-white">
          <button
            type="button"
            onClick={() => setOpen?.(false)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!lessons || lessons.length === 0 || selectedLessons.length === 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {type === "create" ? "Create Assignment" : "Update Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentForm;
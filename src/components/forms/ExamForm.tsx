"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ExamForm = ({
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
  const [selectedLessonIds, setSelectedLessonIds] = useState<number[]>(
    data?.lessons?.map((l: any) => l.lessonId) || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: data?.title || "",
      startTime: data?.startTime 
        ? new Date(data.startTime).toISOString().slice(0, 16) 
        : "",
      endTime: data?.endTime 
        ? new Date(data.endTime).toISOString().slice(0, 16) 
        : "",
      lessonIds: data?.lessons?.map((l: any) => l.lessonId) || [],
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createExam : updateExam,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Exam has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  useEffect(() => {
    setValue("lessonIds", selectedLessonIds);
  }, [selectedLessonIds, setValue]);

  const onSubmit = handleSubmit((formData) => {
    if (selectedLessonIds.length === 0) {
      toast.error("Please select at least one class");
      return;
    }

    const submissionData = {
      ...formData,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      lessonIds: selectedLessonIds,
      ...(data?.id && { id: data.id })
    };
    
    formAction(submissionData);
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

  const handleLessonToggle = (lessonId: number) => {
    setSelectedLessonIds(prev => {
      if (prev.includes(lessonId)) {
        return prev.filter(id => id !== lessonId);
      } else {
        return [...prev, lessonId];
      }
    });
  };

  const handleGradeToggle = (gradeName: string) => {
    const gradeLessons = lessonsByGrade[gradeName].map((l: any) => l.id);
    const allSelected = gradeLessons.every((id: number) => selectedLessonIds.includes(id));
    
    if (allSelected) {
      setSelectedLessonIds(prev => prev.filter(id => !gradeLessons.includes(id)));
    } else {
      setSelectedLessonIds(prev => [...new Set([...prev, ...gradeLessons])]);
    }
  };

  return (
    <div className="relative">
      {/* Animated gradient background decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-400 via-indigo-400 to-purple-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>

      {/* Close button with enhanced styling */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-gray-50 to-white hover:from-red-50 hover:to-red-100 border-2 border-gray-200 hover:border-red-300 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl group z-10 hover:scale-110"
        aria-label="Close form"
      >
        <svg
          className="w-5 h-5 text-gray-600 group-hover:text-red-500 group-hover:rotate-90 transition-all duration-300"
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

      <form className="flex flex-col gap-8 relative" onSubmit={onSubmit}>
        {/* Header Section with Gradient */}
        <div className="flex items-center gap-4 pb-6 border-b-2 border-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-pink-500 rounded-2xl blur-md opacity-50"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {type === "create" ? "Create New Exam" : "Update Exam"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {type === "create" 
                ? "Set up a new exam with all the details" 
                : "Modify the exam information below"}
            </p>
          </div>
        </div>

        {/* Form Fields with Beautiful Cards */}
        <div className="space-y-6">
          {/* Exam Title - Full Width Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              <label className="text-sm font-semibold text-gray-700">Exam Title</label>
            </div>
            <input
              {...register("title")}
              placeholder="e.g., Midterm Mathematics Exam"
              className="w-full p-3 rounded-xl border-2 border-indigo-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Date and Time Section */}
          <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-violet-100 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800">Exam Schedule</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Start Time</label>
                <input
                  type="datetime-local"
                  {...register("startTime")}
                  className="w-full p-3 rounded-xl border-2 border-violet-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                />
                {errors.startTime && (
                  <p className="text-xs text-red-500 mt-2">{errors.startTime.message}</p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">End Time</label>
                <input
                  type="datetime-local"
                  {...register("endTime")}
                  className="w-full p-3 rounded-xl border-2 border-violet-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                />
                {errors.endTime && (
                  <p className="text-xs text-red-500 mt-2">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Multi-Select Classes by Grade */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <label className="text-sm font-semibold text-gray-700">Select Classes</label>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                {selectedLessonIds.length} selected
              </span>
            </div>

            {grades && grades.length > 0 ? (
              <div className="space-y-3 max-h-56 overflow-y-auto bg-white rounded-lg p-3 border-2 border-blue-200 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50">
                {grades.map((gradeName: string) => {
                  const gradeLessons = lessonsByGrade[gradeName];
                  const allGradeSelected = gradeLessons.every((l: any) => selectedLessonIds.includes(l.id));

                  return (
                    <div key={gradeName} className="mb-3 last:mb-0">
                      <label className="flex items-center gap-2 font-semibold text-sm mb-2 cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={allGradeSelected}
                          onChange={() => handleGradeToggle(gradeName)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span>{gradeName}</span>
                        <span className="text-xs text-gray-500">
                          ({gradeLessons.filter((l: any) => selectedLessonIds.includes(l.id)).length}/{gradeLessons.length})
                        </span>
                      </label>
                      
                      <div className="ml-6 space-y-1">
                        {gradeLessons.map((lesson: any) => (
                          <label
                            key={lesson.id}
                            className="flex items-center gap-2 text-sm cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedLessonIds.includes(lesson.id)}
                              onChange={() => handleLessonToggle(lesson.id)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-xs">
                              {lesson.subject?.name || "Unknown Subject"} - {lesson.class?.name || "Unknown Class"}
                              <span className="text-gray-500 ml-1">
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
              <p className="text-xs text-gray-500 p-2 border border-blue-200 bg-blue-50 text-center rounded-lg text-blue-600">
                No lessons available. Please create classes and lessons first.
              </p>
            )}
            
            {selectedLessonIds.length === 0 && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Please select at least one class
              </p>
            )}
          </div>
        </div>

        {/* Hidden field for lessonIds */}
        <input type="hidden" {...register("lessonIds")} />
        {data?.id && <input type="hidden" {...register("id")} value={data.id} />}

        {state.error && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl shadow-lg animate-pulse">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 font-semibold">
                Oops! Something went wrong. Please try again.
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons with Gradient */}
        <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!lessons || lessons.length === 0 || selectedLessonIds.length === 0}
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {type === "create" ? "✨ Create Exam" : "💫 Update Exam"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamForm;
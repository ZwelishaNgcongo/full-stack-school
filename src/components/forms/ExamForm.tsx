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

  // Update the form's lessonIds whenever selectedLessonIds changes
  useEffect(() => {
    setValue("lessonIds", selectedLessonIds);
  }, [selectedLessonIds, setValue]);

  const onSubmit = handleSubmit((formData) => {
    if (selectedLessonIds.length === 0) {
      toast.error("Please select at least one class");
      return;
    }

    // Convert string dates to Date objects
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

  // Group lessons by grade
  const lessonsByGrade = lessons?.reduce((acc: any, lesson: any) => {
    const gradeLevel = lesson.class?.gradeId;
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
    <div className="relative max-h-[85vh] overflow-y-auto">
      {/* Close Button */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="absolute -top-3 -right-3 w-10 h-10 bg-white hover:bg-red-50 border-2 border-gray-200 hover:border-red-300 rounded-full flex items-center justify-center transition-all shadow-lg group z-10"
      >
        <svg className="w-5 h-5 text-gray-600 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <form className="flex flex-col gap-6 p-1" onSubmit={onSubmit}>
        {/* Header */}
        <div className="flex items-center gap-4 pb-6 border-b-2">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {type === "create" ? "Create New Exam" : "Update Exam"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Select multiple classes for the same exam</p>
          </div>
        </div>

        {/* Title */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Exam Title</label>
          <input
            {...register("title")}
            placeholder="e.g., Midterm Mathematics Exam"
            className="w-full p-3 rounded-xl border-2 border-indigo-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none bg-white/80"
          />
          {errors.title && <p className="text-xs text-red-500 mt-2">{errors.title.message}</p>}
        </div>

        {/* Multi-Select Classes by Grade */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700">Select Classes *</label>
            <span className="text-xs bg-blue-200 text-blue-700 px-3 py-1 rounded-full font-medium">
              {selectedLessonIds.length} selected
            </span>
          </div>

          {grades && grades.length > 0 ? (
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50">
              {grades.map((gradeName: string) => {
                const gradeLessons = lessonsByGrade[gradeName];
                const allGradeSelected = gradeLessons.every((l: any) => selectedLessonIds.includes(l.id));
                const someGradeSelected = gradeLessons.some((l: any) => selectedLessonIds.includes(l.id));

                return (
                  <div key={gradeName} className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm">
                    {/* Grade Header with Checkbox */}
                    <div 
                      className="flex items-center gap-3 mb-3 pb-3 border-b cursor-pointer hover:bg-blue-50 -m-4 p-4 rounded-t-xl transition-colors"
                      onClick={() => handleGradeToggle(gradeName)}
                    >
                      <div className="relative w-5 h-5 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={allGradeSelected}
                          onChange={() => handleGradeToggle(gradeName)}
                          className="w-5 h-5 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-200 cursor-pointer"
                        />
                        {someGradeSelected && !allGradeSelected && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-sm"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800">{gradeName}</div>
                        <div className="text-xs text-gray-500">
                          ({gradeLessons.filter((l: any) => selectedLessonIds.includes(l.id)).length}/{gradeLessons.length} selected)
                        </div>
                      </div>
                      <div className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full">
                        {gradeLessons.length} classes
                      </div>
                    </div>

                    {/* Individual Lessons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {gradeLessons.map((lesson: any) => (
                        <label
                          key={lesson.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            selectedLessonIds.includes(lesson.id)
                              ? "bg-blue-100 border-2 border-blue-300"
                              : "bg-gray-50 border-2 border-gray-200 hover:border-blue-200"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLessonIds.includes(lesson.id)}
                            onChange={() => handleLessonToggle(lesson.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 text-sm">{lesson.class.name}</div>
                            <div className="text-xs text-gray-600">{lesson.subject.name}</div>
                            <div className="text-xs text-gray-500">{lesson.teacher.name} {lesson.teacher.surname}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-blue-50/50 rounded-xl text-center text-blue-600">
              No lessons available
            </div>
          )}
          
          {errors.lessonIds && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {errors.lessonIds.message}
            </p>
          )}
        </div>

        {/* Date and Time */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-5 rounded-2xl border border-violet-100">
          <label className="text-sm font-semibold text-gray-700 mb-3 block">Exam Schedule</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Start Time</label>
              <input
                type="datetime-local"
                {...register("startTime")}
                className="w-full p-3 rounded-xl border-2 border-violet-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none bg-white/80"
              />
              {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime.message}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">End Time</label>
              <input
                type="datetime-local"
                {...register("endTime")}
                className="w-full p-3 rounded-xl border-2 border-violet-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none bg-white/80"
              />
              {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime.message}</p>}
            </div>
          </div>
        </div>

        {/* Hidden field for lessonIds */}
        <input type="hidden" {...register("lessonIds")} />
        {data?.id && <input type="hidden" {...register("id")} value={data.id} />}

        {state.error && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl">
            <span className="text-red-700 font-semibold">Something went wrong. Please try again.</span>
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!lessons || lessons.length === 0 || selectedLessonIds.length === 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {type === "create" ? "📝 Create Exam" : "✏️ Update Exam"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamForm;
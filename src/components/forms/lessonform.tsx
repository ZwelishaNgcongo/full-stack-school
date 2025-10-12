"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const LessonForm = ({
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
    formState: { errors },
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: data?.name || "",
      day: data?.day || "MONDAY",
      startTime: data?.startTime || "",
      endTime: data?.endTime || "",
      subjectId: data?.subjectId || data?.subject?.id || "",
      classId: data?.classId || data?.class?.id || "",
      teacherId: data?.teacherId || data?.teacher?.id || "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createLesson : updateLesson,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Lesson has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((data) => {
    formAction({ ...data, id: data?.id });
  });

  const { subjects, classes, teachers } = relatedData || {};

  return (
    <div className="relative">
      {/* Animated gradient background decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-green-400 via-blue-400 to-purple-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>

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
        <div className="flex items-center gap-4 pb-6 border-b-2 border-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur-md opacity-50"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {type === "create" ? "Create New Lesson" : "Update Lesson"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {type === "create" 
                ? "Set up a new lesson with all the details" 
                : "Modify the lesson information below"}
            </p>
          </div>
        </div>

        {/* Form Fields with Beautiful Cards */}
        <div className="space-y-6">
          {/* Lesson Name - Full Width Card */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <label className="text-sm font-semibold text-gray-700">Lesson Name</label>
            </div>
            <input
              {...register("name")}
              defaultValue={data?.name}
              placeholder="e.g., Advanced Mathematics"
              className="w-full p-3 rounded-xl border-2 border-blue-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
            />
            {errors?.name && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Subject, Class, Teacher - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <label className="text-sm font-semibold text-gray-700">Subject</label>
              </div>
              <select
                {...register("subjectId")}
                defaultValue={data?.subjectId || data?.subject?.id}
                className="w-full p-3 rounded-xl border-2 border-green-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer"
              >
                <option value="">Choose subject</option>
                {subjects?.map((subject: { id: number; name: string }) => (
                  <option value={subject.id} key={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {errors.subjectId?.message && (
                <p className="text-xs text-red-500 mt-2">{errors.subjectId.message.toString()}</p>
              )}
            </div>

            {/* Class */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-5 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <label className="text-sm font-semibold text-gray-700">Class</label>
              </div>
              <select
                {...register("classId")}
                defaultValue={data?.classId || data?.class?.id}
                className="w-full p-3 rounded-xl border-2 border-orange-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer"
              >
                <option value="">Choose class</option>
                {classes?.map((classItem: { id: number; name: string }) => (
                  <option value={classItem.id} key={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
              {errors.classId?.message && (
                <p className="text-xs text-red-500 mt-2">{errors.classId.message.toString()}</p>
              )}
            </div>

            {/* Teacher */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-5 rounded-2xl border border-pink-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <label className="text-sm font-semibold text-gray-700">Teacher</label>
              </div>
              <select
                {...register("teacherId")}
                defaultValue={data?.teacherId || data?.teacher?.id}
                className="w-full p-3 rounded-xl border-2 border-pink-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer"
              >
                <option value="">Choose teacher</option>
                {teachers?.map((teacher: { id: string; name: string; surname: string }) => (
                  <option value={teacher.id} key={teacher.id}>
                    {teacher.name} {teacher.surname}
                  </option>
                ))}
              </select>
              {errors.teacherId?.message && (
                <p className="text-xs text-red-500 mt-2">{errors.teacherId.message.toString()}</p>
              )}
            </div>
          </div>

          {/* Day and Time Section */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-indigo-100 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800">Schedule Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Day */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Day of Week</label>
                <select
                  {...register("day")}
                  defaultValue={data?.day}
                  className="w-full p-3 rounded-xl border-2 border-indigo-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer font-medium"
                >
                  <option value="MONDAY">🌟 Monday</option>
                  <option value="TUESDAY">🔥 Tuesday</option>
                  <option value="WEDNESDAY">💫 Wednesday</option>
                  <option value="THURSDAY">⚡ Thursday</option>
                  <option value="FRIDAY">🎯 Friday</option>
                </select>
                {errors.day?.message && (
                  <p className="text-xs text-red-500 mt-2">{errors.day.message.toString()}</p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Start Time</label>
                <input
                  type="time"
                  {...register("startTime")}
                  defaultValue={data?.startTime}
                  className="w-full p-3 rounded-xl border-2 border-indigo-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                />
                {errors.startTime && (
                  <p className="text-xs text-red-500 mt-2">{errors.startTime.message}</p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">End Time</label>
                <input
                  type="time"
                  {...register("endTime")}
                  defaultValue={data?.endTime}
                  className="w-full p-3 rounded-xl border-2 border-indigo-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                />
                {errors.endTime && (
                  <p className="text-xs text-red-500 mt-2">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {data && (
          <input
            type="hidden"
            {...register("id")}
            defaultValue={data?.id}
          />
        )}

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
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105"
          >
            {type === "create" ? "✨ Create Lesson" : "💫 Update Lesson"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonForm;
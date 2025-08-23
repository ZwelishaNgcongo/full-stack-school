"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  examSchema,
  ExamSchema,
  subjectSchema,
  SubjectSchema,
} from "@/lib/formValidationSchemas";
import {
  createExam,
  createSubject,
  updateExam,
  updateSubject,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
  });

  // AFTER REACT 19 IT'LL BE USEACTIONSTATE

  const [state, formAction] = useFormState(
    type === "create" ? createExam : updateExam,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Exam has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { lessons } = relatedData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h1 className="text-2xl font-bold text-gray-800">
            {type === "create" ? "Create New Exam" : "Update Exam"}
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
        <form className="p-6 space-y-6" onSubmit={onSubmit}>
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

          {/* Form fields grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exam Title - Full width on mobile, half width on desktop */}
            <div className="md:col-span-2">
              <InputField
                label="Exam title"
                name="title"
                defaultValue={data?.title}
                register={register}
                error={errors?.title}
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <InputField
                label="Start Date & Time"
                name="startTime"
                defaultValue={data?.startTime}
                register={register}
                error={errors?.startTime}
                type="datetime-local"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <InputField
                label="End Date & Time"
                name="endTime"
                defaultValue={data?.endTime}
                register={register}
                error={errors?.endTime}
                type="datetime-local"
              />
            </div>
          </div>

          {/* Lesson Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Lesson <span className="text-red-500">*</span>
            </label>
            
            {lessons && lessons.length > 0 ? (
              <div className="space-y-1">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white hover:border-gray-400"
                  {...register("lessonId")}
                  defaultValue={data?.lessonId}
                >
                  <option value="" disabled className="text-gray-400">
                    Select a lesson...
                  </option>
                  {lessons.map((lesson: { id: number; name: string }) => (
                    <option 
                      value={lesson.id} 
                      key={lesson.id}
                      className="py-2"
                    >
                      {lesson.name}
                    </option>
                  ))}
                </select>
                {errors.lessonId?.message && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.lessonId.message.toString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 flex items-center justify-center min-h-[48px]">
                  <div className="flex items-center text-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div>
                      <p className="font-medium">No lessons available</p>
                      <p className="text-xs mt-1">Create lessons first before creating exams</p>
                    </div>
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
              disabled={!lessons || lessons.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {type === "create" ? "Create Exam" : "Update Exam"}
              </div>
            </button>
          </div>

          {/* Helper text for datetime inputs */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Exam Scheduling Tips:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Make sure the end time is after the start time</li>
                  <li>• Consider allowing buffer time for students to settle in</li>
                  <li>• Check for conflicts with other scheduled exams or lessons</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamForm;
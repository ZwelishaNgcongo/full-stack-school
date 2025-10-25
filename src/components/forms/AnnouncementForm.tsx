"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { z } from "zod";
import { useFormState } from "react-dom";

// Import server actions from your actions.ts file
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";

const announcementSchema = z.object({
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.string().min(1, { message: "Date is required!" }),
  classId: z.string().optional(),
});

type AnnouncementSchema = z.infer<typeof announcementSchema>;

const AnnouncementForm = ({
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
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      date: data?.date 
        ? new Date(data.date).toISOString().slice(0, 10) 
        : "",
      classId: data?.classId?.toString() || "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    { success: false, error: false }
  );

  useEffect(() => {
    if (state.success) {
      toast.success(`Announcement has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    console.log("=== FORM SUBMIT START ===");
    console.log("Form data:", formData);
    console.log("Data ID:", data?.id);
    
    // Create FormData object like AssignmentForm does
    const form = new FormData();
    
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("date", formData.date);
    
    if (formData.classId && formData.classId !== "") {
      form.append("classId", formData.classId);
    }
    
    if (data?.id) {
      form.append("id", data.id.toString());
    }
    
    console.log("Calling formAction with FormData");
    formAction(form);
  });

  const { classes } = relatedData || {};

  return (
    <div className="relative">
      {/* Animated gradient background decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-400 via-indigo-400 to-blue-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-400 via-purple-400 to-indigo-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>

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
        <div className="flex items-center gap-4 pb-6 border-b-2 border-gradient-to-r from-purple-200 via-indigo-200 to-blue-200">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl blur-md opacity-50"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {type === "create" ? "Create New Announcement" : "Update Announcement"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {type === "create" 
                ? "Share important information with students and parents" 
                : "Modify the announcement details below"}
            </p>
          </div>
        </div>

        {/* Form Fields with Beautiful Cards */}
        <div className="space-y-6">
          {/* Announcement Title - Full Width Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
              <label className="text-sm font-semibold text-gray-700">Announcement Title</label>
            </div>
            <input
              {...register("title")}
              placeholder="e.g., School Closure, Important Notice, Exam Schedule"
              className="w-full p-3 rounded-xl border-2 border-purple-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
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

          {/* Description */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <label className="text-sm font-semibold text-gray-700">Description</label>
            </div>
            <textarea
              {...register("description")}
              placeholder="Provide detailed information about the announcement..."
              className="w-full p-3 rounded-xl border-2 border-blue-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
              rows={5}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.description.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Include all important details and instructions</span>
            </p>
          </div>

          {/* Date and Class Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-5 rounded-2xl border border-violet-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <label className="text-sm font-semibold text-gray-700">Announcement Date</label>
              </div>
              <input
                type="date"
                {...register("date")}
                className="w-full p-3 rounded-xl border-2 border-violet-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
              />
              {errors.date && (
                <p className="text-xs text-red-500 mt-2">{errors.date.message}</p>
              )}
            </div>

            {/* Class Selection */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <label className="text-sm font-semibold text-gray-700">Target Class (Optional)</label>
              </div>
              <select
                {...register("classId")}
                className="w-full p-3 rounded-xl border-2 border-green-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
              >
                <option value="">🏫 All School (All Classes)</option>
                {classes?.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>
                    📚 {cls.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Select a specific class or leave as All School</span>
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
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
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105"
          >
            {type === "create" ? "📢 Create Announcement" : "✨ Update Announcement"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnnouncementForm;
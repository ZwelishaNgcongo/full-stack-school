"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().optional(),
  startTime: z.string().min(1, { message: "Start time is required!" }),
  endTime: z.string().min(1, { message: "End time is required!" }),
  gradeId: z.coerce.number().optional().nullable(),
});

type EventSchema = z.infer<typeof eventSchema>;

const EventForm = ({
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      startTime: data?.startTime 
        ? new Date(data.startTime).toISOString().slice(0, 16) 
        : "",
      endTime: data?.endTime 
        ? new Date(data.endTime).toISOString().slice(0, 16) 
        : "",
      gradeId: data?.gradeId || null,
    },
  });

  const onSubmit = async (formData: EventSchema) => {
    setIsSubmitting(true);

    try {
      const submissionData: any = {
        title: formData.title,
        description: formData.description || "",
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        gradeId: formData.gradeId || null,
      };

      const url = type === "create" 
        ? "/api/events" 
        : `/api/events/${data.id}`;
      
      const method = type === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Event has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { grades } = relatedData || {};
  const sortedGrades = grades ? grades.slice().sort((a: any, b: any) => a.level - b.level) : [];

  return (
    <div className="relative">
      {/* Animated gradient background decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-yellow-400 via-orange-400 to-pink-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>

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

      <form className="flex flex-col gap-8 relative" onSubmit={handleSubmit(onSubmit)}>
        {/* Header Section with Gradient */}
        <div className="flex items-center gap-4 pb-6 border-b-2 border-gradient-to-r from-orange-200 via-pink-200 to-purple-200">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl blur-md opacity-50"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              {type === "create" ? "Create New Event" : "Update Event"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {type === "create" 
                ? "Schedule a school event with all the details" 
                : "Modify the event information below"}
            </p>
          </div>
        </div>

        {/* Form Fields with Beautiful Cards */}
        <div className="space-y-6">
          {/* Event Title - Full Width Card */}
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-5 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></div>
              <label className="text-sm font-semibold text-gray-700">Event Title</label>
            </div>
            <input
              {...register("title")}
              placeholder="e.g., Sports Day, Science Fair, Parent Meeting"
              className="w-full p-3 rounded-xl border-2 border-orange-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <label className="text-sm font-semibold text-gray-700">Description (Optional)</label>
            </div>
            <textarea
              {...register("description")}
              placeholder="Provide additional details about the event..."
              className="w-full p-3 rounded-xl border-2 border-blue-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Add extra details to help attendees prepare for the event</span>
            </p>
          </div>

          {/* Date and Time Section */}
          <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-violet-100 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800">Event Schedule</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Start Date & Time</label>
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
                <label className="text-sm font-semibold text-gray-700 mb-2 block">End Date & Time</label>
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

          {/* Grade Selection */}
          {sortedGrades && sortedGrades.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <label className="text-sm font-semibold text-gray-700">Target Grade (Optional)</label>
              </div>
              <select
                {...register("gradeId")}
                className="w-full p-3 rounded-xl border-2 border-green-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm font-medium"
                defaultValue=""
              >
                <option value="">🏫 All School (All Grades)</option>
                {sortedGrades.map((grade: any) => (
                  <option key={grade.id} value={grade.id}>
                    🎓 Grade {grade.level === 0 ? 'R' : grade.level}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Select a specific grade or leave as All School for school-wide events</span>
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons with Gradient */}
        <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? "⏳ Saving..." : type === "create" ? "📅 Create Event" : "✨ Update Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
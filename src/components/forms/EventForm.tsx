"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
    <div className="relative max-h-[85vh] overflow-y-auto">
      <form className="flex flex-col gap-6 p-1" onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <div className="flex items-center gap-4 pb-6 border-b-2">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              {type === "create" ? "Create New Event" : "Update Event"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Schedule a school event</p>
          </div>
        </div>

        {/* Title */}
        <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-5 rounded-2xl border border-orange-100">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Event Title</label>
          <input
            {...register("title")}
            placeholder="e.g., Sports Day, Science Fair, Parent Meeting"
            className="w-full p-3 rounded-xl border-2 border-orange-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none bg-white/80"
          />
          {errors.title && <p className="text-xs text-red-500 mt-2">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border border-blue-100">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Description (Optional)</label>
          <textarea
            {...register("description")}
            placeholder="Provide additional details about the event..."
            className="w-full p-3 rounded-xl border-2 border-blue-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none bg-white/80 resize-none"
            rows={4}
          />
        </div>

        {/* Date and Time */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-5 rounded-2xl border border-violet-100">
          <label className="text-sm font-semibold text-gray-700 mb-3 block">Event Schedule</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Start Date & Time</label>
              <input
                type="datetime-local"
                {...register("startTime")}
                className="w-full p-3 rounded-xl border-2 border-violet-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none bg-white/80"
              />
              {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime.message}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">End Date & Time</label>
              <input
                type="datetime-local"
                {...register("endTime")}
                className="w-full p-3 rounded-xl border-2 border-violet-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none bg-white/80"
              />
              {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime.message}</p>}
            </div>
          </div>
        </div>

        {/* Grade Selection */}
        {sortedGrades && sortedGrades.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Target Grade (Optional)</label>
            <select
              {...register("gradeId")}
              className="w-full p-3 rounded-xl border-2 border-green-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none bg-white/80"
              defaultValue=""
            >
              <option value="">🏫 All School (All Grades)</option>
              {sortedGrades.map((grade: any) => (
                <option key={grade.id} value={grade.id}>
                  🎓 Grade {grade.level === 0 ? 'R' : grade.level}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Select a specific grade or leave as All School for school-wide events
            </p>
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : type === "create" ? "📅 Create Event" : "✏️ Update Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
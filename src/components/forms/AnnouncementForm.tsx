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
    <div className="relative max-h-[85vh] overflow-y-auto">
      <form className="flex flex-col gap-6 p-1" onSubmit={onSubmit}>
        {/* Header */}
        <div className="flex items-center gap-4 pb-6 border-b-2">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {type === "create" ? "Create New Announcement" : "Update Announcement"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Share important information with students and parents</p>
          </div>
        </div>

        {/* Title */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Announcement Title</label>
          <input
            {...register("title")}
            placeholder="e.g., School Closure, Important Notice, Exam Schedule"
            className="w-full p-3 rounded-xl border-2 border-purple-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none bg-white/80"
          />
          {errors.title && <p className="text-xs text-red-500 mt-2">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border border-blue-100">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Description</label>
          <textarea
            {...register("description")}
            placeholder="Provide detailed information about the announcement..."
            className="w-full p-3 rounded-xl border-2 border-blue-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none bg-white/80 resize-none"
            rows={5}
          />
          {errors.description && <p className="text-xs text-red-500 mt-2">{errors.description.message}</p>}
        </div>

        {/* Date and Class */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-5 rounded-2xl border border-violet-100">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Announcement Date</label>
            <input
              type="date"
              {...register("date")}
              className="w-full p-3 rounded-xl border-2 border-violet-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none bg-white/80"
            />
            {errors.date && <p className="text-xs text-red-500 mt-2">{errors.date.message}</p>}
          </div>

          {/* Class Selection */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Target Class (Optional)</label>
            <select
              {...register("classId")}
              className="w-full p-3 rounded-xl border-2 border-green-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none bg-white/80"
            >
              <option value="">🏫 All School (All Classes)</option>
              {classes?.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  📚 {cls.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Select a specific class or leave as All School for school-wide announcements
            </p>
          </div>
        </div>

        {/* Error Display */}
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
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 text-white rounded-xl font-bold transition-all"
          >
            {type === "create" ? "📢 Create Announcement" : "✏️ Update Announcement"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnnouncementForm;
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SubjectForm = ({
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
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
  });

  // AFTER REACT 19 IT'LL BE USEACTIONSTATE

  const [state, formAction] = useFormState(
    type === "create" ? createSubject : updateSubject,
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
      toast(`Subject has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers } = relatedData || { teachers: [] };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h1 className="text-2xl font-bold text-gray-800">
            {type === "create" ? "Create New Subject" : "Update Subject"}
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
          <div className="space-y-6">
            {/* Subject Name Field */}
            <div className="space-y-2">
              <InputField
                label="Subject name"
                name="name"
                defaultValue={data?.name}
                register={register}
                error={errors?.name}
              />
            </div>

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

            {/* Teachers Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Teachers {type === "create" && "(Optional)"}
              </label>
              
              {(teachers.length > 0 || type === "update") ? (
                <div className="space-y-1">
                  <select
                    multiple
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 min-h-[120px] bg-white hover:border-gray-400"
                    {...register("teachers")}
                    defaultValue={data?.teachers}
                  >
                    {teachers.map(
                      (teacher: { id: string; name: string; surname: string }) => (
                        <option 
                          value={teacher.id} 
                          key={teacher.id}
                          className="py-2 px-2 hover:bg-blue-50"
                        >
                          {teacher.name + " " + teacher.surname}
                        </option>
                      )
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple teachers
                  </p>
                  {errors.teachers?.message && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.teachers.message.toString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 min-h-[120px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2">
                        <svg className="w-8 h-8 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <p className="font-medium">No teachers available</p>
                      <p className="text-xs mt-1">Create teachers first, then edit this subject to assign them</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800 font-medium">Something went wrong!</span>
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
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {type === "create" ? "Create Subject" : "Update Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectForm;
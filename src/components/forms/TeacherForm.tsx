"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

// Type definitions for Cloudinary
interface CloudinaryUploadInfo {
  secure_url: string;
  public_id: string;
  original_filename?: string;
  [key: string]: any;
}

// Updated InputField component with consistent sizing
const InputField = ({
  label,
  name,
  defaultValue,
  register,
  error,
  type = "text",
  hidden = false,
  ...inputProps
}: {
  label: string;
  name: string;
  defaultValue?: string;
  register: any;
  error?: any;
  type?: string;
  hidden?: boolean;
  [key: string]: any;
}) => {
  if (hidden) {
    return (
      <input
        type="hidden"
        {...register(name)}
        defaultValue={defaultValue}
        {...inputProps}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {error && "*"}
      </label>
      <input
        type={type}
        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 transition text-base"
        {...register(name)}
        defaultValue={defaultValue}
        {...inputProps}
      />
      {error?.message && (
        <p className="text-xs text-red-500 mt-1">
          {error.message.toString()}
        </p>
      )}
    </div>
  );
};

const TeacherForm = ({
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
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
  });

  const [img, setImg] = useState<CloudinaryUploadInfo | null>(null);
  const [uploadError, setUploadError] = useState<string>("");

  const [state, formAction] = useFormState(
    type === "create" ? createTeacher : updateTeacher,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  // Handle server action response
  useEffect(() => {
    if (state.success) {
      toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(`Failed to ${type} teacher`);
    }
  }, [state, router, type, setOpen]);

  const { subjects } = relatedData || { subjects: [] };

  // Handle close with event stopPropagation to prevent parent modal from interfering
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(false);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <form
        className="flex flex-col gap-8 max-h-[90vh] overflow-y-auto p-8 bg-white shadow-2xl rounded-2xl border border-gray-200"
        action={async (formData: FormData) => {
          const dataObject = {
            id: formData.get("id")?.toString() || undefined,
            name: formData.get("name")?.toString() || "",
            surname: formData.get("surname")?.toString() || "",
            username: formData.get("username")?.toString() || "",
            email: formData.get("email")?.toString() || undefined,
            password: formData.get("password")?.toString() || undefined,
            phone: formData.get("phone")?.toString() || undefined,
            address: formData.get("address")?.toString() || "",
            birthday: new Date(formData.get("birthday")!.toString()),
            sex: formData.get("sex")?.toString() as "MALE" | "FEMALE",
            img: img?.secure_url || data?.img || undefined,
            subjects: formData.getAll("subjects").map((id) => id.toString()),
          };

          await formAction(dataObject);
        }}
      >
        {/* Header with Close Button */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-extrabold text-blue-700">
            {type === "create" ? "👨‍🏫 Create New Teacher" : "✏️ Update Teacher"}
          </h1>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="flex-shrink-0 w-10 h-10 bg-gray-100 hover:bg-red-100 border border-gray-300 hover:border-red-400 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md group"
            aria-label="Close form"
          >
            <svg
              className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Authentication Information */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            🔐 Authentication Information
          </h2>
          <div className="flex flex-col gap-6">
            <InputField
              label="Username"
              name="username"
              defaultValue={data?.username}
              register={register}
              error={errors?.username}
            />
            <InputField
              label="Email"
              name="email"
              defaultValue={data?.email}
              register={register}
              error={errors?.email}
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              defaultValue={data?.password}
              register={register}
              error={errors?.password}
            />
          </div>
        </div>

        {/* Personal Information */}
        <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl shadow-sm border border-green-200">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            👤 Personal Information
          </h2>
          <div className="flex flex-col gap-6">
            <InputField
              label="First Name"
              name="name"
              defaultValue={data?.name}
              register={register}
              error={errors.name}
            />
            <InputField
              label="Last Name"
              name="surname"
              defaultValue={data?.surname}
              register={register}
              error={errors.surname}
            />
            <InputField
              label="Phone"
              name="phone"
              defaultValue={data?.phone}
              register={register}
              error={errors.phone}
            />
            <InputField
              label="Birthday"
              name="birthday"
              defaultValue={
                data?.birthday
                  ? data.birthday.toISOString().split("T")[0]
                  : ""
              }
              register={register}
              error={errors.birthday}
              type="date"
            />
            <InputField
              label="Address"
              name="address"
              defaultValue={data?.address}
              register={register}
              error={errors.address}
            />

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

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 transition text-base"
                {...register("sex")}
                defaultValue={data?.sex}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {errors.sex?.message && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.sex.message.toString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Subject Assignment */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            📚 Subject Assignment
          </h2>

          {(subjects.length > 0 || type === "update") && (
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subjects {type === "create" && "(Optional)"}
              </label>
              <select
                multiple
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 transition text-base min-h-[120px]"
                {...register("subjects")}
                defaultValue={data?.subjects}
              >
                {subjects.map((subject: { id: number; name: string }) => (
                  <option value={subject.id} key={subject.id} className="py-2">
                    {subject.name}
                  </option>
                ))}
              </select>
              {errors.subjects?.message && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.subjects.message.toString()}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                💡 Hold Ctrl/Cmd to select multiple subjects
              </p>
            </div>
          )}

          {subjects.length === 0 && type === "create" && (
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subjects
              </label>
              <div className="w-full p-3 rounded-lg border border-gray-300 text-sm text-gray-400 bg-gray-50">
                📝 No subjects available. Create subjects first, then edit this
                teacher to assign subjects.
              </div>
            </div>
          )}
        </div>

        {/* Profile Photo Upload */}
        <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl shadow-sm border border-orange-200">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            📸 Profile Photo
          </h2>

          <CldUploadWidget
            uploadPreset="school"
            options={{
              multiple: false,
              maxFiles: 1,
              resourceType: "image",
              maxImageFileSize: 5000000,
              folder: "teachers",
              sources: ["local", "url", "camera"],
              showAdvancedOptions: false,
              cropping: false,
              maxImageWidth: 1000,
              maxImageHeight: 1000,
            }}
            onSuccess={(result) => {
              if (
                result.info &&
                typeof result.info === "object" &&
                "secure_url" in result.info
              ) {
                const uploadInfo = result.info as CloudinaryUploadInfo;
                setImg(uploadInfo);
                setUploadError("");
              } else {
                setUploadError(
                  "Upload completed but result format is unexpected"
                );
              }
            }}
            onError={(error) => {
              const errorMessage =
                error?.toString || error?.toString() || "Unknown error occurred";
              setUploadError(`Failed to upload image: ${errorMessage}`);
            }}
          >
            {({ open }) => (
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 cursor-pointer flex items-center gap-3 justify-center group"
                  onClick={() => {
                    setUploadError("");
                    if (typeof open === "function") {
                      open();
                    } else {
                      setUploadError(
                        "Upload widget is not ready yet. Please try again."
                      );
                    }
                  }}
                >
                  <Image
                    src="/upload.png"
                    alt="upload"
                    width={24}
                    height={24}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="font-medium text-gray-700 group-hover:text-orange-600">
                    {img ? "Change Photo" : "Upload Photo"}
                  </span>
                </button>

                {img && img.secure_url && (
                  <div className="flex flex-col gap-3">
                    <div className="text-sm text-green-600 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Image uploaded successfully
                    </div>
                    <div className="w-full h-32 relative border-2 border-green-200 rounded-lg overflow-hidden">
                      <Image
                        src={img.secure_url}
                        alt="Uploaded preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                      📁 File: {img.original_filename || "Unknown filename"}
                    </div>
                  </div>
                )}

                {data?.img && !img && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-100 p-3 rounded-lg">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      Current photo will be kept if no new photo is uploaded
                    </span>
                  </div>
                )}

                {uploadError && (
                  <div className="text-sm text-red-600 p-3 bg-red-100 rounded-lg border border-red-200">
                    ⚠️ {uploadError}
                  </div>
                )}
              </div>
            )}
          </CldUploadWidget>
        </div>

        {state.error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
            <span className="text-red-700 font-medium">
              ⚠️ Something went wrong! Please try again.
            </span>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-300">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
          >
            {type === "create" ? "🚀 Create Teacher" : "💾 Update Teacher"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherForm;
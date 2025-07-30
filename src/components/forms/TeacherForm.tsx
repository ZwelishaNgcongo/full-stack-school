"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
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

  return (
    <form 
     className="flex flex-col gap-8" 
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
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update the teacher"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
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
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
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
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday ? data.birthday.toISOString().split("T")[0] : ""}
          register={register}
          error={errors.birthday}
          type="date"
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        
        {/* Only show subjects field if subjects exist or we're updating */}
        {(subjects.length > 0 || type === "update") && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">
              Subjects {type === "create" && "(Optional)"}
            </label>
            <select
              multiple
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("subjects")}
              defaultValue={data?.subjects}
            >
              {subjects.map((subject: { id: number; name: string }) => (
                <option value={subject.id} key={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {errors.subjects?.message && (
              <p className="text-xs text-red-400">
                {errors.subjects.message.toString()}
              </p>
            )}
          </div>
        )}

        {/* Show message when no subjects exist */}
        {subjects.length === 0 && type === "create" && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Subjects</label>
            <div className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full text-gray-400 bg-gray-50">
              No subjects available. Create subjects first, then edit this teacher to assign subjects.
            </div>
          </div>
        )}

        {/* Improved Cloudinary Upload Widget */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Profile Photo (Optional)</label>
          <CldUploadWidget
            uploadPreset="school"
            options={{
              multiple: false,
              maxFiles: 1,
              resourceType: "image",
              maxImageFileSize: 5000000, // 5MB limit
              folder: "teachers", // Optional: organize uploads in folders
              sources: ["local", "url", "camera"], // Allow local files, URLs, and camera
              showAdvancedOptions: false,
              cropping: false, // Disable cropping initially to simplify
              maxImageWidth: 1000,
              maxImageHeight: 1000,
            }}
            onSuccess={(result) => {
              console.log("Upload successful - Full result:", result);
              
              // Type guard to check if result.info is an object with secure_url
              if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
                const uploadInfo = result.info as CloudinaryUploadInfo;
                console.log("Secure URL:", uploadInfo.secure_url);
                console.log("Public ID:", uploadInfo.public_id);
                
                // Store the upload info
                setImg(uploadInfo);
                setUploadError(""); // Clear any previous errors
              } else {
                console.error("Unexpected result format:", result);
                setUploadError("Upload completed but result format is unexpected");
              }
            }}
            onError={(error) => {
              console.error("Upload error:", error);
              const errorMessage = error?.toString || error?.toString() || 'Unknown error occurred';
              setUploadError(`Failed to upload image: ${errorMessage}`);
            }}
          >
            {({ open }) => (
              <div className="flex flex-col gap-2">
                <div
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full cursor-pointer hover:bg-gray-50 flex items-center gap-2 justify-center"
                  onClick={() => {
                    console.log("Opening upload widget...");
                    console.log("Current img state:", img);
                    setUploadError(""); // Clear previous errors
                    if (typeof open === "function") {
                      open();
                    } else {
                      console.warn("Cloudinary widget not ready: open is undefined");
                      setUploadError("Upload widget is not ready yet. Please try again.");
                    }
                  }}
                >
                  <Image src="/upload.png" alt="upload" width={20} height={20} />
                  <span>
                    {img ? "Change Photo" : "Upload Photo"}
                  </span>
                </div>
                
                {/* Show current image preview if exists */}
                {img && img.secure_url && (
                  <div className="flex flex-col gap-2">
                    <div className="text-xs text-green-600">
                      ✓ Image uploaded successfully
                    </div>
                    <div className="w-full h-20 relative border rounded">
                      <Image 
                        src={img.secure_url} 
                        alt="Uploaded preview" 
                        fill
                        className="object-cover rounded"
                        onError={() => {
                          console.error("Image preview error");
                          setUploadError("Error displaying image preview");
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      File: {img.original_filename || 'Unknown filename'}
                    </div>
                  </div>
                )}
                
                {/* Show existing image for updates */}
                {data?.img && !img && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Current photo will be kept</span>
                  </div>
                )}
                
                {/* Show upload error */}
                {uploadError && (
                  <div className="text-xs text-red-400 p-2 bg-red-50 rounded">
                    {uploadError}
                  </div>
                )}
              </div>
            )}
          </CldUploadWidget>
        </div>
      </div>
      
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      
      <button 
        type="submit"
        className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500 transition-colors"
      >
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default TeacherForm;
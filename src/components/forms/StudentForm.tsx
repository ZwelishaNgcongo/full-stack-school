"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const StudentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any; // should contain: grades, classes
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
  });

  const [img, setImg] = useState<any>();

  const [state, formAction] = useFormState(
    type === "create" ? createStudent : updateStudent,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    // Ensure we're only sending student-related data
    const studentData = {
      ...data,
      img: img?.secure_url,
      // Use studentId as username if your model uses username field
      username: data.studentId,
      // Make sure we're not accidentally sending teacher fields
      role: undefined,
      subjects: undefined,
    };
    formAction(studentData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Student has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const grades = relatedData?.grades ?? [];
  const classes = relatedData?.classes ?? [];

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update the student"}
      </h1>

      {/* Essential Student Information */}
      <span className="text-xs text-gray-400 font-medium">Student Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField 
          label="Student ID" 
          name="studentId" 
          defaultValue={data?.username || data?.studentId} 
          register={register} 
          error={errors?.studentId}
        />
        
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
          label="Date of Birth" 
          name="birthday" 
          defaultValue={data?.birthday?.toISOString().split("T")[0]} 
          register={register} 
          error={errors.birthday} 
          type="date" 
        />
        
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select 
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" 
            {...register("sex")} 
            defaultValue={data?.sex}
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && <p className="text-xs text-red-400">{errors.sex.message.toString()}</p>}
        </div>

        {/* Grade Select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select 
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" 
            {...register("gradeId")} 
            defaultValue={data?.gradeId}
          >
            <option value="">Select grade</option>
            {grades.map((grade: any) => (
              <option key={grade.id} value={grade.id}>{grade.name}</option>
            ))}
          </select>
          {errors.gradeId?.message && <p className="text-xs text-red-400">{errors.gradeId.message.toString()}</p>}
        </div>

        {/* Class Select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select 
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" 
            {...register("classId")} 
            defaultValue={data?.classId}
          >
            <option value="">Select class</option>
            {classes.map((cls: any) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          {errors.classId?.message && <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>}
        </div>
      </div>

      {/* Optional Contact Information */}
      <span className="text-xs text-gray-400 font-medium">Contact Information (Optional)</span>
      <div className="flex justify-between flex-wrap gap-4">
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
          label="Email" 
          name="email" 
          defaultValue={data?.email} 
          register={register} 
          error={errors?.email}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
         
        </div>

        {/* Hidden Id for update */}
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

        {/* Image Upload */}
        <CldUploadWidget
          uploadPreset="school"
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => (
            <div 
              className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer" 
              onClick={() => open()}
            >
              <Image src="/upload.png" alt="" width={28} height={28} />
              <span>Upload a photo</span>
            </div>
          )}
        </CldUploadWidget>
      </div>

      {/* Note about Student ID and password */}
      <div className="bg-blue-50 p-3 rounded-md">
        <p className="text-xs text-blue-600">
          <strong>Note:</strong> Please enter a unique Student ID. Parents will create their own password when first logging in using this Student ID.
        </p>
      </div>

      {/* Submission state */}
      {state.error && <span className="text-red-500">Something went wrong!</span>}

      <button 
        type="submit" 
        className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500 transition-colors"
      >
        {type === "create" ? "Create Student" : "Update Student"}
      </button>
    </form>
  );
};

export default StudentForm;
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ParentSchema, parentSchema } from "@/lib/formValidationSchemas";
import { createParent, updateParent } from "@/lib/actions";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useFormState } from "react-dom";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ParentForm({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema),
  });

  const [img, setImg] = useState<any>();
  const [state, formAction] = useFormState(
    type === "create" ? createParent : updateParent,
    { success: false, error: false }
  );
  const router = useRouter();

  const onSubmit = handleSubmit((formData) => {
    const payload = {
      ...formData,
      img: img?.secure_url || data?.img,
      id: data?.id,
    };
    formAction(payload);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(`Parent ${type === "create" ? "created" : "updated"} successfully`);
      setOpen(false);
      router.refresh();
    }
  }, [state]);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Parent" : "Update Parent"}
      </h1>

      <InputField label="Username" name="username" defaultValue={data?.username} register={register} error={errors.username} />
      <InputField label="First Name" name="name" defaultValue={data?.name} register={register} error={errors.name} />
      <InputField label="Last Name" name="surname" defaultValue={data?.surname} register={register} error={errors.surname} />
      <InputField label="Email" name="email" defaultValue={data?.email} register={register} error={errors.email} />
      <InputField label="Phone" name="phone" defaultValue={data?.phone} register={register} error={errors.phone} />
      <InputField label="Address" name="address" defaultValue={data?.address} register={register} error={errors.address} />
      <InputField label="Student ID" name="studentId" register={register} error={errors.studentId} />

      {type === "create" && (
        <InputField label="Password" name="password" type="password" register={register} error={errors.password} />
      )}

      <CldUploadWidget uploadPreset="school" onSuccess={(res, { widget }) => {
        setImg(res.info);
        widget.close();
      }}>
        {({ open }) => (
          <div
            onClick={() => open()}
            className="cursor-pointer p-4 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-md flex items-center gap-2 text-sm"
          >
            <Image src="/upload.png" alt="Upload" width={24} height={24} />
            <span>Upload Image</span>
          </div>
        )}
      </CldUploadWidget>

      {img && (
        <Image src={img.secure_url} alt="Preview" width={50} height={50} className="rounded-md mt-2" />
      )}

      {state.error && <span className="text-red-500">Something went wrong.</span>}

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        {type === "create" ? "Create Parent" : "Update Parent"}
      </button>
    </form>
  );
}

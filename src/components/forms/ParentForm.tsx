"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createParent, updateParent } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { parentSchema, ParentSchema } from "@/lib/formValidationSchemas";
import { z } from "zod";

// Custom InputField component matching StudentForm pattern
const InputField = ({
  label,
  name,
  type = "text",
  defaultValue,
  register,
  error,
  hidden = false,
  required = false,
}: {
  label: string;
  name: keyof ParentSchema;
  type?: string;
  defaultValue?: string;
  register: any;
  error?: any;
  hidden?: boolean;
  required?: boolean;
}) => (
  <div className={`w-full ${hidden ? "hidden" : ""}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      defaultValue={defaultValue}
      {...register(name)}
      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 transition text-base"
    />
    {error && (
      <p className="text-xs text-red-500 mt-1">{error.message?.toString()}</p>
    )}
  </div>
);

export default function ParentForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { students: { id: string; name: string; surname: string; studentId: string }[] };
}) {
  const {
    register,
    formState: { errors },
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createParent : updateParent,
    { success: false, error: false }
  );
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Parent ${type === "create" ? "created" : "updated"} successfully`
      );
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error(`Failed to ${type} parent`);
    }
  }, [state.success, state.error, router, setOpen, type]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(false);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <form
        className="flex flex-col gap-8 max-h-[90vh] overflow-y-auto p-8 bg-white shadow-2xl rounded-2xl border border-gray-200"
        action={async (formData: FormData) => {
          console.log("🚀 Parent form submission started");
          
          // Validate required fields first
          const requiredFields = ['name', 'surname', 'username'];
          if (type === "create") {
            requiredFields.push('password');
          }
          
          const missingFields = requiredFields.filter(field => !formData.get(field));
          
          if (missingFields.length > 0) {
            toast.error(`Missing required fields: ${missingFields.join(', ')}`);
            console.error("❌ Missing fields:", missingFields);
            return;
          }

          // Validate studentId - this is crucial for the Prisma relation
          const studentIdValue = formData.get("studentId")?.toString();
          if (!studentIdValue) {
            toast.error("Please select a student");
            console.error("❌ No student selected");
            return;
          }

          // Build data object following StudentForm pattern
          const dataObject: ParentSchema = {
            name: formData.get("name")?.toString()!,
            username: formData.get("username")?.toString()!,
            surname: formData.get("surname")?.toString()!,
            email: formData.get("email")?.toString() || "",
            phone: formData.get("phone")?.toString() || "",
            address: formData.get("address")?.toString() || "",
            studentId: studentIdValue, // This will now be the custom studentId field
          };

          // Add ID for updates
          if (type === "update" && data?.id) {
            dataObject.id = data.id;
          }

          // Add password for creates only
          if (type === "create") {
            dataObject.password = formData.get("password")?.toString()!;
          }

          console.log("📝 Parent data object built:", dataObject);

          try {
            // Validate with Zod schema (like StudentForm does)
            const validatedData = parentSchema.parse(dataObject);
            console.log("✅ Zod validation passed:", validatedData);
            
            // Submit to server action
            await formAction(validatedData);
          } catch (error) {
            if (error instanceof z.ZodError) {
              console.error("❌ Zod validation failed:", error.errors);
              error.errors.forEach(err => {
                toast.error(`${err.path.join('.')}: ${err.message}`);
              });
              return;
            } else {
              console.error("❌ Unexpected error:", error);
              toast.error("Failed to submit form");
            }
          }
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-extrabold text-indigo-700">
            {type === "create" ? "Add New Parent" : "Update Parent Information"}
          </h1>
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

        {/* Hidden ID field for updates */}
        {data?.id && (
          <InputField
            label="ID"
            name="id"
            defaultValue={data.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        {/* Personal Information */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="First Name"
              name="name"
              defaultValue={data?.name}
              register={register}
              error={errors.name}
              required
            />
            <InputField
              label="Last Name"
              name="surname"
              defaultValue={data?.surname}
              register={register}
              error={errors.surname}
              required
            />
            <InputField
              label="Username"
              name="username"
              defaultValue={data?.username}
              register={register}
              error={errors.username}
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            Contact Information
          </h2>
          <div className="flex flex-col gap-6">
            <InputField
              label="Email Address"
              name="email"
              type="email"
              defaultValue={data?.email}
              register={register}
              error={errors.email}
            />
            <InputField
              label="Phone Number"
              name="phone"
              defaultValue={data?.phone}
              register={register}
              error={errors.phone}
            />
            <InputField
              label="Home Address"
              name="address"
              defaultValue={data?.address}
              register={register}
              error={errors.address}
            />
          </div>
        </div>

        {/* Student & Security Information */}
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-200">
          <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
            Student & Security Information
          </h2>
          <div className="space-y-4">
            {/* Student Selection - Now using studentId */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Student <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 transition text-base"
                {...register("studentId", { required: "Student selection is required" })}
                defaultValue={data?.studentId || ""}
              >
                <option value="">Select a student</option>
                {relatedData?.students?.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.studentId} - {student.name} {student.surname}
                  </option>
                ))}
              </select>
              {errors.studentId?.message && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.studentId.message.toString()}
                </p>
              )}
            </div>

            {/* Password field only for create */}
            {type === "create" && (
              <InputField
                label="Password"
                name="password"
                type="password"
                register={register}
                error={errors.password}
                required
              />
            )}
          </div>
        </div>

        {/* Server Error */}
        {state.error && (
          <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
            <span className="text-red-700 font-medium">
              Something went wrong! Please check the console for details and try again.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end pt-6 border-t border-gray-300">
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
          >
            {type === "create" ? "Create Parent" : "Update Parent"}
          </button>
        </div>
      </form>
    </div>
  );
}
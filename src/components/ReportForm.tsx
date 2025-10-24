"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "./InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { reportSchema, ReportSchema } from "@/lib/formValidationSchemas";
import { createReport, updateReport } from "@/lib/actions";

const ReportForm = ({
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
    watch,
    setValue,
  } = useForm<ReportSchema>({
    resolver: zodResolver(reportSchema),
    defaultValues: data || {},
  });

  const [state, formAction] = useFormState(
    type === "create" ? createReport : updateReport,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  // Student search state
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentSearchResults, setStudentSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);

  // Watch form values
  const marks = watch("marks");
  const selectedSubjectId = watch("subjectId");

  // Auto-calculate grade based on marks
  useEffect(() => {
    if (marks !== undefined && marks !== null) {
      let grade = "";
      if (marks >= 80) grade = "A";
      else if (marks >= 70) grade = "B";
      else if (marks >= 60) grade = "C";
      else if (marks >= 50) grade = "D";
      else if (marks >= 40) grade = "E";
      else grade = "F";
      
      setValue("grade", grade);
    }
  }, [marks, setValue]);

  // Handle student search by studentId
  const handleStudentSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setStudentSearch(query);

    if (!query.trim()) {
      setStudentSearchResults([]);
      setSelectedStudent(null);
      setValue("studentId", "");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/students/search?query=${query}`);
      const results = await response.json();
      setStudentSearchResults(results);
    } catch (error) {
      console.error("Error searching students:", error);
      toast.error("Error searching for students");
    } finally {
      setIsSearching(false);
    }
  };

  // Select student from search results
  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setValue("studentId", student.id);
    setStudentSearch(student.studentId || student.id);
    setStudentSearchResults([]);
  };

  // Get available subjects for selected student (from their class)
  useEffect(() => {
    if (!selectedStudent) {
      setAvailableSubjects([]);
      return;
    }

    // Filter subjects based on the student's class
    const subjects = (relatedData?.subjects || []).filter(
      (subject: any) =>
        subject.lessons?.some(
          (lesson: any) =>
            lesson.class.students?.some((s: any) => s.id === selectedStudent.id)
        )
    );
    setAvailableSubjects(subjects);
    setValue("subjectId", undefined as any); // FIXED: Use undefined instead of empty string
  }, [selectedStudent, relatedData, setValue]);

  const onSubmit = handleSubmit((formData) => {
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }

    console.log("Form submitted:", formData);

    const reportData: ReportSchema = {
      studentId: formData.studentId,
      subjectId: Number(formData.subjectId),
      term: formData.term,
      year: Number(formData.year),
      marks: Number(formData.marks),
      grade: formData.grade,
      teacherComment: formData.teacherComment || "",
    };

    if (type === "update" && data?.id) {
      reportData.id = data.id;
    }

    console.log("Processed report data:", reportData);
    formAction(reportData as any);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(`Report has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error("Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Term Report" : "Update Term Report"}
      </h1>

      <div className="flex flex-col gap-4">
        {/* Student Search */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500 font-medium">
            Search Student by ID *
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter student ID..."
              value={studentSearch}
              onChange={handleStudentSearch}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              autoComplete="off"
            />
            {isSearching && (
              <p className="text-xs text-gray-400 mt-1">Searching...</p>
            )}
            {studentSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto z-10 shadow-lg">
                {studentSearchResults.map((student: any) => (
                  <button
                    key={student.id}
                    type="button"
                    className="w-full text-left p-2 hover:bg-gray-100 text-sm border-b border-gray-200 last:border-b-0"
                    onClick={() => handleSelectStudent(student)}
                  >
                    <span className="font-medium">{student.studentId}</span> - {student.name} {student.surname}
                    {student.class?.name && (
                      <span className="text-gray-500 text-xs ml-2">({student.class.name})</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {studentSearch && studentSearchResults.length === 0 && !isSearching && (
              <p className="text-xs text-red-400 mt-1">No students found</p>
            )}
          </div>
          {selectedStudent && (
            <div className="p-2 bg-blue-50 border border-blue-300 rounded-md text-sm">
              <p className="text-blue-700">
                <strong>Selected:</strong> {selectedStudent.studentId} - {selectedStudent.name} {selectedStudent.surname}
                {selectedStudent.class?.name && (
                  <span className="ml-2">({selectedStudent.class.name})</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Subject Selection */}
        {selectedStudent && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 font-medium">
              Subject *
            </label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("subjectId", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              defaultValue={data?.subjectId || ""}
            >
              <option value="">Select a subject</option>
              {availableSubjects.map((subject: any) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {availableSubjects.length === 0 && (
              <p className="text-xs text-orange-500">No subjects available for this student</p>
            )}
            {errors.subjectId?.message && (
              <p className="text-xs text-red-400">{errors.subjectId.message.toString()}</p>
            )}
          </div>
        )}

        {/* Term and Year Selection */}
        {selectedStudent && selectedSubjectId && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500 font-medium">
                Term *
              </label>
              <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("term")}
                defaultValue={data?.term || ""}
              >
                <option value="">Select term</option>
                <option value="TERM1">Term 1</option>
                <option value="TERM2">Term 2</option>
                <option value="TERM3">Term 3</option>
                <option value="TERM4">Term 4</option>
              </select>
              {errors.term?.message && (
                <p className="text-xs text-red-400">{errors.term.message.toString()}</p>
              )}
            </div>

            <InputField
              label="Year"
              name="year"
              type="number"
              register={register}
              error={errors.year}
              defaultValue={data?.year || new Date().getFullYear()}
              inputProps={{ min: 2020, max: 2100 }}
            />
          </div>
        )}

        {/* Marks and Grade */}
        {selectedStudent && selectedSubjectId && (
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Marks (0-100)"
              name="marks"
              type="number"
              register={register}
              error={errors.marks}
              defaultValue={data?.marks}
              inputProps={{ min: 0, max: 100, step: 1 }}
            />

            <InputField
              label="Grade (Auto-calculated)"
              name="grade"
              type="text"
              register={register}
              error={errors.grade}
              defaultValue={data?.grade}
              inputProps={{ readOnly: true }}
            />
          </div>
        )}

        {/* Teacher Comment */}
        {selectedStudent && selectedSubjectId && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 font-medium">
              Teacher Comment (Optional)
            </label>
            <textarea
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[100px]"
              {...register("teacherComment")}
              placeholder="Enter comments about student's performance..."
              defaultValue={data?.teacherComment || ""}
            />
            {errors.teacherComment?.message && (
              <p className="text-xs text-red-400">{errors.teacherComment.message.toString()}</p>
            )}
          </div>
        )}

        {/* Hidden ID field for updates */}
        {type === "update" && data?.id && (
          <input type="hidden" {...register("id")} value={data.id} />
        )}
      </div>

      {state.error && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
          <span className="text-red-700 text-sm">
            Something went wrong! Please check all fields and try again.
          </span>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedStudent || !selectedSubjectId}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {type === "create" ? "Create Report" : "Update Report"}
        </button>
      </div>
    </form>
  );
};

export default ReportForm;
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";

const ResultForm = ({
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
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: data || {},
  });

  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
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
  const [availableAssessments, setAvailableAssessments] = useState<any[]>([]);

  // Watch assessment type and form values
  const assessmentType = watch("assessmentType");
  const selectedAssessmentId = watch("examId") || watch("assignmentId");

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
      // Call your API endpoint to search for students by studentId
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

  // Get available assessments for selected student
  useEffect(() => {
    if (!selectedStudent || !assessmentType) {
      setAvailableAssessments([]);
      return;
    }

    if (assessmentType === "exam") {
      // Filter exams where the student belongs to the class
      const exams = (relatedData?.exams || []).filter(
        (exam: any) =>
          exam.lesson.class.students?.some((s: any) => s.id === selectedStudent.id)
      );
      setAvailableAssessments(exams);
      setValue("examId", "");
    } else if (assessmentType === "assignment") {
      // Filter assignments where the student belongs to the class
      const assignments = (relatedData?.assignments || []).filter(
        (assignment: any) =>
          assignment.lesson.class.students?.some((s: any) => s.id === selectedStudent.id)
      );
      setAvailableAssessments(assignments);
      setValue("assignmentId", "");
    }
  }, [selectedStudent, assessmentType, relatedData, setValue]);

  const onSubmit = handleSubmit((formData) => {
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }

    console.log("Form submitted:", formData);

    const resultData: ResultSchema = {
      score: Number(formData.score),
      studentId: formData.studentId,
      assessmentType: formData.assessmentType,
    };

    if (type === "update" && data?.id) {
      resultData.id = data.id;
    }

    if (formData.assessmentType === "exam" && formData.examId) {
      resultData.examId = Number(formData.examId);
    } else if (formData.assessmentType === "assignment" && formData.assignmentId) {
      resultData.assignmentId = Number(formData.assignmentId);
    }

    console.log("Processed result data:", resultData);
    formAction(resultData as any);
  });

  useEffect(() => {
    if (state.success) {
      toast.success(`Result has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      toast.error("Something went wrong!");
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new result" : "Update result"}
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
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto z-10">
                {studentSearchResults.map((student: any) => (
                  <button
                    key={student.id}
                    type="button"
                    className="w-full text-left p-2 hover:bg-gray-100 text-sm border-b border-gray-200 last:border-b-0"
                    onClick={() => handleSelectStudent(student)}
                  >
                    <span className="font-medium">{student.studentId}</span> - {student.name} {student.surname}
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
              </p>
            </div>
          )}
        </div>

        {/* Assessment Type Selection */}
        {selectedStudent && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 font-medium">
              Assessment Type *
            </label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("assessmentType")}
              defaultValue={data?.examId ? "exam" : data?.assignmentId ? "assignment" : ""}
            >
              <option value="">Select assessment type</option>
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
            </select>
            {errors.assessmentType?.message && (
              <p className="text-xs text-red-400">{errors.assessmentType.message.toString()}</p>
            )}
          </div>
        )}

        {/* Exam Selection */}
        {selectedStudent && assessmentType === "exam" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 font-medium">Exam *</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("examId", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              defaultValue={data?.examId || ""}
            >
              <option value="">Select an exam</option>
              {availableAssessments.map((exam: any) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} - {exam.lesson.subject.name} ({exam.lesson.class.name})
                </option>
              ))}
            </select>
            {availableAssessments.length === 0 && (
              <p className="text-xs text-orange-500">No exams available for this student</p>
            )}
            {errors.examId?.message && (
              <p className="text-xs text-red-400">{errors.examId.message.toString()}</p>
            )}
          </div>
        )}

        {/* Assignment Selection */}
        {selectedStudent && assessmentType === "assignment" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 font-medium">
              Assignment *
            </label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("assignmentId", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              defaultValue={data?.assignmentId || ""}
            >
              <option value="">Select an assignment</option>
              {availableAssessments.map((assignment: any) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title} - {assignment.lesson.subject.name} ({assignment.lesson.class.name})
                </option>
              ))}
            </select>
            {availableAssessments.length === 0 && (
              <p className="text-xs text-orange-500">No assignments available for this student</p>
            )}
            {errors.assignmentId?.message && (
              <p className="text-xs text-red-400">{errors.assignmentId.message.toString()}</p>
            )}
          </div>
        )}

        {/* Score Input */}
        {selectedStudent && assessmentType && selectedAssessmentId && (
          <InputField
            label="Score (0-100)"
            name="score"
            type="number"
            register={register}
            error={errors.score}
            defaultValue={data?.score}
            inputProps={{ min: 0, max: 100, step: 1 }}
          />
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
          disabled={!selectedStudent || !assessmentType || !selectedAssessmentId}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default ResultForm;
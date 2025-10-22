"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ViewResults = () => {
  const [studentId, setStudentId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId.trim()) {
      return;
    }

    setIsSearching(true);
    
    // Navigate to the results view page with the student ID
    router.push(`/list/results/view/${encodeURIComponent(studentId)}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-lamaPurple rounded-full flex items-center justify-center">
          <Image src="/search.png" alt="" width={20} height={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">View Student Results</h2>
          <p className="text-sm text-gray-500">Enter student ID to view their exam and assignment results</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
            Student ID
          </label>
          <div className="relative">
            <input
              type="text"
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter student ID (e.g., STU001)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lamaPurple focus:border-transparent transition-all"
              disabled={isSearching}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Image src="/search.png" alt="" width={16} height={16} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!studentId.trim() || isSearching}
          className="w-full bg-lamaPurple text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Image src="/search.png" alt="" width={18} height={18} />
              View Results
            </>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-2">
          
          <div>
            <p className="text-sm text-blue-800 font-medium">Quick Tip</p>
            <p className="text-xs text-blue-600 mt-1">
              You can view all exam scores and assignment grades for any student by entering their unique student ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewResults;
"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const TableSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  // Determine the search type based on the current path
  const getSearchType = () => {
    if (pathname.includes("/list/students")) return "students";
    if (pathname.includes("/list/reports")) return "reports";
    if (pathname.includes("/list/results")) return "results";
    return null;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const searchType = getSearchType();
    const params = new URLSearchParams(window.location.search);
    
    if (searchQuery.trim()) {
      // For students, reports, and results pages, use the search param
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    
    // Reset to page 1 when searching
    params.delete("page");
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2"
    >
      <Image src="/search.png" alt="" width={14} height={14} />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={
          getSearchType() === "students"
            ? "Search by name or student ID..."
            : getSearchType() === "reports"
            ? "Search by student or subject..."
            : getSearchType() === "results"
            ? "Search by student or title..."
            : "Search..."
        }
        className="w-[200px] p-2 bg-transparent outline-none"
      />
    </form>
  );
};

export default TableSearch;
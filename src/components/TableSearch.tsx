"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

type TableSearchProps = {
  placeholder?: string;
};

const TableSearch = ({ placeholder = "Search..." }: TableSearchProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const value = formData.get("search") as string;
    
    // Create new URLSearchParams from current search params
    const params = new URLSearchParams(searchParams);
    
    // Trim the search value
    const trimmedValue = value.trim();
    
    if (trimmedValue) {
      params.set("search", trimmedValue);
      params.delete("page"); // Reset to page 1 when searching
    } else {
      params.delete("search");
    }
    
    router.push(`?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
      <Image src="/search.png" alt="" width={14} height={14} />
      <input
        type="text"
        name="search"
        placeholder={placeholder}
        defaultValue={searchParams.get("search") || ""}
        className="w-[200px] p-2 bg-transparent outline-none"
      />
    </form>
  );
};

export default TableSearch;
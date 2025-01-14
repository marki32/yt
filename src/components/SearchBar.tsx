import { Search, Youtube } from "lucide-react";
import { useState } from "react";

const SearchBar = () => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex items-center justify-center w-full max-w-2xl mx-auto">
      <div className="flex items-center mr-4">
        <Youtube size={32} className="text-red-600" />
      </div>
      <div className="relative flex-1">
        <div
          className={`flex items-center rounded-full overflow-hidden transition-shadow duration-200 ${
            isFocused
              ? "shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
              : "shadow-[0_1px_3px_rgb(0,0,0,0.1)]"
          }`}
        >
          <input
            type="text"
            placeholder="Search"
            className="w-full py-2 px-6 bg-[#F1F1F1] outline-none text-[#222222] placeholder-gray-500 text-lg"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <button
            className="px-6 py-2 bg-[#F1F1F1] hover:bg-[#E5E5E5] transition-colors duration-200 flex items-center justify-center"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-[#222222]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
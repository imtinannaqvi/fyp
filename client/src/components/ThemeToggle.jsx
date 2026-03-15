// components/ThemeToggle.jsx
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${
        isDark ? "bg-blue-600" : "bg-gray-200"
      } ${className}`}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-yellow-400">
        <Sun size={13} />
      </span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-blue-200">
        <Moon size={13} />
      </span>

      {/* Thumb */}
      <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
        isDark ? "left-7" : "left-0.5"
      }`}>
        {isDark
          ? <Moon size={13} className="text-blue-600" />
          : <Sun size={13} className="text-yellow-500" />
        }
      </span>
    </button>
  );
};

export default ThemeToggle;
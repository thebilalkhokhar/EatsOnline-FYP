import { Loader } from "lucide-react";

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Light mode glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#ff5733] via-orange-300 to-yellow-200 opacity-20 blur-3xl dark:hidden"></div>

      {/* Dark mode glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2c1e1e] via-[#ff5733]/30 to-[#1c1c1c] opacity-40 blur-2xl hidden dark:block"></div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <Loader className="animate-spin text-[#ff5733] w-14 h-14" />
        <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold select-none">
          Loading, please wait...
        </p>
      </div>
    </div>
  );
};

export default Loading;

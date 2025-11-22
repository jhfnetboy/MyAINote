interface RoundedButtonProps {
  onClick: () => void;
  title: string;
  disabled?: boolean;
}

export const RoundedButton: React.FC<RoundedButtonProps> = ({
  onClick,
  title,
  disabled = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`m-4 max-w-xs rounded-xl border border-gray-200 p-6 text-left text-inherit transition-colors ${
      disabled 
        ? "opacity-50 cursor-not-allowed" 
        : "hover:border-blue-600 hover:text-blue-600 focus:border-blue-600 focus:text-blue-600 active:border-blue-600 active:text-blue-600 cursor-pointer"
    } rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center ${
      disabled ? "" : "hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent"
    } text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44`}
  >
    {title}
  </button>
);

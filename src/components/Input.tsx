import { Search, X } from "lucide-react";
import { useEffect, useRef, type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export interface InputProps extends Omit<ComponentProps<"div">, "onChange"> {
  onChange?: (value: string) => void;
  value?: string;
}

export default function Input({
  value,
  onChange,
  autoFocus,
  ...props
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, []);

  return (
    <div
      {...props}
      className={twMerge("relative flex items-center", props.className)}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for applications..."
        value={value}
        onInput={(e) => onChange?.(e.currentTarget.value)}
        className={twMerge(
          "w-full h-9 rounded-sm border border-neutral-200/25 focus:border-neutral-200 py-1 outline-none",
          value ? "pl-2 pr-7" : "pl-7 pr-2"
        )}
      />
      {value ? null : <Search className="absolute size-4 left-2 select-none" />}
      {value ? (
        <button
          className="absolute select-none p-2 h-full right-0"
          onClick={() => onChange?.("")}
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

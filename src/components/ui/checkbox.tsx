"use client"

import * as React from "react"
import { Check } from "lucide-react"

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className = "", checked = false, onCheckedChange, disabled = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={`
          inline-flex items-center justify-center h-4 w-4 shrink-0 rounded-sm border border-gray-300
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:cursor-not-allowed disabled:opacity-50
          transition-all duration-200
          ${checked 
            ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' 
            : 'bg-white hover:border-gray-400'
          }
          ${className}
        `}
        {...props}
      >
        {checked && <Check className="h-3 w-3" />}
      </button>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
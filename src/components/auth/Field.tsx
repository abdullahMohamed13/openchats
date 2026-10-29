import { useState } from "react";
import { Eye, EyeOff } from "pixelarticons/react";
import { AuthFieldSpec } from "@/lib/auth-validation";

interface FieldProps {
  id: string;
  spec: AuthFieldSpec;
  type: "text" | "email" | "password";
  icon: React.ReactNode;
  placeholder: string;
  autoComplete?: string;
  errors: Record<string, string>;
  onBlur: (spec: AuthFieldSpec, value: string) => void;
  onChange: (name: string) => void;
}

export function Field({ id, spec, type, icon, placeholder, autoComplete, errors, onBlur, onChange }: FieldProps) {
  const [revealed, setRevealed] = useState(false);
  const message = errors[spec.name];
  const isPassword = type === "password";

  return (
    <div className="field-group">
      <div className={`input-field ${message ? "has-error" : ""}`}>
        <i>{icon}</i>
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          name={spec.name}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? `${id}-error` : undefined}
          onChange={() => onChange(spec.name)}
          onBlur={(e) => onBlur(spec, e.target.value)}
        />
        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setRevealed((prev) => !prev)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
          >
            {revealed ? <Eye width={18} height={18} aria-hidden /> : <EyeOff width={18} height={18} aria-hidden />}
          </button>
        )}
      </div>
      {message && (
        <p id={`${id}-error`} role="alert" className="field-error">
          {message}
        </p>
      )}
    </div>
  );
}
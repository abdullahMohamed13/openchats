const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;

export interface AuthFieldSpec {
  name: string;
  label: string;
  email?: boolean;
  minLength?: number;
  minLengthMsg?: string;
}

/** Returns an error message for a field, or null when it's valid. */
export function validateAuthField(spec: AuthFieldSpec, value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return `Please enter your ${spec.label.toLowerCase()}.`;
  }

  if (spec.email && !EMAIL_RE.test(trimmed)) {
    return "Please enter a valid email address.";
  }

  if (spec.minLength && value.length < spec.minLength) {
    return spec.minLengthMsg ?? `${spec.label} must be at least ${spec.minLength} characters.`;
  }

  return null;
}

export interface AuthFormResult {
  errors: Record<string, string>;
  firstInvalid?: string;
}

/** Validates each field in order and tracks the first invalid one. */
export function validateAuthForm(
  specs: AuthFieldSpec[],
  values: Record<string, string>
): AuthFormResult {
  const errors: Record<string, string> = {};
  let firstInvalid: string | undefined;

  for (const spec of specs) {
    const message = validateAuthField(spec, values[spec.name] ?? "");
    if (message) {
      errors[spec.name] = message;
      firstInvalid ??= spec.name;
    }
  }

  return { errors, firstInvalid };
}

const AUTH_ERROR_MAP: Array<[RegExp, string]> = [
  [/Invalid email address/i, "Please enter a valid email address."],
  [/Too small.*expected string to have >=8 characters/i, "Password must be at least 8 characters."],
  [/Password.*too short/i, "Password must be at least 8 characters."],
  [/Too small.*expected string to have >=1 characters/i, "This field is required."],
  [/Invalid email or password/i, "Incorrect email or password."],
  [/Invalid username or password/i, "Incorrect username or password."],
  [/Email already exists/i, "An account with this email already exists."],
  [/User already exists/i, "An account with this email already exists."],
  [/username.*already.*taken/i, "This username is already taken."],
  [/INVALID_TOKEN|INVALID OR EXPIRED/i, "This reset link is invalid or has expired."],
  [/reset link is invalid/i, "This reset link is invalid or has expired."],
  [/expired.*reset|reset.*expired/i, "This reset link is invalid or has expired."],
];

/** Turns Better Auth errors into readable messages. */
export function friendlyAuthError(raw?: string | null): string | null {
  if (!raw) return null;
  for (const [pattern, friendly] of AUTH_ERROR_MAP) {
    if (pattern.test(raw)) return friendly;
  }
  return raw;
}
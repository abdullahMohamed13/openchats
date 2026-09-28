"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Loading, Google, Github, Home, Eye, EyeOff } from "pixelarticons/react";
import { handleSignIn } from "@/lib/sign-in";
import { handleUsernameSignIn } from "@/lib/sign-in.username";
import { handleSignup } from "@/lib/sign-up";
import { handleSocialLogin } from "@/lib/social";
import type { SocialProvider } from "@/types/auth";
import {
  PASSWORD_MIN_LENGTH,
  validateAuthField,
  validateAuthForm,
  type AuthFieldSpec,
} from "@/lib/auth-validation";
import "@/styles/auth.css";

export type AuthSwitchProps = {
  initialMode?: "sign-in" | "sign-up";
};

const SIGN_UP_SPECS: AuthFieldSpec[] = [
  { name: "firstname", label: "First name" },
  { name: "lastname", label: "Last name" },
  { name: "email", label: "Email", email: true },
  {
    name: "password",
    label: "Password",
    minLength: PASSWORD_MIN_LENGTH,
    minLengthMsg: "Password must be at least 8 characters.",
  },
];

const SIGN_IN_EMAIL_SPECS: AuthFieldSpec[] = [
  { name: "email", label: "Email", email: true },
  { name: "password", label: "Password" },
];

const SIGN_IN_USERNAME_SPECS: AuthFieldSpec[] = [
  { name: "username", label: "Username" },
  { name: "password", label: "Password" },
];

export default function AuthSwitch({ initialMode = "sign-in" }: AuthSwitchProps = {}) {
  const router = useRouter();
  const isSignUp = initialMode === "sign-up";
  const [loading, setLoading] = useState(false);
  const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(null);
  const [signInMode, setSignInMode] = useState<"email" | "username">("email");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const busy = loading || socialProvider !== null;

  const startSocialLogin = (provider: SocialProvider) => {
    if (busy) return;
    setSocialProvider(provider);
    handleSocialLogin({
      provider,
      callbackURL: "/dashboard",
      setLoading: (value) => {
        setLoading(value);
        if (!value) setSocialProvider(null);
      },
    });
  };

  const clearError = (name: string) => {
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validateFieldOnBlur = (spec: AuthFieldSpec, value: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (value.trim() === "") {
        // Leave required fields alone until the form is submitted.
        delete next[spec.name];
        return next;
      }
      const message = validateAuthField(spec, value);
      if (message) next[spec.name] = message;
      else delete next[spec.name];
      return next;
    });
  };

  // True when the form is valid.
  const validateForm = (specs: AuthFieldSpec[], form: HTMLFormElement): boolean => {
    const values: Record<string, string> = {};
    for (const spec of specs) {
      values[spec.name] = String(new FormData(form).get(spec.name) ?? "");
    }

    const { errors: nextErrors, firstInvalid } = validateAuthForm(specs, values);
    setErrors(nextErrors);

    if (firstInvalid) {
      const element = form.elements.namedItem(firstInvalid);
      (element instanceof HTMLElement ? element : null)?.focus();
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (isSignUp && !validateForm(SIGN_UP_SPECS, form)) return;

    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (isSignUp) {
      handleSignup({
        name: `${String(formData.get("firstname") ?? "")} ${String(formData.get("lastname") ?? "")}`.trim(),
        email,
        password,
        callbackURL: "/onboarding",
        setLoading,
      });
    } else {
      if (signInMode === "username") {
        if (!validateForm(SIGN_IN_USERNAME_SPECS, form)) return;
        handleUsernameSignIn({
          username: String(formData.get("username") ?? ""),
          password,
          callbackURL: "/dashboard",
          setLoading,
        });
      } else {
        if (!validateForm(SIGN_IN_EMAIL_SPECS, form)) return;
        handleSignIn({ email, password, callbackURL: "/dashboard", setLoading });
      }
    }
  };

  return (
    <div className="auth-switch">
      <Link href="/" className="auth-home-link">
        <Home width={16} height={16} aria-hidden />
        Home
      </Link>
      <div className={`container ${isSignUp ? "sign-up-mode" : ""}`}>
        <div className="forms-container">
          <div className="signin-signup">
            <form className="sign-in-form" onSubmit={handleSubmit} noValidate>
              <h2 className="title">Sign in</h2>

              <div className="auth-toggle">
                <button
                  type="button"
                  className={`auth-toggle-btn ${signInMode === "email" ? "active" : ""}`}
                  onClick={() => setSignInMode("email")}
                >
                  Email
                </button>
                <button
                  type="button"
                  className={`auth-toggle-btn ${signInMode === "username" ? "active" : ""}`}
                  onClick={() => setSignInMode("username")}
                >
                  Username
                </button>
              </div>

              {signInMode === "email" ? (
                <Field
                  id="auth-signin-email"
                  spec={SIGN_IN_EMAIL_SPECS[0]}
                  type="email"
                  icon={<Mail width={20} height={20} />}
                  placeholder="Email"
                  autoComplete="email"
                  errors={errors}
                  onBlur={validateFieldOnBlur}
                  onChange={clearError}
                />
              ) : (
                <Field
                  id="auth-signin-username"
                  spec={SIGN_IN_USERNAME_SPECS[0]}
                  type="text"
                  icon={<User width={20} height={20} />}
                  placeholder="Username"
                  autoComplete="username"
                  errors={errors}
                  onBlur={validateFieldOnBlur}
                  onChange={clearError}
                />
              )}
              <Field
                id="auth-signin-password"
                spec={SIGN_IN_EMAIL_SPECS[1]}
                type="password"
                icon={<Lock width={20} height={20} />}
                placeholder="Password"
                autoComplete={signInMode === "username" ? "current-password" : undefined}
                errors={errors}
                onBlur={validateFieldOnBlur}
                onChange={clearError}
              />
              {signInMode === "email" && (
                <Link href="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              )}
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {loading ? <Loading width={18} height={18} className="animate-spin" /> : "Sign in"}
              </button>
              <button
                type="button"
                className="guest-btn"
                onClick={() => router.push("/")}
              >
                Enter as a guest
              </button>
              <p className="social-text">Or sign in with social platforms</p>
              <div className="social-media">
                <SocialIcons
                  disabled={busy}
                  pendingProvider={socialProvider}
                  onSelect={startSocialLogin}
                />
              </div>
            </form>

            <form className="sign-up-form" onSubmit={handleSubmit} noValidate>
              <h2 className="title">Sign up</h2>
              <div className="input-row">
                <Field
                  id="auth-signup-firstname"
                  spec={SIGN_UP_SPECS[0]}
                  type="text"
                  icon={<User width={20} height={20} />}
                  placeholder="First name"
                  autoComplete="given-name"
                  errors={errors}
                  onBlur={validateFieldOnBlur}
                  onChange={clearError}
                />
                <Field
                  id="auth-signup-lastname"
                  spec={SIGN_UP_SPECS[1]}
                  type="text"
                  icon={<User width={20} height={20} />}
                  placeholder="Last name"
                  autoComplete="family-name"
                  errors={errors}
                  onBlur={validateFieldOnBlur}
                  onChange={clearError}
                />
              </div>
              <Field
                id="auth-signup-email"
                spec={SIGN_UP_SPECS[2]}
                type="email"
                icon={<Mail width={20} height={20} />}
                placeholder="Email"
                autoComplete="email"
                errors={errors}
                onBlur={validateFieldOnBlur}
                onChange={clearError}
              />
              <Field
                id="auth-signup-password"
                spec={SIGN_UP_SPECS[3]}
                type="password"
                icon={<Lock width={20} height={20} />}
                placeholder="Password"
                autoComplete="new-password"
                errors={errors}
                onBlur={validateFieldOnBlur}
                onChange={clearError}
              />
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {loading ? <Loading width={18} height={18} className="animate-spin" /> : "Create Account"}
              </button>
              <button
                type="button"
                className="guest-btn"
                onClick={() => router.push("/")}
              >
                Enter as a guest
              </button>
              <p className="social-text">Or sign up with social platforms</p>
              <div className="social-media">
                <SocialIcons
                  disabled={busy}
                  pendingProvider={socialProvider}
                  onSelect={startSocialLogin}
                />
              </div>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here?</h3>
              <button className="btn btn-outline" onClick={() => router.push("/signup")}>
                Create account
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <button className="btn btn-outline" onClick={() => router.push("/signin")}>
              	Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

function Field({ id, spec, type, icon, placeholder, autoComplete, errors, onBlur, onChange }: FieldProps) {
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

interface SocialIconsProps {
  disabled: boolean;
  pendingProvider: SocialProvider | null;
  onSelect: (provider: SocialProvider) => void;
}

function SocialIcons({ disabled, pendingProvider, onSelect }: SocialIconsProps) {
  return (
    <>
      <SocialButton
        provider="google"
        name="Google"
        icon={<Google width={20} height={20} />}
        disabled={disabled}
        pending={pendingProvider === "google"}
        onSelect={onSelect}
      />
      <SocialButton
        provider="github"
        name="GitHub"
        icon={<Github width={20} height={20} />}
        disabled={disabled}
        pending={pendingProvider === "github"}
        onSelect={onSelect}
      />
    </>
  );
}

interface SocialButtonProps {
  provider: SocialProvider;
  name: string;
  icon: React.ReactNode;
  disabled: boolean;
  pending: boolean;
  onSelect: (provider: SocialProvider) => void;
}

function SocialButton({ provider, name, icon, disabled, pending, onSelect }: SocialButtonProps) {
  return (
    <button
      type="button"
      className="social-icon"
      onClick={() => onSelect(provider)}
      disabled={disabled}
      aria-label={`Continue with ${name}`}
      aria-busy={pending || undefined}
    >
      {pending ? <Loading width={20} height={20} className="animate-spin" /> : icon}
      <span>{name}</span>
    </button>
  );
}
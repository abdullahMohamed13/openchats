"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Loading, Home } from "pixelarticons/react";
import { handleSignIn } from "@/lib/sign-in";
import { handleGuestSignIn } from "@/lib/guest";
import { handleUsernameSignIn } from "@/lib/sign-in.username";
import type { SocialProvider } from "@/types/social";
import { handleSignup } from "@/lib/sign-up";
import { handleSocialLogin } from "@/lib/social";
import {
  PASSWORD_MIN_LENGTH,
  validateAuthField,
  validateAuthForm,
  type AuthFieldSpec,
} from "@/lib/auth-validation";
import { SocialIcons } from "./SocialIcons";
import { Field } from "./Field";
import "@/styles/auth.css";

export type AuthSwitchProps = {
  initialMode?: "sign-in" | "sign-up";
  callbackURL?: string;
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

export default function AuthSwitch({ initialMode = "sign-in", callbackURL }: AuthSwitchProps = {}) {
  const router = useRouter();
  const isSignUp = initialMode === "sign-up";
  const resolvedCallbackURL = callbackURL ?? "/chat";
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(null);
  const [signInMode, setSignInMode] = useState<"email" | "username">("email");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const busy = loading || guestLoading || socialProvider !== null;

  const startSocialLogin = (provider: SocialProvider) => {
    if (busy) return;
    setSocialProvider(provider);
    handleSocialLogin({
      provider,
      callbackURL: resolvedCallbackURL,
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
          callbackURL: resolvedCallbackURL,
          setLoading,
        });
      } else {
        if (!validateForm(SIGN_IN_EMAIL_SPECS, form)) return;
        handleSignIn({ email, password, callbackURL: resolvedCallbackURL, setLoading });
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
                disabled={busy}
                onClick={() => void handleGuestSignIn({ setLoading: setGuestLoading })}
              >
                {guestLoading ? "Starting…" : "Enter as a guest"}
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
                disabled={busy}
                onClick={() => void handleGuestSignIn({ setLoading: setGuestLoading })}
              >
                {guestLoading ? "Starting…" : "Enter as a guest"}
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

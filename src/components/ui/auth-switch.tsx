"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Loading, Google, Github } from "pixelarticons/react";
import { handleSignIn } from "@/lib/sign-in";
import { handleUsernameSignIn } from "@/lib/sign-in.username";
import { handleSignup } from "@/lib/sign-up";
import { handleSocialLogin } from "@/lib/social";
import "@/styles/auth.css";

export type AuthSwitchProps = {
  initialMode?: "sign-in" | "sign-up";
};

export default function AuthSwitch({ initialMode = "sign-in" }: AuthSwitchProps = {}) {
  const router = useRouter();
  const isSignUp = initialMode === "sign-up";
  const [loading, setLoading] = useState(false);
  const [signInMode, setSignInMode] = useState<"email" | "username">("email");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
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
    } else if (signInMode === "username") {
      const username = String(formData.get("username") ?? "");
      handleUsernameSignIn({ username, password, callbackURL: "/dashboard", setLoading });
    } else {
      handleSignIn({ email, password, callbackURL: "/dashboard", setLoading });
    }
  };

  return (
    <div className="auth-switch">
      <div className={`container ${isSignUp ? "sign-up-mode" : ""}`}>
        <div className="forms-container">
          <div className="signin-signup">
            <form className="sign-in-form" onSubmit={handleSubmit}>
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
                <div className="input-field">
                  <i><Mail width={20} height={20} /></i>
                  <input type="email" name="email" placeholder="Email" />
                </div>
              ) : (
                <div className="input-field">
                  <i><User width={20} height={20} /></i>
                  <input type="text" name="username" placeholder="Username" autoComplete="username" />
                </div>
              )}
              <div className="input-field">
                <i><Lock width={20} height={20} /></i>
                <input type="password" name="password" placeholder="Password" autoComplete={signInMode === "username" ? "current-password" : undefined} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
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
                <SocialIcons />
              </div>
            </form>

            <form className="sign-up-form" onSubmit={handleSubmit}>
              <h2 className="title">Sign up</h2>
              <div className="input-row">
                <div className="input-field">
                  <i><User width={20} height={20} /></i>
                  <input type="text" name="firstname" placeholder="First name" />
                </div>
                <div className="input-field">
                  <i><User width={20} height={20} /></i>
                  <input type="text" name="lastname" placeholder="Last name" />
                </div>
              </div>
              <div className="input-field">
                <i><Mail width={20} height={20} /></i>
                <input type="email" name="email" placeholder="Email" />
              </div>
              <div className="input-field">
                <i><Lock width={20} height={20} /></i>
                <input type="password" name="password" placeholder="Password" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
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
                <SocialIcons />
              </div>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here?</h3>
              <p>Your team deserves one place to actually talk. No dead Slack channels, abandoned Notion docs, or mystery group chats.</p>
              <button className="btn btn-outline" onClick={() => router.push("/signup")}>
                Create account
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>Your workspace missed you. The channels are still chaotic but at least now you can do something about it.</p>
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

function SocialIcons() {
  return (
    <>
      <a
        className="social-icon"
        onClick={(e) => {
          e.preventDefault();
          handleSocialLogin({ provider: "google", callbackURL: "/dashboard" });
        }}
        aria-label="Continue with Google"
      >
        <Google width={20} height={20} />
        <span>Google</span>
      </a>
      <a
        className="social-icon"
        onClick={(e) => {
          e.preventDefault();
          handleSocialLogin({ provider: "github", callbackURL: "/dashboard" });
        }}
        aria-label="Continue with GitHub"
      >
        <Github width={20} height={20} />
        <span>GitHub</span>
      </a>
    </>
  );
}

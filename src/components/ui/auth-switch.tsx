"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User } from "pixelarticons/react";
import { handleSignIn } from "@/lib/sign-in";
import { handleSignup } from "@/lib/sign-up";
import { handleSocialLogin } from "@/lib/social";
import { Google, Github } from "pixelarticons/react";

export type AuthSwitchProps = {
  initialMode?: "sign-in" | "sign-up";
};

export default function AuthSwitch({ initialMode = "sign-in" }: AuthSwitchProps = {}) {
  const router = useRouter();
  const isSignUp = initialMode === "sign-up";

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
      });
    } else {
      handleSignIn({ email, password, callbackURL: "/onboarding" });
    }
  };

  return (
    <div className="auth-switch">
      <style>{authSwitchStyles}</style>

      <div className={`container ${isSignUp ? "sign-up-mode" : ""}`}>
        <div className="forms-container">
          <div className="signin-signup">
            <form className="sign-in-form" onSubmit={handleSubmit}>
              <h2 className="title">Sign in</h2>
              <div className="input-field">
                <i><Mail width={20} height={20} /></i>
                <input type="email" name="email" placeholder="Email" />
              </div>
              <div className="input-field">
                <i><Lock width={20} height={20} /></i>
                <input type="password" name="password" placeholder="Password" />
              </div>
              <button type="submit" className="btn btn-primary">Sign in</button>
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
              <button type="submit" className="btn btn-primary">Create Account</button>
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
        href="#"
        className="social-icon"
        onClick={(e) => {
          e.preventDefault();
          handleSocialLogin({ provider: "google", callbackURL: "/onboarding" });
        }}
        aria-label="Continue with Google"
      >
        <Google width={20} height={20} />
        <span>Google</span>
      </a>
      <a
        href="#"
        className="social-icon"
        onClick={(e) => {
          e.preventDefault();
          handleSocialLogin({ provider: "github", callbackURL: "/onboarding" });
        }}
        aria-label="Continue with GitHub"
      >
        <Github width={20} height={20} />
        <span>GitHub</span>
      </a>
    </>
  );
}

const authSwitchStyles = `
.auth-switch {
  width: 100%;
  max-width: 900px;
  display: flex;
  justify-content: center;
}

.auth-switch .container {
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 550px;
  color: var(--foreground);
  border: 2px solid var(--foreground);
  border-radius: 5px;
  box-shadow: 4px 4px 0px 0px var(--border);
  overflow: hidden;
}

.auth-switch .forms-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.auth-switch .signin-signup {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  left: 75%;
  width: 50%;
  transition: 1s 0.7s ease-in-out;
  display: grid;
  grid-template-columns: 1fr;
  z-index: 5;
}

.auth-switch form {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 3.5rem;
  transition: all 0.2s 0.7s;
  overflow: hidden;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
}

.auth-switch form.sign-up-form {
  opacity: 0;
  z-index: 1;
}

.auth-switch form.sign-in-form {
  z-index: 2;
}

.auth-switch .title {
  font-family: var(--font-press-start);
  font-size: 1.1rem;
  color: var(--foreground);
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.auth-switch .input-row {
  max-width: 380px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.auth-switch .input-field {
  max-width: 380px;
  width: 100%;
  background-color: var(--muted);
  margin: 10px 0;
  height: 50px;
  border: 2px solid var(--foreground);
  display: grid;
  grid-template-columns: 40px 1fr;
  padding: 0 0.4rem;
  position: relative;
  transition: 0.2s;
}

.auth-switch .input-field:focus-within {
  box-shadow: 3px 3px 0px 0px var(--accent);
  border-color: var(--accent);
}

.auth-switch .input-field i {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-foreground);
  transition: 0.3s;
}

.auth-switch .input-field:focus-within i {
  color: var(--accent);
}

.auth-switch .input-field input {
  background: none;
  outline: none;
  border: none;
  line-height: 1;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--foreground);
  width: 100%;
}

.auth-switch .input-field input::placeholder {
  color: var(--muted-foreground);
  font-weight: 400;
}

.auth-switch .btn {
  border: 2px solid var(--foreground);
  outline: none;
  height: 46px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: 0.2s;
  padding: 0 2rem;
}

.auth-switch .btn-primary {
  background-color: var(--primary);
  color: var(--foreground);
  margin: 14px 0;
  box-shadow: 4px 4px 0px 0px var(--foreground);
}

.auth-switch .btn-primary:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px 0px var(--foreground);
}

.auth-switch .btn-primary:active {
  transform: translate(4px, 4px);
  box-shadow: none;
}

.auth-switch .panels-container {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.auth-switch .panel {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-around;
  text-align: center;
  z-index: 6;
}

.auth-switch .left-panel {
  pointer-events: all;
  padding: 3rem 17% 2rem 12%;
}

.auth-switch .right-panel {
  pointer-events: none;
  padding: 3rem 12% 2rem 17%;
}

.auth-switch .panel .content {
  color: var(--foreground);
  transition: transform 0.9s ease-in-out;
  transition-delay: 0.6s;
}

.auth-switch .panel h3 {
  font-family: var(--font-press-start);
  font-weight: 600;
  line-height: 1.3;
  font-size: 0.95rem;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.auth-switch .panel p {
  font-size: 0.9rem;
  padding: 0.7rem 0;
}

.auth-switch .btn-outline {
  background: transparent;
  color: var(--foreground);
  box-shadow: 4px 4px 0px 0px rgba(255, 255, 255, 0.3);
}

.auth-switch .btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px 0px rgba(255, 255, 255, 0.3);
}

.auth-switch .btn-outline:active {
  transform: translate(4px, 4px);
  box-shadow: none;
}

.auth-switch .right-panel .content {
  transform: translateX(800px);
}

.auth-switch .container.sign-up-mode:before {
  transform: translate(100%, -50%);
  right: 52%;
}

.auth-switch .container.sign-up-mode .left-panel .content {
  transform: translateX(-800px);
}

.auth-switch .container.sign-up-mode .signin-signup {
  left: 25%;
}

.auth-switch .container.sign-up-mode form.sign-up-form {
  opacity: 1;
  z-index: 2;
}

.auth-switch .container.sign-up-mode form.sign-in-form {
  opacity: 0;
  z-index: 1;
}

.auth-switch .container.sign-up-mode .right-panel .content {
  transform: translateX(0%);
}

.auth-switch .container.sign-up-mode .left-panel {
  pointer-events: none;
}

.auth-switch .container.sign-up-mode .right-panel {
  pointer-events: all;
}

.auth-switch .container:before {
  content: "";
  position: absolute;
  height: 2000px;
  width: 2000px;
  top: -10%;
  right: 48%;
  transform: translateY(-50%);
  background: var(--primary);
  transition: 1.8s ease-in-out;
  border-radius: 50%;
  z-index: 1;
}

.auth-switch .social-text {
  padding: 0.7rem 0;
  font-size: 0.85rem;
  color: var(--muted-foreground);
}

.auth-switch .social-media {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.auth-switch .social-icon {
  height: auto;
  width: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 2px solid var(--foreground);
  border-radius: 5px;
  color: var(--foreground);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 10px 16px;
  transition: 0.2s;
  cursor: pointer;
}

.auth-switch .social-icon:hover {
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0px 0px var(--border);
}

.auth-switch .social-icon:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.auth-switch .social-icon svg {
  transition: 0.3s;
}

.auth-switch .guest-btn {
  margin-top: 10px;
  width: 100%;
  max-width: 380px;
  background: none;
  border: none;
  text-align: center;
  font-size: 0.8rem;
  color: var(--muted-foreground);
  text-decoration: underline;
  cursor: pointer;
  transition: 0.2s;
}

.auth-switch .guest-btn:hover {
  color: var(--foreground);
}

@media (max-width: 870px) {
  .auth-switch .container {
    min-height: 800px;
    height: 100vh;
  }
  .auth-switch .signin-signup {
    width: 100%;
    top: 95%;
    transform: translate(-50%, -100%);
    transition: 1s 0.8s ease-in-out;
  }
  .auth-switch .signin-signup,
  .auth-switch .container.sign-up-mode .signin-signup {
    left: 50%;
  }
  .auth-switch .panels-container {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 2fr 1fr;
  }
  .auth-switch .panel {
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding: 2.5rem 8%;
    grid-column: 1 / 2;
  }
  .auth-switch .right-panel {
    grid-row: 3 / 4;
  }
  .auth-switch .left-panel {
    grid-row: 1 / 2;
  }
  .auth-switch .panel .content {
    padding-right: 15%;
    transition: transform 0.9s ease-in-out;
    transition-delay: 0.8s;
  }
  .auth-switch .panel h3 {
    font-size: 0.75rem;
  }
  .auth-switch .panel p {
    font-size: 0.7rem;
    padding: 0.5rem 0;
  }
  .auth-switch .btn-outline {
    width: 110px;
    height: 38px;
    font-size: 0.7rem;
  }
  .auth-switch .container:before {
    width: 1500px;
    height: 1500px;
    transform: translateX(-50%);
    left: 30%;
    bottom: 68%;
    right: initial;
    top: initial;
    transition: 2s ease-in-out;
  }
  .auth-switch .container.sign-up-mode:before {
    transform: translate(-50%, 100%);
    bottom: 32%;
    right: initial;
  }
  .auth-switch .container.sign-up-mode .left-panel .content {
    transform: translateY(-300px);
  }
  .auth-switch .container.sign-up-mode .right-panel .content {
    transform: translateY(0px);
  }
  .auth-switch .right-panel .content {
    transform: translateY(300px);
  }
  .auth-switch .container.sign-up-mode .signin-signup {
    top: 5%;
    transform: translate(-50%, 0);
  }
}

@media (max-width: 570px) {
  .auth-switch form {
    padding: 0 1.5rem;
  }
  .auth-switch .panel .content {
    padding: 0.5rem 1rem;
  }
  .auth-switch .title {
    font-size: 0.85rem;
  }
}
`;

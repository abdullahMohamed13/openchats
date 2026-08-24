"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User } from "lucide-react";
import { handleSignIn } from "@/lib/sign-in";
import { handleSignup } from "@/lib/sign-up";
import { handleSocialLogin } from "@/lib/social";

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
        name: String(formData.get("name") ?? ""),
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
                <i><Mail size={18} /></i>
                <input type="email" name="email" placeholder="Email" />
              </div>
              <div className="input-field">
                <i><Lock size={18} /></i>
                <input type="password" name="password" placeholder="Password" />
              </div>
              <input type="submit" value="Login" className="btn solid" />
              <p className="social-text">Or sign in with social platforms</p>
              <div className="social-media">
                <SocialIcons />
              </div>
            </form>

            <form className="sign-up-form" onSubmit={handleSubmit}>
              <h2 className="title">Sign up</h2>
              <div className="input-field">
                <i><User size={18} /></i>
                <input type="text" name="name" placeholder="Username" />
              </div>
              <div className="input-field">
                <i><Mail size={18} /></i>
                <input type="email" name="email" placeholder="Email" />
              </div>
              <div className="input-field">
                <i><Lock size={18} /></i>
                <input type="password" name="password" placeholder="Password" />
              </div>
              <input type="submit" value="Sign up" className="btn" />
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
              <p>Join us today and discover a world of possibilities. Create your account in seconds!</p>
              <button className="btn transparent" onClick={() => router.push("/signup")}>
                Sign up
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>Welcome back! Sign in to continue your journey with us.</p>
              <button className="btn transparent" onClick={() => router.push("/login")}>
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
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
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
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.26 5.66.41.35.78 1.05.78 2.12v3.14c0 .3.21.66.8.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
        </svg>
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
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.35);
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
  padding: 0 5rem;
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
  font-size: 2.2rem;
  color: var(--foreground);
  margin-bottom: 10px;
  font-weight: 700;
}

.auth-switch .input-field {
  max-width: 380px;
  width: 100%;
  background-color: var(--muted);
  margin: 10px 0;
  height: 55px;
  border-radius: 55px;
  display: grid;
  grid-template-columns: 15% 85%;
  padding: 0 0.4rem;
  position: relative;
  transition: 0.3s;
}

.auth-switch .input-field:focus-within {
  background-color: var(--muted);
  box-shadow: 0 0 0 2px var(--accent);
}

.auth-switch .input-field i {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-foreground);
  transition: 0.5s;
}

.auth-switch .input-field input {
  background: none;
  outline: none;
  border: none;
  line-height: 1;
  font-weight: 500;
  font-size: 1rem;
  color: var(--foreground);
  width: 100%;
}

.auth-switch .input-field input::placeholder {
  color: var(--muted-foreground);
  font-weight: 400;
}

.auth-switch .btn {
  width: 150px;
  background-color: var(--accent);
  border: none;
  outline: none;
  height: 49px;
  border-radius: 49px;
  color: var(--accent-foreground);
  text-transform: uppercase;
  font-weight: 600;
  margin: 10px 0;
  cursor: pointer;
  transition: 0.5s;
  font-size: 0.9rem;
}

.auth-switch .btn:hover {
  background-color: color-mix(in srgb, var(--accent) 85%, black);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
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
  color: #fff;
  transition: transform 0.9s ease-in-out;
  transition-delay: 0.6s;
}

.auth-switch .panel h3 {
  font-weight: 600;
  line-height: 1;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.auth-switch .panel p {
  font-size: 0.95rem;
  padding: 0.7rem 0;
}

.auth-switch .btn.transparent {
  margin: 0;
  background: none;
  border: 2px solid #fff;
  width: 130px;
  height: 41px;
  font-weight: 600;
  font-size: 0.8rem;
}

.auth-switch .btn.transparent:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
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
  background: linear-gradient(-45deg, var(--accent) 0%, #4338ca 100%);
  transition: 1.8s ease-in-out;
  border-radius: 50%;
  z-index: 1;
}

.auth-switch .social-text {
  padding: 0.7rem 0;
  font-size: 1rem;
  color: var(--muted-foreground);
}

.auth-switch .social-media {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.auth-switch .social-icon {
  height: 46px;
  width: 46px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--accent);
  font-size: 1.2rem;
  transition: 0.3s;
  cursor: pointer;
}

.auth-switch .social-icon:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.auth-switch .social-icon svg {
  transition: 0.3s;
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
    font-size: 1.2rem;
  }
  .auth-switch .panel p {
    font-size: 0.7rem;
    padding: 0.5rem 0;
  }
  .auth-switch .btn.transparent {
    width: 110px;
    height: 35px;
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
}
`;

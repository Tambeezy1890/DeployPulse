import { Eye, EyeOff, KeyRound, UserPlus } from "lucide-react";
import { useState } from "react";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-8 shadow-xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center mb-4">
            <UserPlus size={22} className="text-indigo-400" />
          </div>

          <h1 className="text-2xl font-semibold">Create an account</h1>

          <p className="text-sm text-slate-400 mt-1">
            Sign up to start using Deploy Pulse
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-slate-300"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="John Doe"
              className="w-full py-3 px-4 rounded-lg bg-slate-900 border border-slate-700
              text-white placeholder:text-slate-500
              outline-none
              focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
              transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="exampleuser@gmail.com"
              className="w-full py-3 px-4 rounded-lg bg-slate-900 border border-slate-700
              text-white placeholder:text-slate-500
              outline-none
              focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
              transition"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-300"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                className="w-full py-3 pl-4 pr-12 rounded-lg bg-slate-900 border border-slate-700
                text-white placeholder:text-slate-500
                outline-none
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-300"
            >
              Confirm password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Enter your password again"
                className="w-full py-3 pl-4 pr-12 rounded-lg bg-slate-900 border border-slate-700
                text-white placeholder:text-slate-500
                outline-none
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                transition"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                text-slate-400 hover:text-white transition"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-indigo-600
            hover:bg-indigo-500 font-medium transition
            flex items-center justify-center gap-2"
          >
            <KeyRound size={18} />
            Create account
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-400 hover:text-indigo-300">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;

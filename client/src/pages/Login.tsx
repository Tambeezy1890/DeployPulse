import { ArrowRight, Eye, EyeOff, Key } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuth();

  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await login(data.email, data.password);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-8 shadow-xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center mb-4">
            <Key size={22} className="text-indigo-400" />
          </div>

          <h1 className="text-2xl font-semibold">Welcome back</h1>

          <p className="text-sm text-slate-400 mt-1">
            Login to access your Deploy Pulse dashboard
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleLogin}>
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
              value={data.email}
              onChange={handleChange}
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
                value={data.password}
                onChange={handleChange}
                placeholder="Enter your password"
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

          {/* Extra controls */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-400">
              <input type="checkbox" className="accent-indigo-500" />
              Remember me
            </label>

            <button
              type="button"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-indigo-600
            hover:bg-indigo-500
            font-medium transition"
          >
            Login
          </button>
        </form>
        <Link
          to="/signup"
          className="text-sm mt-4 text-center text-slate-500 group"
        >
          <div className="mx-auto mt-2">
            Not Registered?{" "}
            <span className="inline-flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-2 group-hover:text-indigo-600">
              Register
              <ArrowRight size={18} strokeWidth={1.2} />
            </span>
          </div>
        </Link>
        <p className="text-center text-sm text-slate-500 mt-6">Deploy Pulse</p>
      </div>
    </div>
  );
}

export default Login;

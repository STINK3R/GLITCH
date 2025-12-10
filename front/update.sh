set -e
# Header backup and update
cp src/components/layouts/Header/Header.jsx src/components/layouts/Header/Header.jsx.bak
cat > src/components/layouts/Header/Header.jsx <<'EOF'
import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../../../features/auth/AuthStore";
import { useAuth } from "../../../features/auth/useAuth";

export default function Header() {
  const token = useAuthStore((s) => s.token);
  const { logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight text-neutral-900">
            Hack
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-2 py-1 rounded hover:bg-neutral-100 ${
                  isActive ? "text-blue-600" : "text-neutral-700"
                }`
              }
            >
              Home
            </NavLink>
            {!token ? (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-2 py-1 rounded hover:bg-neutral-100 ${
                      isActive ? "text-blue-600" : "text-neutral-700"
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `px-2 py-1 rounded hover:bg-neutral-100 ${
                      isActive ? "text-blue-600" : "text-neutral-700"
                    }`
                  }
                >
                  Register
                </NavLink>
              </>
            ) : (
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-md bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
EOF

# Login backup and update
cp src/features/auth/Login/Login.jsx src/features/auth/Login/Login.jsx.bak
cat > src/features/auth/Login/Login.jsx <<'EOF'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await login(email, password);
      navigate("/");
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold">Login</h1>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="space-y-1.5">
          <label className="block text-sm">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        <button
          disabled={loading}
          type="submit"
          className="w-full rounded-md bg-blue-600 text-white py-2 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
};
EOF

# Registration backup and update
cp src/features/auth/Registration/Registration.jsx src/features/auth/Registration/Registration.jsx.bak
cat > src/features/auth/Registration/Registration.jsx <<'EOF'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await register(email, password);
      navigate("/login");
    } catch (e) {
      setErr(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold">Register</h1>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="space-y-1.5">
          <label className="block text-sm">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        <button
          disabled={loading}
          type="submit"
          className="w-full rounded-md bg-blue-600 text-white py-2 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>
    </div>
  );
};
EOF

# http service backup and update
cp src/services/http.js src/services/http.js.bak
cat > src/services/http.js <<'EOF'
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function http(path, options = {}) {
  const token = localStorage.getItem("token");

  const baseHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const mergedHeaders = {
    ...baseHeaders,
    ...(options.headers || {}),
  };

  const res = await fetch(API_URL + path, {
    credentials: "include",
    ...options,
    headers: mergedHeaders,
  });

  const contentType = res.headers.get("content-type") || "";
  let payload = null;
  if (contentType.includes("application/json")) {
    try {
      payload = await res.json();
    } catch (_) {
      payload = null;
    }
  } else {
    try {
      payload = await res.text();
    } catch (_) {
      payload = null;
    }
  }

  if (!res.ok) {
    const message =
      (payload && (payload.message || payload.error)) ||
      (typeof payload === "string" ? payload : "") ||
      `HTTP error! Status: ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return payload;
}
EOF

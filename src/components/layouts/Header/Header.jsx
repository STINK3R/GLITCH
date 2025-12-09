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
            Logo
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

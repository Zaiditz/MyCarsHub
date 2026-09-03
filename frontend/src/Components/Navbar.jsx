import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { getMe, logoutUser } from "../api/api";

const links = [
  ["/", "Home"],
  ["/cars", "Cars"],
  ["/compare", "Compare"],
  ["/saved", "Saved Cars"],
];

export default function Navbar() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(JSON.parse(localStorage.getItem("user") || "null"));
    window.addEventListener("storage", syncUser);
    window.addEventListener("authchange", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("authchange", syncUser);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    getMe().then((response) => {
      const fresh = response.data.user;
      const compact = {
        id: fresh._id,
        name: fresh.name,
        role: fresh.role,
        subscriptionPlan: fresh.subscriptionPlan,
        subscriptionStatus: fresh.subscriptionStatus,
        verificationStatus: fresh.verificationStatus,
      };
      localStorage.setItem("user", JSON.stringify(compact));
      setUser(compact);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    function handleOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  async function handleLogout() {
    try { await logoutUser(); } catch {}
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authchange"));
    setUser(null);
    setOpen(false);
    navigate("/");
  }

  const navClass = ({ isActive }) => `whitespace-nowrap px-2 py-2 text-sm font-medium transition-colors ${isActive ? "text-black" : "text-gray-500 hover:text-black"}`;

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex min-h-[72px] max-w-[1280px] items-center justify-between gap-6 px-5 lg:px-8">
        <Link to="/" className="shrink-0 text-[22px] font-extrabold tracking-[-0.035em]">MyCarsHub</Link>

        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 md:flex sm:gap-2">
            {links.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} className={navClass}>{label}</NavLink>)}
            {user && <>
              <NavLink to="/messages" className={navClass}>Messages</NavLink>
              <NavLink to="/sell" className={navClass}>Sell Car</NavLink>
              <NavLink to="/my-listings" className={navClass}>My Listings</NavLink>
            </>}
          </div>

          {!user ? <div className="flex items-center gap-2"><NavLink to="/login" className={navClass}>Login</NavLink><Link to="/signup" className="primary-button px-4 py-2 text-sm">Sign Up</Link></div> : (
            <div ref={menuRef} className="relative ml-2 border-l border-gray-200 pl-3">
              <button onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-gray-50">
                <span className="max-w-[120px] truncate">{user.name}</span><span className="text-xs text-gray-400">{open ? "▴" : "▾"}</span>
              </button>
              {open && <div className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                <div className="border-b border-gray-100 px-3 py-2"><p className="font-semibold">{user.name}</p><p className="mt-1 text-xs text-gray-500">{user.verificationStatus === "verified" ? "Verified seller" : user.subscriptionPlan === "pro" ? "Pro seller" : "Member"}</p></div>
                <Link onClick={() => setOpen(false)} to="/seller-dashboard" className="dropdown-link">Seller Dashboard</Link>
                {user.role === "admin" && <Link onClick={() => setOpen(false)} to="/admin" className="dropdown-link">Admin Dashboard</Link>}
                <button onClick={handleLogout} className="dropdown-link w-full text-left text-red-600 hover:bg-red-50">Logout</button>
              </div>}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

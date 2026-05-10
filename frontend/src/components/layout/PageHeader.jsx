import { useNavigate } from "react-router-dom";

export default function PageHeader({
  title,
  subtitle,
  action,
  logo,
  avatar, // 👈 add this
  className = "",
}) {
  const navigate = useNavigate();

  return (
    <div className={`px-5 pt-6 pb-4 ${className}`}>
      <div className="flex items-center justify-between">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">
          {logo && (
            <img
              src={logo}
              alt="logo"
              className="w-10 h-10 object-contain"
            />
          )}

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* CUSTOM ACTION (optional) */}
          {action}

          {/* AVATAR */}
          {avatar ? (
  <img
    src={avatar}
    className="w-10 h-10 rounded-full object-cover border"
  />
) : (
  <div
    onClick={() => navigate("/profile")}
    className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold cursor-pointer"
  >
    R
  </div>
)}

        </div>

      </div>
    </div>
  );
}
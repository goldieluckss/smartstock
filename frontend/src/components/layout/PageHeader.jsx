import { useNavigate } from "react-router-dom";

export default function PageHeader({
  title,
  subtitle,
  action,
  logo,
  avatar,
  className = "",
}) {
  const navigate = useNavigate();

  return (
    <div className={`px-5 pt-12 pb-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">
          {logo && (
            <img
              src={logo}
              alt={`${title} logo`}
              className="h-10 w-10 object-contain"
              onError={(e) => {
                console.error("Logo failed to load:", e.currentTarget.src);
              }}
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
          {action}

          {avatar ? (
            <img
              src={avatar}
              alt="User avatar"
              className="h-10 w-10 rounded-full border object-cover"
            />
          ) : (
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-600 font-bold text-white"
            >
              R
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
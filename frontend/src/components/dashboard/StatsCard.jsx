export default function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  color = "primary",
}) {
  const colorMap = {
    primary: {
      main: "#16a34a",
      border: "border-green-300",
      bg: "bg-green-50",
      text: "text-green-600",
    },
    accent: {
      main: "#f59e0b",
      border: "border-yellow-300",
      bg: "bg-yellow-50",
      text: "text-yellow-600",
    },
    destructive: {
      main: "#ef4444",
      border: "border-red-300",
      bg: "bg-red-50",
      text: "text-red-600",
    },
    blue: {
      main: "#2563eb",
      border: "border-blue-300",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div className={`bg-white rounded-xl p-4 border shadow-sm ${c.border}`}>
      <div className="flex items-start justify-between">

        {/* ICON */}
        <div className={`p-2 rounded-xl ${c.bg} ${c.text}`}>
          <Icon className="h-4 w-4" />
        </div>

        {/* TREND */}
        {trend !== undefined && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend > 0
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
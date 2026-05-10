import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const GRADIENTS = [
  ["#34d399", "#059669"], // green
  ["#fbbf24", "#d97706"], // yellow
  ["#60a5fa", "#2563eb"], // blue
  ["#a78bfa", "#7c3aed"], // purple
  ["#f87171", "#dc2626"], // red
  ["#fb7185", "#be123c"], // pink
];

export default function CategoryChart({ products = [] }) {
  const categoryData = products.reduce((acc, p) => {
    const cat = p.category || "Other";
    acc[cat] = (acc[cat] || 0) + (p.quantity || 0);
    return acc;
  }, {});

  const data = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6 text-center">
        <p className="text-sm text-gray-500">No inventory data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="text-sm text-black font-semibold mb-3">Inventory by Category</h3>

      <div className="flex items-center gap-4">
        <div className="w-28 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
  {GRADIENTS.map((g, i) => (
    <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor={g[0]} />
      <stop offset="100%" stopColor={g[1]} />
    </linearGradient>
  ))}
</defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={50}
                dataKey="value"
              >
                {data.map((_, i) => (
  <Cell key={i} fill={`url(#grad${i % GRADIENTS.length})`} />
))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-1.5">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
  background: `linear-gradient(to right, ${
    GRADIENTS[i % GRADIENTS.length][0]
  }, ${GRADIENTS[i % GRADIENTS.length][1]})`
}}
              />
              <span className="text-xs text-gray-500 flex-1 truncate">
                {item.name}
              </span>
              <span className="text-xs text-gray-500 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
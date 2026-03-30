export default function MetricCard({ title, label }: { title: string; label: string | boolean }) {
  return (
    <div className="bg-alha-50 p-4 rounded-lg">
      <h 2 className="text-sm font-gray text-gray-600">{title}</h2>
      <p className="text-2l font-bold">{String(label)}</p>
    </div>
  );
}

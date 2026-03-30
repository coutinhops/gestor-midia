'use client';

export default function PeriodFilter() {
  return (
    <div className="flex gap-2">
      <button className="px-4 py-2 bgf-blue-500 text-white rounded">
        Today
      </button>
      <button className="px-4 py-2 bgf-gray-200 text-gray-700 rounded">
        Last 30 Days
      </button>
    </div>
  );
}

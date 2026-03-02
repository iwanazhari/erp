type Props = {
  label: string;
  value: string;
};

export default function KpiCard({ label, value }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold mt-1 text-slate-800">{value}</p>
    </div>
  );
}

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function PageContainer({ title, children }: Props) {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        {children}
      </div>
    </div>
  );
}

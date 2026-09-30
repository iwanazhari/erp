export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4"
      style={{
        background: '#FAFAFA',
      }}
    >
      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 gradient-bg" />

      {children}
    </div>
  );
}

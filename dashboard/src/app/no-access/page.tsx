export default function NoAccessPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-10 max-w-sm w-full text-center border border-gray-800">
        <div className="text-5xl mb-5">🔒</div>
        <h1 className="text-2xl font-bold text-white mb-3">Access Required</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          You need a personal access link to use this platform.
        </p>
        <p className="text-gray-500 text-xs mt-6">
          Contact your administrator to receive your unique access link.
        </p>
      </div>
    </div>
  );
}

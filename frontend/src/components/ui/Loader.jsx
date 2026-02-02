const Loader = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#29C762] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#818897]">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;

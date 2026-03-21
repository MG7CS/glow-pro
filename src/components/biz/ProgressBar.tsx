const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="h-1 w-full bg-[rgba(0,0,0,0.06)]">
      <div
        className="h-full bg-[#E11D48] transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export default ProgressBar;

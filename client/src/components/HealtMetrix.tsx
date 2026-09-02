type HealthMetricProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function HealthMetric({
  label,
  value,
  valueClassName = "text-white",
}: HealthMetricProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className={`mt-2 text-xl font-semibold ${valueClassName}`}>{value}</p>
    </article>
  );
}
export default HealthMetric;

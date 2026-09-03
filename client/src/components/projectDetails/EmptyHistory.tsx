import { Search } from "lucide-react";

type EmptyHistoryProps = {
  title: string;
  message: string;
  onClear?: () => void;
};

function EmptyHistory({ title, message, onClear }: EmptyHistoryProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
      <Search size={25} className="mx-auto text-slate-600" />

      <h3 className="mt-3 font-medium">{title}</h3>

      <p className="mt-1 text-sm text-slate-500">{message}</p>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 text-sm font-medium text-indigo-400 hover:text-indigo-300"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default EmptyHistory;

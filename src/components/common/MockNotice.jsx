import { FlaskConical } from "lucide-react";

export default function MockNotice({ text = "This is a UI prototype. Availability and reservation data shown here is for demonstration only and is not saved to a real system." }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-accent-500/25 bg-accent-500/8 px-4 py-3">
      <FlaskConical size={16} className="mt-0.5 shrink-0 text-slate-600" strokeWidth={2} />
      <p className="text-[12.5px] leading-snug text-slate-600">{text}</p>
    </div>
  );
}

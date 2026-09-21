import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MockNotice({ text = "This is a UI prototype. Availability and reservation data shown here is for demonstration only and is not saved to a real system." }) {
  return (
    <Alert className="border-0 bg-tint-soft">
      <Info className="text-primary-soft" />
      <AlertDescription className="text-sm">{text}</AlertDescription>
    </Alert>
  );
}

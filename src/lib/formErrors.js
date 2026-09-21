import { ApiError } from "./api";

export const errorMessage = (err) =>
  err instanceof ApiError ? err.message : "Something went wrong. Please try again.";

// Puts server-side validation problems on the matching form fields.
// Handles VALIDATION_ERROR ({ details: [{ field, message }] }) and conflicts like EMAIL_TAKEN ({ details: { field } }).
// Returns true when at least one field was marked, so callers can skip a generic toast.
export function applyApiErrors(err, setError, fields) {
  if (!(err instanceof ApiError)) return false;
  const issues = Array.isArray(err.details)
    ? err.details
    : err.details?.field
      ? [{ field: err.details.field, message: err.message }]
      : [];

  let handled = false;
  for (const { field, message } of issues) {
    if (field && fields.includes(field)) {
      setError(field, { type: "server", message });
      handled = true;
    }
  }
  return handled;
}

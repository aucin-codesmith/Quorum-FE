import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SimpleSelect from "@/components/common/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/useToast";
import { applyApiErrors, errorMessage } from "@/lib/formErrors";

const roleOptions = [
  { value: "employee", label: "Employee" },
  { value: "admin", label: "Administrator" },
];

const passwordRules = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.")
  .regex(/[A-Za-z]/, "Include a letter.")
  .regex(/\d/, "Include a number.");

// Email uniqueness is enforced by the API (409), which the form maps back onto the email field.
// When editing, an empty password means "keep the current one".
const buildSchema = (isEdit) =>
  z.object({
    name: z.string().trim().min(2, "Enter the person's full name."),
    email: z.string().trim().pipe(z.email("Enter a valid email address.")),
    password: isEdit ? z.union([z.literal(""), passwordRules]) : passwordRules,
    jobTitle: z.string().trim().min(2, "Enter a job title."),
    department: z.string().trim().min(2, "Enter a department."),
    role: z.enum(["employee", "admin"]),
    active: z.boolean(),
  });

const FIELDS = ["name", "email", "password", "jobTitle", "department", "role", "status"];

function UserFormBody({ user, isSelf, onSubmit, onCancel }) {
  const { notify } = useToast();
  const { control, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(buildSchema(Boolean(user))),
    mode: "onTouched",
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      jobTitle: user?.jobTitle ?? "",
      department: user?.department ?? "",
      role: user?.role ?? "employee",
      active: (user?.status ?? "active") === "active",
    },
  });

  const submit = async (v) => {
    try {
      await onSubmit({
        name: v.name.trim(),
        email: v.email.trim(),
        jobTitle: v.jobTitle.trim(),
        department: v.department.trim(),
        role: v.role,
        status: v.active ? "active" : "inactive",
        ...(v.password && { password: v.password }),
      });
    } catch (err) {
      if (!applyApiErrors(err, setError, FIELDS)) notify("Could not save the user", { description: errorMessage(err), variant: "danger" });
    }
  };

  const text = (name, label, props = {}) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`user-${name}`}>{label}</FieldLabel>
          <Input {...field} id={`user-${name}`} aria-invalid={fieldState.invalid} {...props} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-6">
      <FieldGroup className="gap-6">
        {text("name", "Full name", { placeholder: "e.g. Alya Ramadhani" })}
        {text("email", "Work email", { type: "email", placeholder: "name@company.com" })}
        {text("password", user ? "New password (optional)" : "Password", {
          type: "password",
          autoComplete: "new-password",
          placeholder: user ? "Leave blank to keep the current password" : "At least 8 characters, with a letter and a number",
        })}
        {text("jobTitle", "Job title", { placeholder: "e.g. Product Design Lead" })}
        {text("department", "Department", { placeholder: "e.g. Design & Research" })}
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="user-role">Role</FieldLabel>
              <SimpleSelect
                id="user-role"
                value={field.value}
                onValueChange={field.onChange}
                options={roleOptions}
                disabled={isSelf}
              />
              {isSelf && <FieldDescription>You can't change your own role.</FieldDescription>}
            </Field>
          )}
        />
        <Controller
          name="active"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="user-active">Active account</FieldLabel>
                <FieldDescription>
                  {isSelf
                    ? "You can't deactivate your own account."
                    : "Inactive users can't sign in or make reservations."}
                </FieldDescription>
              </FieldContent>
              <Switch id="user-active" checked={field.value} onCheckedChange={field.onChange} disabled={isSelf} />
            </Field>
          )}
        />
      </FieldGroup>

      <DialogFooter className="-mx-6 -mb-6 mt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Saving…" : user ? "Save changes" : "Add user"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// user = null adds a new user; a user object edits them.
export default function UserFormDialog({ open, onOpenChange, user, isSelf = false, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{user ? `Edit ${user.name}` : "Add a user"}</DialogTitle>
          <DialogDescription>
            {user ? "Changes apply immediately." : "They can sign in straight away with this email and password."}
          </DialogDescription>
        </DialogHeader>
        <UserFormBody user={user} isSelf={isSelf} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

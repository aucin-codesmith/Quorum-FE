import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import IconInput from "@/components/common/IconInput";
import { SessionSplash } from "@/components/common/QueryState";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { applyApiErrors } from "@/lib/formErrors";
import { ApiError } from "@/lib/api";
import { homeFor } from "@/routes/homeFor";

// Mirrors the API's rules so most mistakes are caught before the request; the server still has the final say.
const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().pipe(z.email("Enter a valid email address.")),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Use at most 72 characters.")
    .regex(/[A-Za-z]/, "Include a letter.")
    .regex(/\d/, "Include a number."),
  jobTitle: z.string().trim().max(120),
  department: z.string().trim().max(120),
});
const FIELDS = ["name", "email", "password", "jobTitle", "department"];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { user, loading: restoring, register } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const { control, handleSubmit, setError } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", jobTitle: "", department: "" },
  });

  if (restoring) return <SessionSplash />;
  if (user && !submitting) return <Navigate to={homeFor(user)} replace />;

  const onSubmit = async (values) => {
    setFormError(null);
    setSubmitting(true);
    const result = await register(values);
    if (!result.ok) {
      setSubmitting(false);
      const err = new ApiError(0, result.code, result.error, result.details);
      if (!applyApiErrors(err, setError, FIELDS)) setFormError(result.error);
      return;
    }
    notify("Account created", { description: `Welcome to QUORUM, ${result.user.name}.` });
    navigate(homeFor(result.user), { replace: true });
  };

  const text = (name, label, props = {}) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`reg-${name}`}>{label}</FieldLabel>
          {props.icon ? (
            <IconInput {...field} id={`reg-${name}`} aria-invalid={fieldState.invalid} {...props} />
          ) : (
            <Input {...field} id={`reg-${name}`} aria-invalid={fieldState.invalid} {...props} />
          )}
          {props.hint && !fieldState.invalid && <FieldDescription>{props.hint}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );

  return (
    <AuthLayout title="Create your account" description="Employees can sign up here. Administrators are added by an admin.">
      <form className="mt-12" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup className="gap-6">
          {text("name", "Full name", { icon: User, placeholder: "e.g. Alya Ramadhani", autoComplete: "name" })}
          {text("email", "Work email", { icon: Mail, type: "email", placeholder: "you@company.com", autoComplete: "username" })}
          {text("password", "Password", {
            icon: Lock,
            type: "password",
            placeholder: "At least 8 characters",
            autoComplete: "new-password",
            hint: "8 or more characters, with a letter and a number.",
          })}
          {text("jobTitle", "Job title (optional)", { placeholder: "e.g. Product Designer" })}
          {text("department", "Department (optional)", { placeholder: "e.g. Design & Research" })}

          {formError && <FieldError>{formError}</FieldError>}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
            {!submitting && <ArrowRight />}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

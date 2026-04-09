import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../api";
import { createUser } from "../api/users";
import { ErrorState } from "../components/ui/ErrorState";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const initialValues: RegisterFormValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function validateRegisterForm(values: RegisterFormValues) {
  const errors: RegisterFormErrors = {};
  const normalizedEmail = values.email.trim();

  if (values.username.trim().length === 0) {
    errors.username = "Username is required.";
  }

  if (normalizedEmail.length === 0) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (values.password.length === 0) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (values.confirmPassword.length === 0) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function RegisterPage() {
  useDocumentTitle("Register | Job Application Manager");
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState<RegisterFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateField<K extends keyof RegisterFormValues>(field: K, value: RegisterFormValues[K]) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setFormErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [field]: undefined,
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateRegisterForm(formValues);
    setFormErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const createdUser = await createUser({
        username: formValues.username.trim(),
        email: formValues.email.trim(),
        password: formValues.password,
      });

      navigate("/login", {
        replace: true,
        state: {
          successMessage: `Account created for ${createdUser.username}. You can sign in now.`,
          registeredEmail: createdUser.email,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError("We could not create your account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-card">
        <p className="page-card__eyebrow">Authentication</p>
        <h2>Create your account</h2>
        <p className="page-card__body">
          Set up your job tracker account with a username, email, and password. We will connect
          login after registration in the next auth step.
        </p>

        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="form-input"
              type="text"
              autoComplete="username"
              value={formValues.username}
              onChange={(event) => updateField("username", event.target.value)}
              aria-invalid={Boolean(formErrors.username)}
              aria-describedby={formErrors.username ? "username-error" : undefined}
            />
            {formErrors.username ? (
              <p className="form-error" id="username-error">
                {formErrors.username}
              </p>
            ) : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="form-input"
              type="email"
              autoComplete="email"
              value={formValues.email}
              onChange={(event) => updateField("email", event.target.value)}
              aria-invalid={Boolean(formErrors.email)}
              aria-describedby={formErrors.email ? "email-error" : undefined}
            />
            {formErrors.email ? (
              <p className="form-error" id="email-error">
                {formErrors.email}
              </p>
            ) : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="form-input"
              type="password"
              autoComplete="new-password"
              value={formValues.password}
              onChange={(event) => updateField("password", event.target.value)}
              aria-invalid={Boolean(formErrors.password)}
              aria-describedby={formErrors.password ? "password-error" : undefined}
            />
            {formErrors.password ? (
              <p className="form-error" id="password-error">
                {formErrors.password}
              </p>
            ) : (
              <p className="form-hint">Use at least 8 characters.</p>
            )}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              className="form-input"
              type="password"
              autoComplete="new-password"
              value={formValues.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              aria-invalid={Boolean(formErrors.confirmPassword)}
              aria-describedby={formErrors.confirmPassword ? "confirm-password-error" : undefined}
            />
            {formErrors.confirmPassword ? (
              <p className="form-error" id="confirm-password-error">
                {formErrors.confirmPassword}
              </p>
            ) : null}
          </div>

          <div className="auth-form__actions">
            <button className="button-link button-link--primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
            {isSubmitting ? (
              <p className="form-status" aria-live="polite">
                Creating your account and preparing sign-in...
              </p>
            ) : null}
            <p className="auth-form__meta">
              Already have an account? <Link to="/login">Go to login</Link>
            </p>
          </div>
        </form>
      </section>

      {submitError ? (
        <ErrorState
          title="Registration failed"
          message={submitError}
        />
      ) : null}
    </div>
  );
}

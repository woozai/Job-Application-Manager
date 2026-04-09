import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { ApiError } from "../api";
import { ErrorState } from "../components/ui/ErrorState";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useAuth } from "../hooks/useAuth";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

function validateLoginForm(values: LoginFormValues) {
  const errors: LoginFormErrors = {};
  const normalizedEmail = values.email.trim();

  if (normalizedEmail.length === 0) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (values.password.length === 0) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function LoginPage() {
  useDocumentTitle("Login | Job Application Manager");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const routeState = location.state as
    | {
        from?: { pathname?: string };
        successMessage?: string;
        registeredEmail?: string;
      }
    | null;

  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof LoginFormValues>(field: K, value: LoginFormValues[K]) {
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

    const nextErrors = validateLoginForm(formValues);
    setFormErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formValues.email.trim(), formValues.password);
      const redirectTo = routeState?.from?.pathname;
      navigate(redirectTo ?? "/dashboard", {
        replace: true,
        state: {
          successMessage: "You are signed in successfully.",
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError("We could not sign you in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-card">
        <p className="page-card__eyebrow">Authentication</p>
        <h2>Sign in to your account</h2>
        <p className="page-card__body">
          Use your email and password to load your session and access your private job tracker.
        </p>

        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              autoComplete="email"
              value={formValues.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="name@example.com"
              aria-invalid={Boolean(formErrors.email)}
              aria-describedby={formErrors.email ? "login-email-error" : undefined}
            />
            {formErrors.email ? (
              <p className="form-error" id="login-email-error">
                {formErrors.email}
              </p>
            ) : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              autoComplete="current-password"
              value={formValues.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Enter your password"
              aria-invalid={Boolean(formErrors.password)}
              aria-describedby={formErrors.password ? "login-password-error" : undefined}
            />
            {formErrors.password ? (
              <p className="form-error" id="login-password-error">
                {formErrors.password}
              </p>
            ) : null}
          </div>

          <div className="auth-form__actions">
            <button className="button-link button-link--primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
            <p className="auth-form__meta">
              Need an account? <Link to="/register">Create one</Link>
            </p>
          </div>
        </form>
      </section>

      {routeState?.successMessage ? (
        <section className="feedback-panel feedback-panel--success" role="status">
          <p className="feedback-panel__eyebrow">Success</p>
          <h3>Ready to sign in</h3>
          <p>{routeState.successMessage}</p>
        </section>
      ) : null}

      {submitError ? <ErrorState title="Login failed" message={submitError} /> : null}
    </div>
  );
}

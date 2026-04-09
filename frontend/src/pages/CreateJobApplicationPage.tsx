import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createJobApplication } from "../api/jobApplications";
import { ApiError } from "../api/client";
import { JobApplicationForm } from "../components/job-applications/JobApplicationForm";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { JobApplicationCreateInput } from "../types/jobApplication";

export function CreateJobApplicationPage() {
  useDocumentTitle("Create Application | Job Application Manager");
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleCreate(payload: JobApplicationCreateInput) {
    if (isSubmitting) {
      return;
    }

    if (!token) {
      setSubmitError("You must be signed in to create a job application.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdJobApplication = await createJobApplication(payload, token);
      navigate(`/job-applications/${createdJobApplication.id}`, {
        replace: true,
        state: {
          successMessage: `${createdJobApplication.company_name} was added successfully.`,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError("We could not create this job application. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <JobApplicationForm
      description="Capture the full job record now so later dashboard, detail, and contact views already have the right structure."
      isSubmitting={isSubmitting}
      onSubmit={handleCreate}
      submitError={submitError}
      submitLabel="Create application"
      submittingLabel="Creating your application and preparing the details page..."
      title="Create a new job application"
    />
  );
}

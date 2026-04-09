import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getJobApplication, updateJobApplication } from "../api/jobApplications";
import { ApiError } from "../api/client";
import { JobApplicationForm } from "../components/job-applications/JobApplicationForm";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { JobApplicationResponse, JobApplicationUpdateInput } from "../types/jobApplication";

export function EditJobApplicationPage() {
  useDocumentTitle("Edit Application | Job Application Manager");
  const navigate = useNavigate();
  const { jobApplicationId } = useParams();
  const { token } = useAuth();
  const [jobApplication, setJobApplication] = useState<JobApplicationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function loadJobApplication() {
    if (!token || !jobApplicationId) {
      setLoadError("We could not determine which application to edit.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const application = await getJobApplication(Number(jobApplicationId), token);
      setJobApplication(application);
    } catch (error) {
      if (error instanceof ApiError) {
        setLoadError(error.message);
      } else {
        setLoadError("We could not load this job application.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadJobApplication();
  }, [jobApplicationId, token]);

  async function handleUpdate(payload: JobApplicationUpdateInput) {
    if (isSubmitting) {
      return;
    }

    if (!token || !jobApplicationId) {
      setSubmitError("We could not determine which application to update.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updatedJobApplication = await updateJobApplication(Number(jobApplicationId), payload, token);
      navigate(`/job-applications/${updatedJobApplication.id}`, {
        replace: true,
        state: {
          successMessage: `${updatedJobApplication.company_name} was updated successfully.`,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError("We could not update this job application. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <LoadingState
        title="Loading application"
        message="Pulling the current values so you can edit this opportunity."
      />
    );
  }

  if (loadError || !jobApplication) {
    return (
      <ErrorState
        title="Could not load application"
        message={loadError ?? "Application not found."}
        action={
          <button className="button-link" onClick={() => void loadJobApplication()} type="button">
            Try again
          </button>
        }
      />
    );
  }

  return (
    <JobApplicationForm
      description="Update the application details, status, dates, and context without losing the existing record."
      initialData={jobApplication}
      isSubmitting={isSubmitting}
      onSubmit={handleUpdate}
      submitError={submitError}
      submitLabel="Save changes"
      submittingLabel="Saving your updates and refreshing the application details..."
      title={`Edit ${jobApplication.company_name}`}
    />
  );
}

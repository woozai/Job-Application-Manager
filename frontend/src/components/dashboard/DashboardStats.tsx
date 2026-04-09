import type { JobApplicationResponse } from "../../types/jobApplication";

export function DashboardStats({ jobApplications }: { jobApplications: JobApplicationResponse[] }) {
  const activeApplications = jobApplications.filter(
    (jobApplication) => jobApplication.status !== "rejected" && jobApplication.status !== "archived",
  ).length;
  const interviewCount = jobApplications.filter((jobApplication) => (jobApplication.interview_stage ?? "").trim().length > 0).length;
  const contactsCount = jobApplications.reduce((total, jobApplication) => total + jobApplication.contacts.length, 0);

  const stats = [
    { label: "Applications", value: jobApplications.length },
    { label: "Active", value: activeApplications },
    { label: "Interview tracks", value: interviewCount },
    { label: "Contacts", value: contactsCount },
  ];

  return (
    <section className="dashboard-stats" aria-label="Dashboard summary">
      {stats.map((stat) => (
        <article key={stat.label} className="dashboard-stat-card">
          <p className="dashboard-stat-card__label">{stat.label}</p>
          <strong className="dashboard-stat-card__value">{stat.value}</strong>
        </article>
      ))}
    </section>
  );
}

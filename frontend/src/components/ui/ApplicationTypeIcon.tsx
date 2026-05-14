import type { SVGProps } from "react";

import {
  getJobApplicationApplicationTypeMetadata,
  type JobApplicationApplicationTypeIconKey,
} from "../../types/jobApplication";

interface ApplicationTypeIconProps {
  applicationType: string | null | undefined;
  className?: string;
  title?: string;
}

function RecruiterIcon({ className }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M9 19a3 3 0 0 1 6 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M17 7h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M19 5v4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function DirectFromSiteIcon({ className }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
        width="18"
        x="3"
        y="5"
      />
      <path
        d="M8 9h8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M8 13h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ThroughConnectionIcon({ className }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M8.5 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M15.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M10.5 9.5l3 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

const applicationTypeIconByKey: Record<
  JobApplicationApplicationTypeIconKey,
  (props: SVGProps<SVGSVGElement>) => React.JSX.Element
> = {
  recruiter: RecruiterIcon,
  direct_from_site: DirectFromSiteIcon,
  through_connection: ThroughConnectionIcon,
};

export function ApplicationTypeIcon({
  applicationType,
  className,
  title,
}: ApplicationTypeIconProps) {
  const metadata = getJobApplicationApplicationTypeMetadata(applicationType);
  if (!metadata) {
    return null;
  }

  const IconComponent = applicationTypeIconByKey[metadata.iconKey];
  const iconTitle = title ?? metadata.iconLabel;

  return (
    <span
      aria-label={metadata.iconLabel}
      className={className}
      title={iconTitle}
    >
      <IconComponent className="application-type-icon__svg" />
    </span>
  );
}

import { useState } from "react";

import { ApiError } from "../api/client";
import { extractJobFromLink } from "../api/jobApplications";
import type { JobExtractionData } from "../types/jobApplication";

interface UseJobExtractionOptions {
  token: string | null;
}

interface ExtractJobDetailsInput {
  rawText: string | null;
  url: string;
}

interface ExtractJobDetailsResult {
  data: JobExtractionData;
  warnings: string[];
}

export function useJobExtraction({ token }: UseJobExtractionOptions) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractWarnings, setExtractWarnings] = useState<string[]>([]);

  function resetExtractionFeedback() {
    setExtractError(null);
    setExtractWarnings([]);
  }

  async function extractJobDetails({
    rawText,
    url,
  }: ExtractJobDetailsInput): Promise<ExtractJobDetailsResult | null> {
    if (isExtracting) {
      return null;
    }

    if (!token) {
      setExtractError("You must be signed in to extract job details.");
      return null;
    }

    setIsExtracting(true);
    resetExtractionFeedback();

    try {
      const response = await extractJobFromLink(
        {
          url,
          raw_text: rawText,
        },
        token,
      );

      setExtractWarnings(response.warnings);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        setExtractError(error.message);
      } else {
        setExtractError("We could not extract job details right now. Please try again.");
      }
      return null;
    } finally {
      setIsExtracting(false);
    }
  }

  return {
    extractError,
    extractJobDetails,
    extractWarnings,
    isExtracting,
    resetExtractionFeedback,
  };
}

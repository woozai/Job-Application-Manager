import test from "node:test";
import assert from "node:assert/strict";
import type { ReactElement, ReactNode } from "react";

import { ApplicationTypeIcon } from "../src/components/ui/ApplicationTypeIcon";

function flattenText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(flattenText).join("");
  }

  if (typeof node === "object" && "props" in node) {
    return flattenText(
      (node as ReactElement<{ children?: ReactNode }>).props.children,
    );
  }

  return "";
}

test("renders recruiter application type icon", () => {
  const element = ApplicationTypeIcon({
    applicationType: "recruiter",
    className: "application-type-icon",
  });

  assert.ok(element);
  assert.equal(element.props["aria-label"], "Recruiter application");
  assert.equal(element.props.className, "application-type-icon");
  assert.equal(flattenText(element.props.children), "");
});

test("renders direct-from-site application type icon", () => {
  const element = ApplicationTypeIcon({
    applicationType: "direct_from_site",
    className: "application-type-icon",
  });

  assert.ok(element);
  assert.equal(element.props["aria-label"], "Direct from site application");
  assert.equal(element.props.className, "application-type-icon");
});

test("renders through-connection application type icon", () => {
  const element = ApplicationTypeIcon({
    applicationType: "through_connection",
    className: "application-type-icon",
  });

  assert.ok(element);
  assert.equal(element.props["aria-label"], "Through connection application");
  assert.equal(element.props.className, "application-type-icon");
});

test("renders no markup for empty or unknown application type values", () => {
  const emptyElement = ApplicationTypeIcon({
    applicationType: null,
    className: "application-type-icon",
  });
  const unknownElement = ApplicationTypeIcon({
    applicationType: "unknown-source",
    className: "application-type-icon",
  });

  assert.equal(emptyElement, null);
  assert.equal(unknownElement, null);
});

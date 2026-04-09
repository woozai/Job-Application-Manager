import { apiRequest, createListQueryParams } from "./client";

import type { ApiMessageResponse, ListQueryParams } from "../types/api";
import type { ContactCreateInput, ContactResponse, ContactUpdateInput } from "../types/contact";

export function createContact(contact: ContactCreateInput, token: string) {
  return apiRequest<ContactResponse>("/contacts/", {
    method: "POST",
    body: contact,
    token,
  });
}

export function getContacts(token: string, params: ListQueryParams = {}) {
  return apiRequest<ContactResponse[]>(
    "/contacts/",
    { token },
    createListQueryParams(params.skip, params.limit),
  );
}

export function getContact(contactId: number, token: string) {
  return apiRequest<ContactResponse>(`/contacts/${contactId}`, { token });
}

export function getContactsByJobApplication(
  jobApplicationId: number,
  token: string,
  params: ListQueryParams = {},
) {
  return apiRequest<ContactResponse[]>(
    `/contacts/job-application/${jobApplicationId}`,
    { token },
    createListQueryParams(params.skip, params.limit),
  );
}

export function updateContact(contactId: number, contact: ContactUpdateInput, token: string) {
  return apiRequest<ContactResponse>(`/contacts/${contactId}`, {
    method: "PUT",
    body: contact,
    token,
  });
}

export function deleteContact(contactId: number, token: string) {
  return apiRequest<ApiMessageResponse>(`/contacts/${contactId}`, {
    method: "DELETE",
    token,
  });
}

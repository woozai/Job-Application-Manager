import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { createContact, deleteContact, updateContact } from "../api/contacts";
import { ApiError } from "../api/client";
import { deleteJobApplication, getJobApplication } from "../api/jobApplications";
import type { ContactCreateInput, ContactResponse, ContactUpdateInput } from "../types/contact";

export function useJobApplicationDetails(token: string | null) {
  const { jobApplicationId } = useParams();
  const navigate = useNavigate();
  const [jobApplication, setJobApplication] = useState<Awaited<ReturnType<typeof getJobApplication>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [createContactError, setCreateContactError] = useState<string | null>(null);
  const [createContactSuccessMessage, setCreateContactSuccessMessage] = useState<string | null>(null);
  const [showCreateContactForm, setShowCreateContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactResponse | null>(null);
  const [isSavingEditedContact, setIsSavingEditedContact] = useState(false);
  const [editContactError, setEditContactError] = useState<string | null>(null);
  const [contactPendingDelete, setContactPendingDelete] = useState<ContactResponse | null>(null);
  const [deleteContactError, setDeleteContactError] = useState<string | null>(null);
  const [isDeletingContact, setIsDeletingContact] = useState(false);

  async function loadJobDetails() {
    if (!token || !jobApplicationId) {
      setLoadError("We could not determine which application to load.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      setJobApplication(await getJobApplication(Number(jobApplicationId), token));
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "We could not load this job application.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadJobDetails();
  }, [jobApplicationId, token]);

  async function handleDelete() {
    if (isDeleting || !token || !jobApplicationId || !jobApplication) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteJobApplication(Number(jobApplicationId), token);
      navigate("/dashboard", {
        replace: true,
        state: { successMessage: `${jobApplication.company_name} was deleted successfully.` },
      });
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.message : "We could not delete this job application. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleCreateContact(payload: ContactCreateInput | ContactUpdateInput) {
    if (isCreatingContact || !token) {
      return false;
    }

    setIsCreatingContact(true);
    setCreateContactError(null);
    setCreateContactSuccessMessage(null);

    try {
      const createdContact = await createContact(payload as ContactCreateInput, token);
      setJobApplication((current) => current ? { ...current, contacts: [...current.contacts, createdContact] } : current);
      setCreateContactSuccessMessage(`${createdContact.name} was added to this application.`);
      setShowCreateContactForm(false);
      return true;
    } catch (error) {
      setCreateContactError(error instanceof ApiError ? error.message : "We could not create this contact. Please try again.");
      return false;
    } finally {
      setIsCreatingContact(false);
    }
  }

  async function handleEditContact(payload: ContactCreateInput | ContactUpdateInput) {
    if (isSavingEditedContact || !token || !editingContact) {
      return false;
    }

    setIsSavingEditedContact(true);
    setEditContactError(null);

    try {
      const updatedContact = await updateContact(editingContact.id, payload, token);
      setJobApplication((current) =>
        current
          ? { ...current, contacts: current.contacts.map((contact) => contact.id === updatedContact.id ? updatedContact : contact) }
          : current,
      );
      setCreateContactSuccessMessage(`${updatedContact.name} was updated successfully.`);
      setEditingContact(null);
      return true;
    } catch (error) {
      setEditContactError(error instanceof ApiError ? error.message : "We could not update this contact. Please try again.");
      return false;
    } finally {
      setIsSavingEditedContact(false);
    }
  }

  async function handleDeleteContact() {
    if (isDeletingContact || !token || !contactPendingDelete) {
      return;
    }

    const contactToDelete = contactPendingDelete;
    setIsDeletingContact(true);
    setDeleteContactError(null);

    try {
      await deleteContact(contactToDelete.id, token);
      setJobApplication((current) =>
        current ? { ...current, contacts: current.contacts.filter((contact) => contact.id !== contactToDelete.id) } : current,
      );
      if (editingContact?.id === contactToDelete.id) {
        setEditingContact(null);
      }
      setContactPendingDelete(null);
      setEditContactError(null);
      setCreateContactError(null);
      setDeleteContactError(null);
      setCreateContactSuccessMessage(`${contactToDelete.name} was deleted successfully.`);
    } catch (error) {
      setDeleteContactError(error instanceof ApiError ? error.message : "We could not delete this contact. Please try again.");
    } finally {
      setIsDeletingContact(false);
    }
  }

  return {
    jobApplicationId,
    jobApplication,
    isLoading,
    loadError,
    loadJobDetails,
    showDeleteConfirm,
    setShowDeleteConfirm,
    deleteError,
    setDeleteError,
    isDeleting,
    handleDelete,
    isCreatingContact,
    createContactError,
    setCreateContactError,
    createContactSuccessMessage,
    setCreateContactSuccessMessage,
    showCreateContactForm,
    setShowCreateContactForm,
    handleCreateContact,
    editingContact,
    setEditingContact,
    isSavingEditedContact,
    editContactError,
    setEditContactError,
    handleEditContact,
    contactPendingDelete,
    setContactPendingDelete,
    deleteContactError,
    setDeleteContactError,
    isDeletingContact,
    handleDeleteContact,
  };
}

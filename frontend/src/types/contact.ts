export interface ContactResponse {
  id: number;
  job_application_id: number;
  name: string;
  profile_link: string | null;
  company: string | null;
  job_title: string | null;
  relationship_type: string | null;
  priority: string | null;
  connection_requested_at: string | null;
  connection_approved: boolean;
  connection_approved_at: string | null;
  message_sent: boolean;
  message_sent_at: string | null;
  response_status: string | null;
  last_interaction_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactCreateInput {
  job_application_id: number;
  name: string;
  profile_link?: string | null;
  company?: string | null;
  job_title?: string | null;
  relationship_type?: string | null;
  priority?: string | null;
  connection_requested_at?: string | null;
  connection_approved?: boolean;
  connection_approved_at?: string | null;
  message_sent?: boolean;
  message_sent_at?: string | null;
  response_status?: string | null;
  last_interaction_date?: string | null;
  notes?: string | null;
}

export interface ContactUpdateInput {
  job_application_id?: number;
  name?: string;
  profile_link?: string | null;
  company?: string | null;
  job_title?: string | null;
  relationship_type?: string | null;
  priority?: string | null;
  connection_requested_at?: string | null;
  connection_approved?: boolean | null;
  connection_approved_at?: string | null;
  message_sent?: boolean | null;
  message_sent_at?: string | null;
  response_status?: string | null;
  last_interaction_date?: string | null;
  notes?: string | null;
}

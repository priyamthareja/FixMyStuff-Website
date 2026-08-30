import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// ================================
// CUSTOMER — SUBMIT REPAIR REQUEST
// ================================

export async function submitRepairRequest(formData) {
  const { data, error } = await supabase
    .from("repair_requests")
    .insert([
      {
        customer_name: formData.customer_name,
        phone: formData.phone,
        email: formData.email || null,
        service: formData.service,
        device: formData.device || null,
        issue_description: formData.issue_description || null,
        address: formData.address || null,
        preferred_date: formData.preferred_date || null,
        preferred_time: formData.preferred_time || null,
      },
    ]);

  if (error) {
    console.error("Repair request error:", error);
    throw error;
  }

  return data;
}

// ================================
// ADMIN — LOGIN
// ================================

export async function adminLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Admin login error:", error);
    throw error;
  }

  return data;
}

// ================================
// ADMIN — LOGOUT
// ================================

export async function adminLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Admin logout error:", error);
    throw error;
  }
}

// ================================
// ADMIN — GET CURRENT SESSION
// ================================

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Session error:", error);
    throw error;
  }

  return data.session;
}

// ================================
// ADMIN — GET ALL REPAIR REQUESTS
// ================================

export async function getRepairRequests() {
  const { data, error } = await supabase
    .from("repair_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get repair requests error:", error);
    throw error;
  }

  return data || [];
}

// ================================
// ADMIN — UPDATE REQUEST STATUS
// ================================

export async function updateRepairStatus(id, status) {
  const allowedStatuses = [
    "New",
    "Contacted",
    "In Progress",
    "Completed",
    "Cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid repair status.");
  }

  const { data, error } = await supabase
    .from("repair_requests")
    .update({ status })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Update repair status error:", error);
    throw error;
  }

  return data;
}
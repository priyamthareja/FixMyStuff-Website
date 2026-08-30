import { useEffect, useState } from "react";
import { submitRepairRequest, supabase } from "./services";
import "./App.css";

const ADMIN_EMAIL = "priyamthareja1@gmail.com";

const serviceOptions = [
  "Mobile Repair",
  "Laptop Repair",
  "Tablet Repair",
  "TV Repair",
  "Other",
];

const timeOptions = ["Morning", "Afternoon", "Evening"];

const services = [
  {
    icon: "mobile",
    title: "Mobile Repair",
    text: "Screen, battery, charging port & software issues.",
    price: "Request a quote",
  },
  {
    icon: "laptop",
    title: "Laptop Repair",
    text: "Hardware, software, cleaning & performance issues.",
    price: "Request a quote",
  },
  {
    icon: "tablet",
    title: "Tablet Repair",
    text: "Display, battery, charging & performance repairs.",
    price: "Request a quote",
  },
  {
    icon: "tv",
    title: "TV Repair",
    text: "Display, sound, power & connectivity problems.",
    price: "Request a quote",
  },
];

const statusOptions = [
  "New",
  "Contacted",
  "In Progress",
  "Completed",
  "Cancelled",
];

const resetForm = () => ({
  customer_name: "",
  phone: "",
  email: "",
  service: "",
  device: "",
  issue_description: "",
  address: "",
  preferred_date: "",
  preferred_time: "",
});

const DeviceIcon = ({ type }) => {
  const common = {
    width: 30,
    height: 30,
    viewBox: "0 0 32 32",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };

  if (type === "mobile") {
    return (
      <svg {...common}>
        <rect
          x="9"
          y="3.5"
          width="14"
          height="25"
          rx="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M13 7h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="16" cy="24.5" r="1.1" fill="currentColor" />
      </svg>
    );
  }

  if (type === "laptop") {
    return (
      <svg {...common}>
        <rect
          x="6"
          y="5"
          width="20"
          height="15"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M3.8 24h24.4l-2.2 3H6l-2.2-3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "tablet") {
    return (
      <svg {...common}>
        <rect
          x="6.5"
          y="3.5"
          width="19"
          height="25"
          rx="2.7"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="16" cy="24.8" r="1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect
        x="4"
        y="5.5"
        width="24"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M11 27h10M16 23.5V27"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

const StepIcon = ({ type }) => {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 32 32",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };

  if (type === "write") {
    return (
      <svg {...common}>
        <path
          d="M7 25h7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9 21.5 21.5 9a3 3 0 0 1 4.2 4.2L13.2 25.7 8 27l1-5.5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="m19.5 11 4 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "check") {
    return (
      <svg {...common}>
        <path
          d="m7 17 5.5 5.5L25 9"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        d="m8 22 14-14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="m20 7 5 5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="m10 8 4 4M18 18l4 4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="m7 25 3-3M22 10l3-3"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [loginLoading, setLoginLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        setMessage(error.message);
      }

      if (data?.session) {
        const currentEmail = data.session.user?.email?.toLowerCase();

        if (currentEmail === ADMIN_EMAIL.toLowerCase()) {
          setSession(data.session);
        } else {
          await supabase.auth.signOut();
          setMessage("This account is not authorized as admin.");
        }
      }

      setCheckingAuth(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!newSession) {
        setSession(null);
        return;
      }

      const currentEmail = newSession.user?.email?.toLowerCase();

      if (currentEmail === ADMIN_EMAIL.toLowerCase()) {
        setSession(newSession);
      } else {
        supabase.auth.signOut();
        setSession(null);
        setMessage("This account is not authorized as admin.");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      loadRequests();
    }
  }, [session]);

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      setMessage("");

      const { data, error } = await supabase
        .from("repair_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setRequests(data || []);
    } catch (error) {
      console.error("Load requests error:", error);
      setMessage(error.message || "Could not load repair requests.");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    try {
      setLoginLoading(true);
      setMessage("");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      const loggedInEmail = data?.user?.email?.toLowerCase();

      if (loggedInEmail !== ADMIN_EMAIL.toLowerCase()) {
        await supabase.auth.signOut();
        throw new Error("This account is not authorized as admin.");
      }

      setSession(data.session);
      setPassword("");
    } catch (error) {
      console.error("Admin login error:", error);
      setMessage(error.message || "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRequests([]);
    setMessage("");
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("repair_requests")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setRequests((current) =>
        current.map((request) =>
          request.id === id
            ? { ...request, status: newStatus }
            : request
        )
      );

      setSelectedRequest((current) =>
        current && current.id === id
          ? { ...current, status: newStatus }
          : current
      );

      setMessage("Request status updated successfully.");
    } catch (error) {
      console.error("Update status error:", error);
      setMessage(error.message || "Could not update status.");
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";

    try {
      return new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return value;
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesStatus =
      filterStatus === "All" || request.status === filterStatus;

    const searchableText = [
      request.customer_name,
      request.phone,
      request.email,
      request.service,
      request.device,
      request.issue_description,
      request.address,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const newCount = requests.filter((r) => r.status === "New").length;
  const contactedCount = requests.filter(
    (r) => r.status === "Contacted"
  ).length;
  const progressCount = requests.filter(
    (r) => r.status === "In Progress"
  ).length;
  const completedCount = requests.filter(
    (r) => r.status === "Completed"
  ).length;

  if (checkingAuth) {
    return (
      <div style={adminStyles.loadingScreen}>
        <div style={adminStyles.loadingCard}>
          <div style={adminStyles.spinner}></div>
          <h2>Loading Admin Dashboard...</h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={adminStyles.loginPage}>
        <div style={adminStyles.loginCard}>
          <div style={adminStyles.adminLogo}>
            <span>F</span>
          </div>

          <div style={adminStyles.loginLabel}>FIXMYSTUFF ADMIN</div>

          <h1 style={adminStyles.loginTitle}>Admin Dashboard</h1>

          <p style={adminStyles.loginText}>
            Sign in to manage customer repair requests.
          </p>

          <form onSubmit={handleLogin}>
            <label style={adminStyles.label}>Email</label>

            <input
              style={adminStyles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              required
            />

            <label style={adminStyles.label}>Password</label>

            <input
              style={adminStyles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />

            {message && (
              <div style={adminStyles.errorBox}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              style={adminStyles.loginButton}
            >
              {loginLoading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            style={adminStyles.backButton}
          >
            ← Back to website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={adminStyles.dashboard}>
      <header style={adminStyles.adminHeader}>
        <div style={adminStyles.headerLeft}>
          <div style={adminStyles.smallLogo}>F</div>

          <div>
            <div style={adminStyles.brandName}>
              FixMy<span>Stuff</span>
            </div>

            <div style={adminStyles.headerSubtitle}>
              Admin Dashboard
            </div>
          </div>
        </div>

        <div style={adminStyles.headerRight}>
          <span style={adminStyles.adminEmail}>
            {session.user?.email}
          </span>

          <button
            onClick={handleLogout}
            style={adminStyles.logoutButton}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={adminStyles.adminMain}>
        <div style={adminStyles.dashboardIntro}>
          <div>
            <div style={adminStyles.dashboardLabel}>
              REPAIR MANAGEMENT
            </div>

            <h1 style={adminStyles.dashboardTitle}>
              Repair Requests
            </h1>

            <p style={adminStyles.dashboardText}>
              View and manage all customer repair requests.
            </p>
          </div>

          <button
            onClick={loadRequests}
            style={adminStyles.refreshButton}
            disabled={loadingRequests}
          >
            {loadingRequests ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {message && (
          <div style={adminStyles.infoBox}>
            {message}
          </div>
        )}

        <div style={adminStyles.statsGrid}>
          <div style={adminStyles.statCard}>
            <span style={adminStyles.statNumber}>
              {requests.length}
            </span>
            <span style={adminStyles.statLabel}>Total Requests</span>
          </div>

          <div style={adminStyles.statCard}>
            <span style={adminStyles.statNumber}>
              {newCount}
            </span>
            <span style={adminStyles.statLabel}>New</span>
          </div>

          <div style={adminStyles.statCard}>
            <span style={adminStyles.statNumber}>
              {contactedCount}
            </span>
            <span style={adminStyles.statLabel}>Contacted</span>
          </div>

          <div style={adminStyles.statCard}>
            <span style={adminStyles.statNumber}>
              {progressCount}
            </span>
            <span style={adminStyles.statLabel}>In Progress</span>
          </div>

          <div style={adminStyles.statCard}>
            <span style={adminStyles.statNumber}>
              {completedCount}
            </span>
            <span style={adminStyles.statLabel}>Completed</span>
          </div>
        </div>

        <div style={adminStyles.toolbar}>
          <input
            style={adminStyles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, service, device..."
          />

          <select
            style={adminStyles.statusFilter}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>

            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div style={adminStyles.tableWrapper}>
          {loadingRequests ? (
            <div style={adminStyles.emptyState}>
              <div style={adminStyles.spinner}></div>
              <p>Loading repair requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={adminStyles.emptyState}>
              <div style={adminStyles.emptyIcon}>✓</div>
              <h3>No repair requests found</h3>
              <p>
                Customer requests submitted through the website
                will appear here.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={adminStyles.table}>
                <thead>
                  <tr>
                    <th style={adminStyles.th}>Customer</th>
                    <th style={adminStyles.th}>Contact</th>
                    <th style={adminStyles.th}>Service</th>
                    <th style={adminStyles.th}>Device</th>
                    <th style={adminStyles.th}>Issue</th>
                    <th style={adminStyles.th}>Date</th>
                    <th style={adminStyles.th}>Status</th>
                    <th style={adminStyles.th}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td style={adminStyles.td}>
                        <strong>
                          {request.customer_name || "—"}
                        </strong>
                      </td>

                      <td style={adminStyles.td}>
                        <div>
                          {request.phone || "—"}
                        </div>

                        {request.email && (
                          <small style={adminStyles.muted}>
                            {request.email}
                          </small>
                        )}
                      </td>

                      <td style={adminStyles.td}>
                        {request.service || "—"}
                      </td>

                      <td style={adminStyles.td}>
                        {request.device || "—"}
                      </td>

                      <td style={adminStyles.td}>
                        <div style={adminStyles.issueText}>
                          {request.issue_description || "—"}
                        </div>
                      </td>

                      <td style={adminStyles.td}>
                        {formatDate(request.created_at)}
                      </td>

                      <td style={adminStyles.td}>
                        <select
                          value={request.status || "New"}
                          onChange={(e) =>
                            updateStatus(
                              request.id,
                              e.target.value
                            )
                          }
                          style={{
                            ...adminStyles.statusSelect,
                            ...getStatusStyle(
                              request.status || "New"
                            ),
                          }}
                        >
                          {statusOptions.map((status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td style={adminStyles.td}>
                        <button
                          onClick={() =>
                            setSelectedRequest(request)
                          }
                          style={adminStyles.viewButton}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {selectedRequest && (
        <div
          style={adminStyles.modalOverlay}
          onClick={() => setSelectedRequest(null)}
        >
          <div
            style={adminStyles.requestModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRequest(null)}
              style={adminStyles.modalClose}
            >
              ×
            </button>

            <div style={adminStyles.modalLabel}>
              REPAIR REQUEST
            </div>

            <h2 style={adminStyles.modalTitle}>
              {selectedRequest.customer_name}
            </h2>

            <div style={adminStyles.detailGrid}>
              <div style={adminStyles.detailItem}>
                <span>Phone</span>
                <strong>{selectedRequest.phone || "—"}</strong>
              </div>

              <div style={adminStyles.detailItem}>
                <span>Email</span>
                <strong>{selectedRequest.email || "—"}</strong>
              </div>

              <div style={adminStyles.detailItem}>
                <span>Service</span>
                <strong>
                  {selectedRequest.service || "—"}
                </strong>
              </div>

              <div style={adminStyles.detailItem}>
                <span>Device</span>
                <strong>
                  {selectedRequest.device || "—"}
                </strong>
              </div>

              <div style={adminStyles.detailItem}>
                <span>Preferred Date</span>
                <strong>
                  {selectedRequest.preferred_date || "—"}
                </strong>
              </div>

              <div style={adminStyles.detailItem}>
                <span>Preferred Time</span>
                <strong>
                  {selectedRequest.preferred_time || "—"}
                </strong>
              </div>
            </div>

            <div style={adminStyles.detailBlock}>
              <span>Issue Description</span>
              <p>
                {selectedRequest.issue_description ||
                  "No description provided."}
              </p>
            </div>

            <div style={adminStyles.detailBlock}>
              <span>Address</span>
              <p>
                {selectedRequest.address ||
                  "No address provided."}
              </p>
            </div>

            <div style={adminStyles.detailBlock}>
              <span>Request Created</span>
              <p>{formatDate(selectedRequest.created_at)}</p>
            </div>

            <div style={adminStyles.modalActions}>
              <label>Status</label>

              <select
                value={selectedRequest.status || "New"}
                onChange={(e) =>
                  updateStatus(
                    selectedRequest.id,
                    e.target.value
                  )
                }
                style={adminStyles.modalStatusSelect}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const getStatusStyle = (status) => {
  if (status === "New") {
    return {
      background: "#edf8dc",
      color: "#5c9222",
    };
  }

  if (status === "Contacted") {
    return {
      background: "#eef4ff",
      color: "#4169a1",
    };
  }

  if (status === "In Progress") {
    return {
      background: "#fff5dc",
      color: "#a16f13",
    };
  }

  if (status === "Completed") {
    return {
      background: "#e8f7ed",
      color: "#34864b",
    };
  }

  if (status === "Cancelled") {
    return {
      background: "#fceaea",
      color: "#b44a4a",
    };
  }

  return {};
};

const adminStyles = {
  loadingScreen: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f7f8f3",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  loadingCard: {
    textAlign: "center",
  },

  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #dfe7d4",
    borderTop: "3px solid #69a52b",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },

  loginPage: {
    minHeight: "100vh",
    background: "#f5f7f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  loginCard: {
    width: "100%",
    maxWidth: "440px",
    background: "#ffffff",
    border: "1px solid #dfe5d8",
    borderRadius: "24px",
    padding: "42px",
    boxShadow: "0 20px 60px rgba(15, 25, 12, 0.08)",
  },

  adminLogo: {
    width: "58px",
    height: "58px",
    borderRadius: "17px",
    background: "#10150f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
  },

  adminLogoSpan: {
    color: "#9bdd4d",
    fontSize: "28px",
    fontWeight: "800",
  },

  loginLabel: {
    color: "#68a52b",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "2px",
    marginBottom: "10px",
  },

  loginTitle: {
    margin: "0 0 10px",
    fontSize: "34px",
    lineHeight: "1.1",
    color: "#10150f",
  },

  loginText: {
    margin: "0 0 28px",
    color: "#687267",
    lineHeight: "1.6",
  },

  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "700",
    color: "#20261f",
    margin: "16px 0 8px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d7ded1",
    borderRadius: "12px",
    padding: "14px 15px",
    fontSize: "15px",
    outline: "none",
    background: "#fbfcfa",
  },

  loginButton: {
    width: "100%",
    border: "0",
    borderRadius: "12px",
    background: "#10150f",
    color: "#ffffff",
    padding: "15px",
    marginTop: "22px",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "pointer",
  },

  backButton: {
    width: "100%",
    border: "0",
    background: "transparent",
    color: "#697367",
    padding: "14px",
    marginTop: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  errorBox: {
    marginTop: "16px",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "#fceaea",
    color: "#a94444",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  dashboard: {
    minHeight: "100vh",
    background: "#f5f7f1",
    color: "#11160f",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  adminHeader: {
    height: "76px",
    background: "#ffffff",
    borderBottom: "1px solid #e2e7de",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 42px",
    boxSizing: "border-box",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  smallLogo: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#10150f",
    color: "#91d64a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "21px",
  },

  brandName: {
    fontWeight: "800",
    fontSize: "18px",
  },

  headerSubtitle: {
    color: "#899188",
    fontSize: "12px",
    marginTop: "2px",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  adminEmail: {
    color: "#6c766b",
    fontSize: "13px",
  },

  logoutButton: {
    border: "1px solid #dce2d8",
    background: "#ffffff",
    borderRadius: "10px",
    padding: "9px 15px",
    fontWeight: "700",
    cursor: "pointer",
  },

  adminMain: {
    maxWidth: "1450px",
    margin: "0 auto",
    padding: "46px 42px 80px",
  },

  dashboardIntro: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
    marginBottom: "30px",
  },

  dashboardLabel: {
    color: "#69a52b",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "2px",
    marginBottom: "8px",
  },

  dashboardTitle: {
    margin: 0,
    fontSize: "42px",
    lineHeight: "1.05",
  },

  dashboardText: {
    margin: "10px 0 0",
    color: "#6d776c",
    fontSize: "16px",
  },

  refreshButton: {
    border: "0",
    background: "#10150f",
    color: "#ffffff",
    borderRadius: "11px",
    padding: "12px 18px",
    fontWeight: "800",
    cursor: "pointer",
  },

  infoBox: {
    background: "#edf7df",
    color: "#5b8f25",
    border: "1px solid #d7e8c1",
    padding: "13px 16px",
    borderRadius: "11px",
    marginBottom: "20px",
    fontSize: "14px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(5, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "22px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e0e6dc",
    borderRadius: "16px",
    padding: "22px",
  },

  statNumber: {
    display: "block",
    fontSize: "30px",
    fontWeight: "800",
    marginBottom: "4px",
  },

  statLabel: {
    color: "#737d72",
    fontSize: "13px",
  },

  toolbar: {
    background: "#ffffff",
    border: "1px solid #e0e6dc",
    borderRadius: "16px 16px 0 0",
    padding: "16px",
    display: "flex",
    gap: "12px",
  },

  searchInput: {
    flex: 1,
    border: "1px solid #dce3d8",
    borderRadius: "10px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
  },

  statusFilter: {
    width: "190px",
    border: "1px solid #dce3d8",
    borderRadius: "10px",
    padding: "12px",
    background: "#ffffff",
    fontSize: "14px",
  },

  tableWrapper: {
    background: "#ffffff",
    border: "1px solid #e0e6dc",
    borderTop: 0,
    borderRadius: "0 0 16px 16px",
    overflow: "hidden",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px",
  },

  th: {
    textAlign: "left",
    padding: "15px 16px",
    background: "#fafbf8",
    borderBottom: "1px solid #e5e9e2",
    color: "#697267",
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },

  td: {
    padding: "17px 16px",
    borderBottom: "1px solid #edf0eb",
    fontSize: "13px",
    verticalAlign: "top",
  },

  muted: {
    display: "block",
    color: "#929b90",
    marginTop: "4px",
    fontSize: "11px",
  },

  issueText: {
    maxWidth: "220px",
    lineHeight: "1.5",
    color: "#606a5f",
  },

  statusSelect: {
    border: "0",
    borderRadius: "20px",
    padding: "7px 10px",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },

  viewButton: {
    border: "1px solid #dce3d8",
    background: "#ffffff",
    borderRadius: "9px",
    padding: "8px 13px",
    cursor: "pointer",
    fontWeight: "700",
  },

  emptyState: {
    padding: "80px 30px",
    textAlign: "center",
    color: "#758073",
  },

  emptyIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    background: "#edf7df",
    color: "#68a52b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    fontSize: "22px",
    fontWeight: "800",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10, 14, 9, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 9999,
  },

  requestModal: {
    position: "relative",
    width: "100%",
    maxWidth: "700px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "22px",
    padding: "34px",
    boxSizing: "border-box",
    boxShadow: "0 30px 90px rgba(0,0,0,0.25)",
  },

  modalClose: {
    position: "absolute",
    top: "18px",
    right: "18px",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "1px solid #e0e5dd",
    background: "#ffffff",
    fontSize: "23px",
    cursor: "pointer",
  },

  modalLabel: {
    color: "#69a52b",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "2px",
  },

  modalTitle: {
    margin: "8px 0 26px",
    fontSize: "30px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  detailItem: {
    background: "#f7f9f5",
    borderRadius: "12px",
    padding: "14px",
  },

  detailItemSpan: {
    color: "#808980",
    fontSize: "12px",
  },

  detailBlock: {
    marginTop: "18px",
    paddingTop: "18px",
    borderTop: "1px solid #e7ebe4",
  },

  modalActions: {
    marginTop: "24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  modalStatusSelect: {
    border: "1px solid #dce3d8",
    borderRadius: "10px",
    padding: "10px 13px",
    background: "#ffffff",
    fontWeight: "700",
  },
};

/* =========================================================
   MAIN WEBSITE
========================================================= */

function Website() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(resetForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const openRepairForm = (service = "") => {
    setForm((current) => ({
      ...current,
      service,
    }));

    setMessage("");
    setShowForm(true);
    document.body.classList.add("modal-open");
  };

  const closeRepairForm = () => {
    setShowForm(false);
    document.body.classList.remove("modal-open");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.customer_name ||
      !form.phone ||
      !form.service ||
      !form.issue_description ||
      !form.address
    ) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await submitRepairRequest(form);

      setMessage(
        "Repair request submitted successfully! We will contact you soon."
      );

      setForm(resetForm());
    } catch (error) {
      console.error("Repair request error:", error);
      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="#">
          <span className="logo-box">F</span>

          <span>
            FixMy<span className="green">Stuff</span>
          </span>
        </a>

        <nav>
          <a href="#">Home</a>
          <a href="#services">Services</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#why-us">Why Us</a>
          <a href="#contact">Contact</a>
        </nav>

        <button
          className="nav-cta"
          onClick={() => openRepairForm()}
        >
          Book a Repair <span>↗</span>
        </button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot">✦</span>
              DEVICE REPAIR <b>•</b> SIMPLE BOOKING <b>•</b> CLEAR PROCESS
            </div>

            <h1>
              Getting your
              <br />
              device <span>fixed</span>
              <br />
              is simple
            </h1>

            <p className="hero-copy">
              Repair services for your mobile, laptop, tablet and more.
              Submit a request and we’ll review the issue with you.
            </p>

            <div className="hero-actions">
              <button
                className="primary-cta"
                onClick={() => openRepairForm()}
              >
                Book a Repair <span>→</span>
              </button>

              <a
                className="secondary-cta"
                href="#services"
              >
                View Services <span>↘</span>
              </a>
            </div>

            <div className="metrics">
              <div className="metric">
                <strong>Multiple</strong>
                <span>Device Types</span>
              </div>

              <div className="metric">
                <strong>
                  Easy <small>★</small>
                </strong>
                <span>Online Booking</span>
              </div>

              <div className="metric">
                <strong>Clear</strong>
                <span>Service Process</span>
              </div>
            </div>
          </div>

          <div
            className="hero-visual"
            aria-hidden="true"
          >
            <div className="glow glow-one" />
            <div className="glow glow-two" />

            <div className="device-laptop">
              <div className="laptop-screen">
                <div className="mini-logo">
                  FixMy<span>Stuff</span>
                </div>

                <div className="laptop-title">
                  We fix it.
                  <br />
                  You love it.
                </div>

                <div className="laptop-check">✓</div>
              </div>

              <div className="laptop-base" />
            </div>

            <div className="device-phone">
              <div className="phone-screen">
                <div className="phone-notch" />

                <div className="phone-icon">
                  🔧
                </div>

                <strong>Fixed.</strong>

                <span>Ready to go</span>
              </div>
            </div>

            <div className="device-tablet">
              <div className="tablet-screen">
                <span>✓</span>
              </div>
            </div>

            <div className="spark spark-a">✦</div>
            <div className="spark spark-b">•</div>
            <div className="spark spark-c">✦</div>
          </div>
        </section>

        <section
          className="services-section"
          id="services"
        >
          <div className="section-heading centered">
            <span>OUR SERVICES</span>

            <h2>What can we fix for you?</h2>

            <p>
              Repair options for the devices you use
              every day.
            </p>
          </div>

          <div className="services-grid">
            {services.map((item) => (
              <article
                className="service-card"
                key={item.title}
              >
                <div className="service-top">
                  <div className="service-icon">
                    <DeviceIcon type={item.icon} />
                  </div>

                  <span className="service-arrow">
                    ↗
                  </span>
                </div>

                <h3>{item.title}</h3>

                <p>{item.text}</p>

                <div className="service-bottom">
                  <strong>{item.price}</strong>

                  <button
                    onClick={() =>
                      openRepairForm(item.title)
                    }
                  >
                    Book <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="how-section"
          id="how-it-works"
        >
          <div className="section-heading centered">
            <span>HOW IT WORKS</span>

            <h2>
              Getting your device fixed is simple
            </h2>

            <p>
              A smooth three-step process from problem
              to repaired device.
            </p>
          </div>

          <div className="steps">
            <article className="step-card">
              <div className="step-number">01</div>

              <div className="step-icon">
                <StepIcon type="write" />
              </div>

              <h3>Tell us the problem</h3>

              <p>
                Submit your repair request with a few
                simple details.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">02</div>

              <div className="step-icon">
                <StepIcon type="check" />
              </div>

              <h3>Get a repair plan</h3>

              <p>
                Our team reviews the issue and contacts
                you with the next steps.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">03</div>

              <div className="step-icon">
                <StepIcon type="tools" />
              </div>

              <h3>Get it fixed</h3>

              <p>
                Your device gets the repair it needs
                without unnecessary replacement.
              </p>
            </article>
          </div>
        </section>

        <section
          className="why-section"
          id="why-us"
        >
          <div className="why-content">
            <span>WHY CHOOSE US</span>

            <h2>
              Straightforward repairs
              <br />
              with clear communication.
            </h2>

            <p>
              Your devices deserve a second chance. We
              focus on clear communication and a simple
              repair-request process.
            </p>

            <div className="why-grid">
              <div>
                <strong>
                  ✓ Service Experience
                </strong>

                <span>
                  Repair details are reviewed before work begins.
                </span>
              </div>

              <div>
                <strong>✓ Parts Options</strong>

                <span>
                  Available parts options can be discussed for your repair.
                </span>
              </div>

              <div>
                <strong>✓ Service Updates</strong>

                <span>
                  We’ll contact you about the next steps.
                </span>
              </div>

              <div>
                <strong>✓ Warranty Terms</strong>

                <span>
                  Warranty availability and terms depend on the repair.
                </span>
              </div>
            </div>
          </div>

          <div
            className="why-orbit"
            aria-hidden="true"
          >
            <div className="orbit-ring ring-one" />
            <div className="orbit-ring ring-two" />
            <div className="orbit-core">✓</div>
          </div>
        </section>

        <section
          className="contact-cta"
          id="contact"
        >
          <div>
            <span>READY WHEN YOU ARE</span>

            <h2>
              Let's get your device
              <br />
              working again.
            </h2>
          </div>

          <button
            className="primary-cta light"
            onClick={() => openRepairForm()}
          >
            Book a Repair <span>→</span>
          </button>
        </section>
      </main>

      <footer>
        <a className="logo" href="#">
          <span className="logo-box">F</span>

          <span>
            FixMy<span className="green">Stuff</span>
          </span>
        </a>

        <p>Fix it. Don't replace it.</p>

        <span>© 2026 FixMyStuff</span>
      </footer>

      {showForm && (
        <div
          className="modal-overlay"
          onClick={closeRepairForm}
        >
          <div
            className="repair-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={closeRepairForm}
              aria-label="Close"
            >
              ×
            </button>

            <div className="modal-heading">
              <span>BOOK A REPAIR</span>

              <h2>Tell us what needs fixing</h2>

              <p>
                Fill in your details and we'll get back
                to you shortly.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Name <i>*</i>
                  </label>

                  <input
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Phone <i>*</i>
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Service <i>*</i>
                  </label>

                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select service
                    </option>

                    {serviceOptions.map((service) => (
                      <option
                        key={service}
                        value={service}
                      >
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Device</label>

                <input
                  name="device"
                  value={form.device}
                  onChange={handleChange}
                  placeholder="e.g. iPhone 15, Dell Laptop"
                />
              </div>

              <div className="form-group">
                <label>
                  What needs fixing? <i>*</i>
                </label>

                <textarea
                  name="issue_description"
                  value={form.issue_description}
                  onChange={handleChange}
                  placeholder="Describe the problem..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Address <i>*</i>
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Your address"
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Date</label>

                  <input
                    type="date"
                    name="preferred_date"
                    value={form.preferred_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Time</label>

                  <select
                    name="preferred_time"
                    value={form.preferred_time}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select time
                    </option>

                    {timeOptions.map((time) => (
                      <option
                        key={time}
                        value={time}
                      >
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {message && (
                <div
                  className={`form-message ${
                    message.startsWith("Something")
                      ? "error"
                      : ""
                  }`}
                >
                  <span>
                    {message.startsWith("Something")
                      ? "!"
                      : "✓"}
                  </span>

                  {message}
                </div>
              )}

              <button
                className="submit-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit Repair Request{" "}
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ROUTER
========================================================= */

function App() {
  const isAdmin =
    window.location.pathname.toLowerCase() === "/admin";

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <Website />;
}

export default App;
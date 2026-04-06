export default [
  // * Authentication
  { method: "PATCH", path: "/api/auth/" },
  { method: "POST", path: "/api/auth/" },

  // * Contract
  { method: "POST", path: "/api/contract" },
  { method: "PATCH", path: "/api/contract" },
  { method: "POST", path: "/api/contract/list-ids" },
  { method: "GET", path: "/api/contract/get-by-token" },

  // * Mail
  { method: "POST", path: "/api/mail/send-contract" },
  { method: "POST", path: "/api/mail/report-bug" },
];


import { useEffect, useState } from "react";
import { checkHealth } from "api/health";

/**
 * Startup placeholder page.
 * Displays "ERP System Starting..." with a backend connection status indicator.
 */
const StartupPage = () => {
  const [backendStatus, setBackendStatus] = useState<string>("checking...");
  const [serviceName, setServiceName] = useState<string>("");

  useEffect(() => {
    checkHealth()
      .then((data) => {
        setBackendStatus(data.status);
        setServiceName(data.service);
      })
      .catch(() => {
        setBackendStatus("offline");
      });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        fontFamily: "'Inter', 'Geist', sans-serif",
        color: "#f1f5f9",
      }}
    >
      {/* Pulse ring animation */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: "3px solid rgba(99, 102, 241, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
          animation: "pulse 2s ease-in-out infinite",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)",
          }}
        />
      </div>

      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginBottom: 8,
          background: "linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 50%, #818cf8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        ERP System Starting...
      </h1>

      <p
        style={{
          fontSize: 14,
          color: "#94a3b8",
          marginBottom: 40,
          letterSpacing: "0.02em",
        }}
      >
        Initializing platform services
      </p>

      {/* Backend status indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 20px",
          borderRadius: 8,
          background: "rgba(30, 41, 59, 0.8)",
          border: "1px solid rgba(51, 65, 85, 0.5)",
          fontSize: 13,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background:
              backendStatus === "ok"
                ? "#22c55e"
                : backendStatus === "offline"
                ? "#ef4444"
                : "#eab308",
            boxShadow:
              backendStatus === "ok"
                ? "0 0 8px rgba(34, 197, 94, 0.5)"
                : "none",
          }}
        />
        <span style={{ color: "#cbd5e1" }}>
          Backend: {backendStatus === "ok" ? "Connected" : backendStatus}
        </span>
        {serviceName && (
          <span style={{ color: "#64748b", marginLeft: 4 }}>
            — {serviceName}
          </span>
        )}
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default StartupPage;

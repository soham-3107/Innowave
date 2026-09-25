import { NextRequest, NextResponse } from "next/server";

// In-memory serverless cache for fast audit trail inspection in development
let serverlessAuditLogs: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_id = null,
      user_email = "anonymous",
      user_role = "mariner",
      action = "VIEW_EXACT_IMBL_COORDINATES",
      resource_type = "IMBL_SENSITIVE_TELEMETRY",
      details = {},
      ip_address = req.headers.get("x-forwarded-for") || "127.0.0.1"
    } = body;

    const logEntry = {
      id: Date.now(),
      user_id,
      user_email,
      user_role,
      action,
      resource_type,
      details,
      ip_address,
      created_at: new Date().toISOString()
    };

    serverlessAuditLogs.unshift(logEntry);
    if (serverlessAuditLogs.length > 200) {
      serverlessAuditLogs = serverlessAuditLogs.slice(0, 200);
    }

    console.log(
      `[SECURITY-AUDIT-LOG] Recorded data access event:\n` +
      `  🛡️ Action: ${action}\n` +
      `  👤 User: ${user_email} (Role: ${user_role})\n` +
      `  📍 Resource: ${resource_type}\n` +
      `  📝 Details:`, details
    );

    // Also forward to FastAPI backend if active
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      fetch(`${backendUrl}/api/security/log-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(1500)
      }).catch(() => {});
    } catch {
      // Background forward fail is non-blocking
    }

    return NextResponse.json({
      status: "logged",
      log_id: logEntry.id,
      action,
      created_at: logEntry.created_at
    });
  } catch (error: any) {
    console.error("[SECURITY-LOG-ERROR] Failed to process log access route:", error);
    return NextResponse.json({ error: "Failed to log data access", details: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "success",
    count: serverlessAuditLogs.length,
    logs: serverlessAuditLogs
  });
}

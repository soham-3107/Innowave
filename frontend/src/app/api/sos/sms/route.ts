import { NextRequest, NextResponse } from "next/server";

function maskCredential(val?: string, prefixLen = 4, suffixLen = 4): string {
  if (!val) return "MISSING / NOT SET";
  const clean = val.trim();
  if (!clean) return "EMPTY STRING";
  if (clean.length <= prefixLen + suffixLen) return `SET (length ${clean.length})`;
  return `${clean.slice(0, prefixLen)}...${clean.slice(-suffixLen)} (length ${clean.length})`;
}

function formatE164Phone(phoneStr: string): string {
  const raw = String(phoneStr || "").trim();
  const digits = raw.replace(/\D/g, "");

  if (raw.startsWith("+")) {
    return `+${digits}`;
  }

  // If 10 digits without country code, default to India (+91)
  if (digits.length === 10) {
    return `+91${digits}`;
  } else if (digits.length > 10) {
    return `+${digits}`;
  } else {
    return `+91${digits}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recipient_name = "Emergency Kin",
      recipient_phone = "+91 98201 98765",
      sender_name = "Capt. Rajesh Patil",
      vessel_name = "Matsya Sagar IV",
      lat = 18.92,
      lon = 72.83,
      region = "Mumbai Coast",
      danger_score = 45,
      sos_id = "SOS-DEFAULT",
      timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    } = body;

    const latNum = typeof lat === "number" ? lat : parseFloat(lat) || 18.92;
    const lonNum = typeof lon === "number" ? lon : parseFloat(lon) || 72.83;
    const maps_link = `https://maps.google.com/?q=${latNum.toFixed(5)},${lonNum.toFixed(5)}`;

    const sms_text = 
      `🚨 [INNOWAVE MARITIME SOS ALERT]\n` +
      `EMERGENCY: Captain ${sender_name} (${vessel_name}) has triggered an active SOS distress beacon at sea!\n` +
      `📍 Last Known Location: ${latNum.toFixed(5)}°N, ${lonNum.toFixed(5)}°E (${region})\n` +
      `🗺️ Live Coordinates Map: ${maps_link}\n` +
      `⚠️ Danger Index: ${danger_score}/100\n` +
      `⏱️ Time: ${timestamp} (Ref: ${sos_id})\n` +
      `📡 Coast Guard Distress Helpline: 1554 / VHF CH 16\n` +
      `Maritime SAR & Search teams have been alerted.`;

    let provider = "INNOWAVE Marine Cellular & Satellite SMS Gateway";
    let gateway_id = `SMS-GW-${Math.floor(100000 + Math.random() * 900000)}`;
    let delivery_status = "DELIVERED (SIMULATED)";

    // Step 4: Confirm environment variables at runtime with masked values
    const twilioSid = (process.env.TWILIO_ACCOUNT_SID || "").trim();
    const twilioAuth = (process.env.TWILIO_AUTH_TOKEN || "").trim();
    const twilioFrom = (process.env.TWILIO_PHONE_NUMBER || "").trim();

    const maskedSid = maskCredential(twilioSid, 4, 4);
    const maskedAuth = maskCredential(twilioAuth, 2, 2);
    const maskedFrom = maskCredential(twilioFrom, 3, 4);

    console.log(
      `[TWILIO-ENV-CHECK] Runtime Status: ` +
      `TWILIO_ACCOUNT_SID=${maskedSid}, ` +
      `TWILIO_AUTH_TOKEN=${maskedAuth}, ` +
      `TWILIO_PHONE_NUMBER=${maskedFrom}`
    );

    const diagnostics: any = {
      env_check: {
        account_sid_present: Boolean(twilioSid),
        auth_token_present: Boolean(twilioAuth),
        phone_number_present: Boolean(twilioFrom),
        account_sid_masked: maskedSid,
        phone_number_masked: maskedFrom,
        all_credentials_set: Boolean(twilioSid && twilioAuth && twilioFrom)
      },
      target_phone_raw: recipient_phone,
      target_phone_formatted: null,
      twilio_attempted: false,
      twilio_success: false,
      twilio_sid: null,
      twilio_status: null,
      twilio_error_code: null,
      twilio_error_message: null,
      twilio_more_info: null,
      http_status: null
    };

    // Step 1: Format and log exact recipient phone number right before sending
    const formattedRecipient = formatE164Phone(recipient_phone);
    diagnostics.target_phone_formatted = formattedRecipient;

    if (twilioSid && twilioAuth && twilioFrom) {
      diagnostics.twilio_attempted = true;
      console.log(
        `[TWILIO-PRE-SEND] Dispatching Live SOS SMS:\n` +
        `  ➡️ To (Formatted E.164): ${formattedRecipient} (Raw: ${recipient_phone})\n` +
        `  ⬅️ From (Twilio Sender): ${twilioFrom}\n` +
        `  🔑 Account SID: ${maskedSid}\n` +
        `  📝 Message Length: ${sms_text.length} chars`
      );

      try {
        const authStr = Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64");
        const formParams = new URLSearchParams();
        formParams.append("To", formattedRecipient);
        formParams.append("From", twilioFrom);
        formParams.append("Body", sms_text);

        console.log(`[TWILIO-DISPATCH] Sending POST to https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json...`);

        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${authStr}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formParams.toString()
        });

        const twData = await twilioRes.json().catch(() => ({}));

        if (twilioRes.ok) {
          // Step 3: Log Twilio message SID and status immediately after success
          console.log(
            `[TWILIO-SUCCESS] Twilio SMS dispatched successfully!\n` +
            `  ✅ Message SID: ${twData.sid}\n` +
            `  📊 Status: ${twData.status}\n` +
            `  📱 To: ${twData.to}\n` +
            `  📞 From: ${twData.from}\n` +
            `  📅 Date Created: ${twData.date_created}`
          );
          provider = "Twilio Cloud SMS Gateway";
          gateway_id = twData.sid || `TW-${Math.floor(100000 + Math.random() * 900000)}`;
          delivery_status = twData.status ? String(twData.status).toUpperCase() : "DELIVERED";

          diagnostics.twilio_success = true;
          diagnostics.twilio_sid = twData.sid;
          diagnostics.twilio_status = twData.status;
          diagnostics.http_status = twilioRes.status;
        } else {
          // Step 2: Log full Twilio exception including error code and message
          const errCode = twData.code;
          const errMsg = twData.message || twilioRes.statusText || "Twilio request failed";
          const errMore = twData.more_info || "";

          console.error(
            `[TWILIO-ERROR] Twilio API Rejected SMS Dispatch!\n` +
            `  ❌ HTTP Status: ${twilioRes.status} (${twilioRes.statusText})\n` +
            `  ⚠️ Twilio Error Code: ${errCode}\n` +
            `  📝 Error Message: ${errMsg}\n` +
            `  🔗 More Info: ${errMore}\n` +
            `  📱 Recipient Attempted: ${formattedRecipient}\n` +
            `  📞 Sender: ${twilioFrom}\n` +
            `  📄 Raw Twilio Response:`, twData
          );

          diagnostics.twilio_error_code = errCode;
          diagnostics.twilio_error_message = errMsg;
          diagnostics.twilio_more_info = errMore;
          diagnostics.http_status = twilioRes.status;
        }
      } catch (ex: any) {
        // Step 2: Catch network/client exception
        console.error(
          `[TWILIO-EXCEPTION] Exception during Twilio SMS dispatch:\n` +
          `  ❌ Type: ${ex?.name || "Error"}\n` +
          `  📝 Message: ${ex?.message || ex}\n` +
          `  📱 Target: ${formattedRecipient}`,
          ex
        );
        diagnostics.twilio_error_message = ex?.message || String(ex);
      }
    } else {
      console.warn(
        `[TWILIO-CONFIG-WARNING] Twilio SMS skipped: Environment variables are not fully configured.\n` +
        `  TWILIO_ACCOUNT_SID: ${maskedSid}\n` +
        `  TWILIO_AUTH_TOKEN: ${maskedAuth}\n` +
        `  TWILIO_PHONE_NUMBER: ${maskedFrom}\n` +
        `  👉 To send live SMS, set these variables in Vercel or your local .env.`
      );
    }

    // 2. Check Fast2SMS integration as secondary live gateway
    const fast2smsKey = (process.env.FAST2SMS_API_KEY || "").trim();
    if (fast2smsKey && !diagnostics.twilio_success) {
      try {
        const cleanNum = recipient_phone.replace(/\D/g, "").slice(-10);
        const f2sParams = new URLSearchParams();
        f2sParams.append("authorization", fast2smsKey);
        f2sParams.append("message", sms_text);
        f2sParams.append("language", "english");
        f2sParams.append("route", "q");
        f2sParams.append("numbers", cleanNum);

        const f2sRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: f2sParams.toString()
        });

        if (f2sRes.ok) {
          const f2sData = await f2sRes.json();
          provider = "Fast2SMS India Gateway";
          gateway_id = `F2S-${f2sData.request_id || Math.floor(100000 + Math.random() * 900000)}`;
          delivery_status = "DELIVERED";
        }
      } catch (ex) {
        console.warn("[FAST2SMS-ERROR] Fast2SMS dispatch note:", ex);
      }
    }

    return NextResponse.json({
      status: "success",
      delivery_status,
      gateway_id,
      provider,
      recipient_name,
      recipient_phone,
      sender_name,
      vessel_name,
      sms_text,
      maps_link,
      lat: latNum,
      lon: lonNum,
      region,
      danger_score,
      timestamp,
      sos_id,
      diagnostics
    });
  } catch (err: any) {
    console.error("[SOS-SERVERLESS-ERROR] Failed to dispatch SOS SMS:", err);
    return NextResponse.json({ error: "Failed to dispatch SOS SMS", details: err.message }, { status: 500 });
  }
}

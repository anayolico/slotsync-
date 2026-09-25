import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings


def _send_smtp_sync(to_email: str, subject: str, html_content: str, text_content: str):
    """Synchronous worker executed in a thread pool."""
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        print(f"\n[EMAIL SIMULATION] To: {to_email} | Subject: {subject}\n{text_content}\n")
        return True

    from_addr = settings.SMTP_USER if "gmail.com" in (settings.SMTP_HOST or "").lower() else (settings.EMAILS_FROM_EMAIL or settings.SMTP_USER)
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.EMAILS_FROM_NAME} <{from_addr}>"
    msg["To"] = to_email

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    cleaned_password = settings.SMTP_PASSWORD.replace(" ", "") if settings.SMTP_PASSWORD else ""

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
        if settings.SMTP_TLS:
            server.starttls()
        if settings.SMTP_USER and cleaned_password:
            server.login(settings.SMTP_USER, cleaned_password)
        server.sendmail(from_addr, [to_email], msg.as_string())
    return True


async def send_otp_email(to_email: str, otp_code: str):
    """
    Sends a styled SlotSync 6-digit OTP verification email.
    """
    subject = f"Your SlotSync Verification Code: {otp_code}"
    
    text_content = f"""
SlotSync Verification Code
---------------------------
Your 6-digit verification code is: {otp_code}

This code expires in 10 minutes. If you did not request this code, please ignore this email.
"""

    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SlotSync Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          
          <!-- Brand Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 36px 20px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: rgba(255,255,255,0.15); border-radius: 16px; padding: 12px 20px; border: 1px solid rgba(255,255,255,0.25);">
                    <span style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">SLOTSYNC</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="color: #e0e7ff; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">Smart Appointment & Booking Engine</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; text-align: center;">
              <h1 style="margin: 0 0 12px 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                Verify Your Account
              </h1>
              <p style="margin: 0 0 28px 0; color: #94a3b8; font-size: 14px; line-height: 22px;">
                Welcome to SlotSync! Use the 6-digit verification code below to verify your email address and activate your account.
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; border-radius: 16px; border: 2px dashed #6366f1; margin-bottom: 28px;">
                <tr>
                  <td align="center" style="padding: 24px 15px;">
                    <div style="font-size: 11px; font-weight: 700; color: #818cf8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
                      Your Security OTP
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #ffffff; padding-left: 10px;">
                      {otp_code}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Security Notice -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(99, 102, 241, 0.08); border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.2); margin-bottom: 28px;">
                <tr>
                  <td style="padding: 14px 18px; text-align: left;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="24" valign="top" style="font-size: 16px;">⏱️</td>
                        <td style="padding-left: 10px; color: #cbd5e1; font-size: 12px; line-height: 18px;">
                          This code expires in <strong style="color: #ffffff;">10 minutes</strong>. For your security, never share this code with anyone.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 18px;">
                If you did not request this verification, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; border-top: 1px solid #334155; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 11px; line-height: 16px;">
                © 2026 SlotSync Inc. All rights reserved.<br>
                Automated notification from SlotSync Security Service.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    try:
        await asyncio.to_thread(_send_smtp_sync, to_email, subject, html_content, text_content)
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send OTP email: {e}")
        # Always print to console as fallback during dev/VPS testing
        print(f"[FALLBACK OTP CODE FOR {to_email}]: {otp_code}")
        return False


async def send_password_reset_email(to_email: str, otp_code: str, user_name: str = "User"):
    """
    Sends a dedicated SlotSync password reset 6-digit OTP verification email.
    """
    subject = f"Your SlotSync Password Reset Code: {otp_code}"
    
    text_content = f"""
SlotSync Password Reset
-----------------------
Hello {user_name},

We received a request to reset the password for your SlotSync account.
Your 6-digit password reset code is: {otp_code}

This code expires in 10 minutes. If you did not request a password reset, please ignore this email or contact support.
"""

    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SlotSync Password Reset</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
          
          <!-- Brand Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); padding: 36px 20px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: rgba(255,255,255,0.15); border-radius: 16px; padding: 12px 20px; border: 1px solid rgba(255,255,255,0.25);">
                    <span style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">SLOTSYNC</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="color: #e0e7ff; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">Account Security & Recovery</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; text-align: center;">
              <h1 style="margin: 0 0 12px 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                Reset Your Password
              </h1>
              <p style="margin: 0 0 28px 0; color: #94a3b8; font-size: 14px; line-height: 22px;">
                Hello <strong style="color: #ffffff;">{user_name}</strong>, we received a request to reset the password for your SlotSync account. Use the 6-digit verification code below to proceed:
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; border-radius: 16px; border: 2px dashed #818cf8; margin-bottom: 28px;">
                <tr>
                  <td align="center" style="padding: 24px 15px;">
                    <div style="font-size: 11px; font-weight: 700; color: #a5b4fc; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
                      Your Password Reset Code
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #ffffff; padding-left: 10px;">
                      {otp_code}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Security Notice -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(99, 102, 241, 0.08); border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.2); margin-bottom: 28px;">
                <tr>
                  <td style="padding: 14px 18px; text-align: left;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="24" valign="top" style="font-size: 16px;">⏱️</td>
                        <td style="padding-left: 10px; color: #cbd5e1; font-size: 12px; line-height: 18px;">
                          This code expires in <strong style="color: #ffffff;">10 minutes</strong>. For your security, never share this code with anyone.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 18px;">
                If you did not request a password reset, you can safely ignore this email. Your current password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; border-top: 1px solid #334155; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 11px; line-height: 16px;">
                © 2026 SlotSync Inc. All rights reserved.<br>
                Automated security notification from SlotSync Engine.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    try:
        await asyncio.to_thread(_send_smtp_sync, to_email, subject, html_content, text_content)
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send Password Reset OTP email: {e}")
        # Always print to console as fallback during dev/VPS testing
        print(f"[FALLBACK PASSWORD RESET OTP CODE FOR {to_email}]: {otp_code}")
        return False


async def send_account_deletion_email(to_email: str, otp_code: str, user_name: str = "User"):
    """
    Sends a high-security account deletion verification 6-digit OTP email.
    """
    subject = f"Security Alert: Your Account Deletion Code is {otp_code}"
    
    text_content = f"""
SlotSync - Permanent Account Deletion Request
---------------------------------------------
Hello {user_name},

We received a request to permanently delete and close your SlotSync account.
All your profile data, schedule availability rules, and appointment history will be permanently wiped.

Your 6-digit Account Closure Verification Code is: {otp_code}

This code expires in 10 minutes. If you did NOT request to delete your account, please immediately secure your account and disregard this message.
"""

    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Permanent Account Deletion Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #1e293b; border-radius: 20px; border: 1px solid #ef4444; overflow: hidden; box-shadow: 0 20px 40px rgba(239, 68, 68, 0.2);">
          
          <!-- Danger Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 36px 20px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: rgba(255,255,255,0.15); border-radius: 16px; padding: 12px 20px; border: 1px solid rgba(255,255,255,0.25);">
                    <span style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">SLOTSYNC</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="color: #fee2e2; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">⚠️ Critical Action: Account Closure</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; text-align: center;">
              <h1 style="margin: 0 0 12px 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                Verify Account Deletion
              </h1>
              <p style="margin: 0 0 24px 0; color: #cbd5e1; font-size: 14px; line-height: 22px;">
                Hello <strong style="color: #ffffff;">{user_name}</strong>,<br>
                You requested to permanently close your SlotSync account. This action cannot be undone. All your booked appointments, active schedule rules, and creator data will be permanently wiped.
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; border-radius: 16px; border: 2px dashed #ef4444; margin-bottom: 28px;">
                <tr>
                  <td align="center" style="padding: 24px 15px;">
                    <div style="font-size: 11px; font-weight: 700; color: #fca5a5; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
                      Your Account Closure Code
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #ef4444; padding-left: 10px;">
                      {otp_code}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Warning Notice -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(239, 68, 68, 0.1); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.3); margin-bottom: 28px;">
                <tr>
                  <td style="padding: 14px 18px; text-align: left;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="24" valign="top" style="font-size: 16px;">🛑</td>
                        <td style="padding-left: 10px; color: #fca5a5; font-size: 12px; line-height: 18px;">
                          This code expires in <strong style="color: #ffffff;">10 minutes</strong>. If you did not make this request, please do NOT share this code and change your password immediately.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 18px;">
                If you choose not to enter this code, your account will remain active without changes.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; border-top: 1px solid #334155; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 11px; line-height: 16px;">
                © 2026 SlotSync Inc. All rights reserved.<br>
                Security & Account Management
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    try:
        await asyncio.to_thread(_send_smtp_sync, to_email, subject, html_content, text_content)
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send Account Deletion OTP email: {e}")
        # Always print to console as fallback during dev/VPS testing
        print(f"[FALLBACK ACCOUNT DELETION OTP CODE FOR {to_email}]: {otp_code}")
        return False



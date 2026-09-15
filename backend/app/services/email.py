"""
Brevo (formerly Sendinblue) transactional email service.

All configuration comes from environment variables.
No API keys or secrets are stored in source code.

The BrevoEmailService class is thin enough to mock cleanly in tests.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from app.core.config import get_settings

if TYPE_CHECKING:
    pass  # avoid circular imports for type hints

logger = logging.getLogger(__name__)


class BrevoEmailService:
    """
    Abstraction over the Brevo transactional email API with local capture support.

    In tests, pass a mock for the underlying SDK client so no real
    HTTP call is ever made.
    """

    # In-memory store for local testing/verification
    captured_emails: list[dict[str, Any]] = []

    def __init__(self) -> None:
        self._settings = get_settings()

    def _get_api_instance(self):  # type: ignore[return]
        """
        Lazily construct the Brevo TransactionalEmailsApi.

        Lazy so that tests can patch before instantiation.
        """
        import sib_api_v3_sdk
        from sib_api_v3_sdk.rest import ApiException  # noqa: F401

        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key["api-key"] = self._settings.brevo_api_key
        return sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )

    def _record_captured_email(
        self,
        *,
        to_email: str,
        to_name: str,
        subject: str,
        html: str,
        token: str | None = None,
        link: str | None = None,
        email_type: str = "generic"
    ) -> None:
        """Record email in local capture store for E2E testing and diagnostics."""
        entry = {
            "to_email": to_email,
            "to_name": to_name,
            "subject": subject,
            "token": token,
            "link": link,
            "email_type": email_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "html_snippet": html[:300]
        }
        self.captured_emails.append(entry)

        # Also persist to media/captured_emails.json for inspection
        try:
            media_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "media"))
            os.makedirs(media_dir, exist_ok=True)
            capture_file = os.path.join(media_dir, "captured_emails.json")
            existing = []
            if os.path.exists(capture_file):
                try:
                    with open(capture_file, "r", encoding="utf-8") as f:
                        existing = json.load(f)
                except Exception:
                    existing = []
            existing.append(entry)
            with open(capture_file, "w", encoding="utf-8") as f:
                json.dump(existing[-50:], f, indent=2)
        except Exception as e:
            logger.debug("Could not write to captured_emails.json: %s", e)

    def _send(
        self,
        *,
        to_email: str,
        to_name: str,
        subject: str,
        html: str,
        token: str | None = None,
        link: str | None = None,
        email_type: str = "generic"
    ) -> None:
        """Send a single transactional email via Brevo (synchronous SDK call)."""
        self._record_captured_email(
            to_email=to_email,
            to_name=to_name,
            subject=subject,
            html=html,
            token=token,
            link=link,
            email_type=email_type
        )

        if not self._settings.brevo_api_key:
            logger.info("Brevo API key not configured. Email to %s captured locally in mock/dev mode (subject: %r)", to_email, subject)
            return

        import sib_api_v3_sdk

        sender = {"name": self._settings.brevo_sender_name, "email": self._settings.brevo_sender_email}
        recipients = [{"email": to_email, "name": to_name}]

        send_email = sib_api_v3_sdk.SendSmtpEmail(
            sender=sender,
            to=recipients,
            subject=subject,
            html_content=html,
        )

        api = self._get_api_instance()
        try:
            api.send_transac_email(send_email)
            logger.info("Brevo transactional email dispatched to %s — subject: %r (link: %s)", to_email, subject, link)
        except Exception as exc:
            # Log with sender info for debugging verification issues
            logger.error("Brevo send failed to %s: %s (sender=%s)", to_email, exc, self._settings.brevo_sender_email)
            raise

    def send_verification_email(
        self, *, to_email: str, to_name: str, token: str
    ) -> None:
        """Send an email-verification code/link to a newly registered user."""
        settings = self._settings
        link = f"{settings.frontend_base_url}/verify-email?token={token}&email={to_email}"
        html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                <h2 style="color: #0f5132; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.04em;">SWACHHLENS</h2>
            </div>
            <h3 style="color: #0f5132; margin-top: 0;">Welcome to SwachhLens, {to_name}!</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">Please verify your email address to activate your civic sanitation account.</p>
            <p style="font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Your 6-digit verification code is:</p>
            <div style="margin: 20px 0; text-align: center;">
                <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #168a5b; background: #eaf6ef; padding: 12px 28px; border-radius: 8px; border: 1px solid #c2e7d3; font-family: monospace;">{token}</span>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">Or verify directly by clicking the button below:</p>
            <div style="margin: 20px 0; text-align: center;">
                <a href="{link}" style="background-color: #168a5b; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Verify Email</a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin: 4px 0;">This verification code expires in {settings.otp_expire_minutes} minutes.</p>
            <p style="font-size: 12px; color: #94a3b8; margin: 4px 0;">If you did not create this account, you can safely ignore this email.</p>
        </div>
        """
        self._send(
            to_email=to_email,
            to_name=to_name,
            subject="Verify your SwachhLens email address",
            html=html,
            token=token,
            link=link,
            email_type="verification"
        )

    def send_reactivation_email(
        self, *, to_email: str, to_name: str, token: str
    ) -> None:
        """Send an account-reactivation code/link to a deactivated user."""
        settings = self._settings
        link = f"{settings.frontend_base_url}/verify-email?token={token}&email={to_email}&mode=reactivate"
        html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                <h2 style="color: #0f5132; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.04em;">SWACHHLENS</h2>
            </div>
            <h3 style="color: #0f5132; margin-top: 0;">Reactivate Your SwachhLens Account</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello {to_name}, we received a request to reactivate your SwachhLens civic account.</p>
            <p style="font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Your 6-digit account reactivation code is:</p>
            <div style="margin: 20px 0; text-align: center;">
                <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #168a5b; background: #eaf6ef; padding: 12px 28px; border-radius: 8px; border: 1px solid #c2e7d3; font-family: monospace;">{token}</span>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">Or reactivate directly by clicking the button below:</p>
            <div style="margin: 20px 0; text-align: center;">
                <a href="{link}" style="background-color: #168a5b; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Reactivate Account</a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin: 4px 0;">This reactivation code expires in {settings.otp_expire_minutes} minutes.</p>
            <p style="font-size: 12px; color: #94a3b8; margin: 4px 0;">If you did not request to reactivate your account, please ignore this email.</p>
        </div>
        """
        self._send(
            to_email=to_email,
            to_name=to_name,
            subject="Reactivate your SwachhLens account",
            html=html,
            token=token,
            link=link,
            email_type="reactivation"
        )

    def send_password_reset_email(
        self,
        *,
        to_email: str,
        to_name: str,
        token: str,
        base_url: str | None = None,
        user_role: str | None = None
    ) -> None:
        """
        Send a password-reset link and token.

        Dynamically selects the appropriate frontend base URL:
        - Municipal roles ('commissioner', 'officer') or port 3000 -> Municipal Dashboard (http://localhost:3000)
        - Citizens -> Citizen Mobile (http://localhost:5173)
        """
        settings = self._settings

        # Determine effective base URL
        if base_url:
            effective_base_url = base_url.rstrip("/")
        elif user_role in ("officer", "commissioner"):
            effective_base_url = settings.dashboard_base_url.rstrip("/") if settings.dashboard_base_url else "http://localhost:3000"
        else:
            effective_base_url = settings.frontend_base_url.rstrip("/") if settings.frontend_base_url else "http://localhost:5173"

        link = f"{effective_base_url}/reset-password?token={token}"

        role_badge = "Municipal Authority" if user_role in ("officer", "commissioner") else "Citizen Account"

        html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
            <div style="margin-bottom: 16px;">
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #168a5b; background-color: #eaf6ef; padding: 4px 10px; border-radius: 20px; border: 1px solid #c2e7d3;">{role_badge}</span>
            </div>
            <h2 style="color: #0f5132; margin: 12px 0 6px 0; font-size: 22px; font-weight: 800;">Reset your SwachhLens password</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello <strong>{to_name}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">We received a request to reset the password for your SwachhLens account (<strong>{to_email}</strong>).</p>
            
            <div style="margin: 24px 0; text-align: center;">
                <a href="{link}" style="background-color: #168a5b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(22, 138, 91, 0.25);">Reset Password</a>
            </div>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 20px 0;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Direct Reset Token</div>
                <div style="font-family: monospace; font-size: 13px; font-weight: 600; color: #0f172a; word-break: break-all;">{token}</div>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #64748b;">
                Or paste this link into your browser: <br />
                <a href="{link}" style="color: #168a5b; font-size: 12px; word-break: break-all;">{link}</a>
            </p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin: 4px 0;">This password reset link expires in {settings.password_reset_expire_minutes} minutes.</p>
            <p style="font-size: 12px; color: #94a3b8; margin: 4px 0;">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
        </div>
        """

        self._send(
            to_email=to_email,
            to_name=to_name,
            subject="Reset your SwachhLens password",
            html=html,
            token=token,
            link=link,
            email_type="password_reset"
        )

    def send_report_status_email(
        self, *, to_email: str, to_name: str, report_id: str, event_type: str, title: str, message: str
    ) -> None:
        """Send an email notification regarding a report status update."""
        settings = self._settings
        link = f"{settings.frontend_base_url}/reports/{report_id}"
        html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
            <h2 style="color: #0f5132; margin-top: 0;">SwachhLens Report Update</h2>
            <p style="font-size: 14px; color: #475569;">Hello {to_name},</p>
            <h3 style="color: #168a5b; font-size: 16px;">{title}</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">{message}</p>
            <div style="margin: 20px 0; text-align: center;">
                <a href="{link}" style="background-color: #168a5b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Report Status</a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8;">Thank you for helping keep our civic community clean!</p>
            <p style="font-size: 12px; color: #94a3b8;">- The SwachhLens Team</p>
        </div>
        """
        self._send(
            to_email=to_email,
            to_name=to_name,
            subject=f"SwachhLens Update: {title}",
            html=html,
            link=link,
            email_type="report_status"
        )


# Module-level singleton — replace in tests via dependency override or monkeypatch.
def get_email_service() -> BrevoEmailService:
    """FastAPI dependency that returns the email service singleton."""
    return BrevoEmailService()

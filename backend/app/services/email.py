"""
Brevo (formerly Sendinblue) transactional email service.

All configuration comes from environment variables.
No API keys or secrets are stored in source code.

The BrevoEmailService class is thin enough to mock cleanly in tests.
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from app.core.config import get_settings

if TYPE_CHECKING:
    pass  # avoid circular imports for type hints

logger = logging.getLogger(__name__)


class BrevoEmailService:
    """
    Abstraction over the Brevo transactional email API.

    In tests, pass a mock for the underlying SDK client so no real
    HTTP call is ever made.

    Usage
    -----
        service = BrevoEmailService()
        await service.send_verification_email(user_email, user_name, token)
    """

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

    def _send(self, *, to_email: str, to_name: str, subject: str, html: str) -> None:
        """Send a single transactional email via Brevo (synchronous SDK call)."""
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
            logger.info("Brevo email sent to %s — subject: %r", to_email, subject)
        except Exception as exc:
            # Log but don't crash the API — email failure should not block
            # the HTTP response. Callers may choose to re-raise if critical.
            logger.error("Brevo send failed to %s: %s", to_email, exc)
            raise

    def send_verification_email(
        self, *, to_email: str, to_name: str, token: str
    ) -> None:
        """Send an email-verification code/link to a newly registered user."""
        settings = self._settings
        link = f"{settings.frontend_base_url}/verify-email?token={token}&email={to_email}"
        html = f"""
        <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #0f5132;">Welcome to SwachhLens, {to_name}!</h2>
            <p>Please verify your email address to activate your account.</p>
            <p>Your 6-digit verification code is:</p>
            <div style="margin: 20px 0; text-align: center;">
                <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #168a5b; background: #eaf6ef; padding: 12px 28px; border-radius: 8px; border: 1px solid #c2e7d3;">{token}</span>
            </div>
            <p>Or verify directly by clicking the button below:</p>
            <div style="margin: 16px 0; text-align: center;">
                <a href="{link}" style="background-color: #168a5b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email</a>
            </div>
            <p style="font-size: 13px; color: #64748b;">This verification code expires in {settings.otp_expire_minutes} minutes.</p>
            <p style="font-size: 13px; color: #64748b;">If you did not create this account, you can safely ignore this email.</p>
        </div>
        """
        self._send(
            to_email=to_email,
            to_name=to_name,
            subject="Verify your SwachhLens email address",
            html=html,
        )

    def send_password_reset_email(
        self, *, to_email: str, to_name: str, token: str
    ) -> None:
        """Send a password-reset link."""
        settings = self._settings
        link = f"{settings.frontend_base_url}/reset-password?token={token}"
        html = f"""
        <h2>Reset your SwachhLens password</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="{link}">Reset Password</a></p>
        <p>This link expires in {settings.password_reset_expire_minutes} minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        """
        self._send(
            to_email=to_email,
            to_name=to_name,
            subject="Reset your SwachhLens password",
            html=html,
        )

    def send_report_status_email(
        self, *, to_email: str, to_name: str, report_id: str, event_type: str, title: str, message: str
    ) -> None:
        """Send an email notification regarding a report status update."""
        settings = self._settings
        link = f"{settings.frontend_base_url}/reports/{report_id}"
        html = f"""
        <h2>Hello {to_name},</h2>
        <h3>{title}</h3>
        <p>{message}</p>
        <p>You can view the full report details here:</p>
        <p><a href="{link}">View Report</a></p>
        <br>
        <p>Thank you for keeping our community clean!</p>
        <p>- The SwachhLens Team</p>
        """
        self._send(
            to_email=to_email,
            to_name=to_name,
            subject=f"SwachhLens Update: {title}",
            html=html,
        )


# Module-level singleton — replace in tests via dependency override or monkeypatch.
def get_email_service() -> BrevoEmailService:
    """FastAPI dependency that returns the email service singleton."""
    return BrevoEmailService()

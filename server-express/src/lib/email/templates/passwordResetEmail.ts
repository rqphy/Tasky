import type { SendPasswordResetEmailParams } from "../types.js"

export function renderPasswordResetEmailSubject(): string {
	return "Reset your Tasky password"
}

export function renderPasswordResetEmailHtml(
	params: SendPasswordResetEmailParams,
): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;padding:32px;">
          <tr>
            <td style="font-size:24px;line-height:1.2;padding-bottom:16px;font-weight:600;">
              Reset your password
            </td>
          </tr>
          <tr>
            <td style="color:#3f3f46;font-size:16px;line-height:1.6;padding-bottom:24px;">
              Hi ${escapeHtml(params.userName)}, we received a request to reset your Tasky password.
              Click the button below to choose a new one.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${params.resetUrl}" style="display:inline-block;background-color:#18181b;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:12px 24px;border-radius:8px;">
                Reset password
              </a>
            </td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:14px;line-height:1.6;padding-bottom:16px;">
              If the button does not work, copy and paste this link into your browser:<br>
              <a href="${params.resetUrl}" style="color:#2563eb;word-break:break-all;">${params.resetUrl}</a>
            </td>
          </tr>
          <tr>
            <td style="color:#a1a1aa;font-size:13px;line-height:1.5;">
              If you did not request a password reset, you can safely ignore this email.
              This link expires in 1 hour.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;")
}

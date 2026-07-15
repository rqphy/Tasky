import type { SendInviteEmailParams } from "../types.js"

function formatRole(role: SendInviteEmailParams["role"]): string {
	return role === "MEMBER" ? "Member" : "Viewer"
}

export function renderInviteEmailSubject(
	params: SendInviteEmailParams,
): string {
	return `You've been invited to ${params.projectEmoji} ${params.projectName}`
}

export function renderInviteEmailHtml(params: SendInviteEmailParams): string {
	const roleLabel = formatRole(params.role)

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project invitation</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;padding:32px;">
          <tr>
            <td style="font-size:28px;line-height:1.2;padding-bottom:16px;">
              ${params.projectEmoji} ${escapeHtml(params.projectName)}
            </td>
          </tr>
          <tr>
            <td style="color:#3f3f46;font-size:16px;line-height:1.6;padding-bottom:24px;">
              <strong>${escapeHtml(params.inviterName)}</strong> invited you to join
              <strong>${escapeHtml(params.projectName)}</strong> as a ${roleLabel}.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${params.acceptUrl}" style="display:inline-block;background-color:#18181b;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:12px 24px;border-radius:8px;">
                Accept invitation
              </a>
            </td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:14px;line-height:1.6;padding-bottom:16px;">
              If the button does not work, copy and paste this link into your browser:<br>
              <a href="${params.acceptUrl}" style="color:#2563eb;word-break:break-all;">${params.acceptUrl}</a>
            </td>
          </tr>
          <tr>
            <td style="color:#a1a1aa;font-size:13px;line-height:1.5;">
              This invitation link expires in 7 days.
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

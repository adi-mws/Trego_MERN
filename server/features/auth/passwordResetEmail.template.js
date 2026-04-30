export function passwordResetEmailTemplate({ name, resetUrl, expiresInMinutes = 30 }) {
  const safeName = String(name || "there").trim() || "there";

  return {
    subject: "Reset your Trego password",
    text: [
      `Hi ${safeName},`,
      "",
      "We received a request to reset your Trego password.",
      `Open this link to choose a new password: ${resetUrl}`,
      "",
      `This link expires in ${expiresInMinutes} minutes.`,
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <!doctype html>
      <html>
        <body style="margin:0;background:#f6f8fb;font-family:Arial,sans-serif;color:#172033;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fb;padding:32px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e6ebf2;border-radius:14px;overflow:hidden;">
                  <tr>
                    <td style="padding:28px 28px 16px;">
                      <div style="font-size:20px;font-weight:700;color:#1976d2;">Trego</div>
                      <h1 style="font-size:24px;line-height:1.3;margin:22px 0 8px;">Reset your password</h1>
                      <p style="font-size:15px;line-height:1.7;margin:0;color:#526071;">Hi ${safeName}, we received a request to reset your password. Use the button below to set a new one.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 28px 24px;">
                      <a href="${resetUrl}" style="display:inline-block;background:#1976d2;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 18px;border-radius:8px;">Reset password</a>
                      <p style="font-size:13px;line-height:1.6;color:#6b7685;margin:20px 0 0;">This link expires in ${expiresInMinutes} minutes. If you did not request this email, you can safely ignore it.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 28px;background:#f9fbfd;border-top:1px solid #e6ebf2;">
                      <p style="font-size:12px;line-height:1.6;color:#8792a1;margin:0;">If the button does not work, paste this link into your browser:<br><span style="word-break:break-all;">${resetUrl}</span></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };
}

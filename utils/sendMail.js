const nodemailer = require("nodemailer");

const sendMail = async (to, subject, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:Segoe UI,Arial,sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 15px;">

            <table width="520" style="background:#ffffff;border-radius:14px;
              box-shadow:0 10px 30px rgba(0,0,0,0.08);overflow:hidden;">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#16a34a,#22c55e);
                  padding:24px;text-align:center;">
                  <h2 style="margin:0;color:#fff;">
                    🔐 OTP Verification
                  </h2>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding:30px;color:#374151;">
                  <p style="font-size:15px;">Hello 👋</p>

                  <p style="font-size:15px;line-height:1.6;">
                    Use the OTP below to verify your account.
                  </p>

                  <div style="text-align:center;margin:30px 0;">
                    <div style="
                      display:inline-block;
                      padding:16px 32px;
                      font-size:26px;
                      font-weight:bold;
                      letter-spacing:6px;
                      color:#15803d;
                      background:#f0fdf4;
                      border:2px dashed #22c55e;
                      border-radius:10px;">
                      ${otp}
                    </div>
                  </div>

                  <p style="font-size:14px;color:#6b7280;">
                    This OTP is valid for <b>5 minutes</b>.  
                    Do not share it with anyone.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb;padding:18px;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#9ca3af;">
                    © ${new Date().getFullYear()} Ambrosia Ayurved
                  </p>
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
    </html>
    `;

    const mailOptions = {
      from: `"Ambrosia Ayurved" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

module.exports = sendMail;

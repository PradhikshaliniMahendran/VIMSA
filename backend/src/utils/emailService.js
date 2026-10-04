import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // use STARTTLS on port 587
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

export const welcomeEmail = (name) => `
<div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#fff;">
  <div style="background:#000;padding:30px;text-align:center;">
    <h1 style="color:#D4AF37;font-size:32px;margin:0;letter-spacing:4px;">VIMSA</h1>
  </div>
  <div style="padding:40px;">
    <h2 style="color:#111;font-family:Outfit,sans-serif;">Welcome, ${name}!</h2>
    <p style="color:#666;line-height:1.8;">Thank you for joining VIMSA — your gateway to premium streetwear & luxury fashion. Your account has been created successfully.</p>
    <a href="${process.env.FRONTEND_URL}/shop" style="display:inline-block;background:#000;color:#fff;padding:14px 32px;text-decoration:none;font-weight:600;margin-top:20px;border-radius:2px;">Start Shopping</a>
  </div>
  <div style="background:#f8f8f8;padding:20px;text-align:center;color:#999;font-size:12px;">
    © ${new Date().getFullYear()} VIMSA. All rights reserved.
  </div>
</div>`;

export const otpEmail = (name, otp) => `
<div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#ffffff;border:1px solid #eeeeee;">
  <div style="background:#000000;padding:30px;text-align:center;">
    <h1 style="color:#D4AF37;font-size:32px;margin:0;letter-spacing:4px;font-family:Georgia,serif;">VIMSA</h1>
    <p style="color:#888888;font-size:11px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase;">Premium Fashion</p>
  </div>
  <div style="padding:40px 40px 30px;">
    <h2 style="color:#111111;font-size:22px;margin:0 0 12px;">Hello, ${name}! 👋</h2>
    <p style="color:#555555;line-height:1.8;font-size:15px;margin:0 0 24px;">
      Thank you for registering with VIMSA. Please use the one-time verification code below to confirm your email address and activate your account.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <p style="color:#888888;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Your OTP Verification Code</p>
      <div style="display:inline-block;background:#000000;color:#D4AF37;font-size:40px;font-weight:bold;letter-spacing:14px;padding:20px 36px;border-radius:4px;font-family:monospace;">
        ${otp}
      </div>
      <p style="color:#999999;font-size:12px;margin:16px 0 0;">⏱ This code expires in <strong>10 minutes</strong></p>
    </div>
    <div style="background:#f9f9f9;border-left:3px solid #D4AF37;padding:14px 18px;border-radius:2px;margin:24px 0;">
      <p style="color:#777777;font-size:13px;margin:0;line-height:1.6;">
        🔒 <strong>Security Notice:</strong> Never share this code with anyone. VIMSA staff will never ask for your OTP.
        If you did not create this account, you can safely ignore this email.
      </p>
    </div>
    <p style="color:#aaaaaa;font-size:12px;margin:0;">
      Need help? Contact us at <a href="mailto:vimsaclothing@gmail.com" style="color:#D4AF37;">vimsaclothing@gmail.com</a>
    </p>
  </div>
  <div style="background:#f8f8f8;padding:20px;text-align:center;border-top:1px solid #eeeeee;">
    <p style="color:#bbbbbb;font-size:11px;margin:0;">© ${new Date().getFullYear()} VIMSA Clothing · Bogawanthalawa, Sri Lanka</p>
  </div>
</div>`;


export const passwordResetEmail = (name, resetUrl) => `
<div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#fff;">
  <div style="background:#000;padding:30px;text-align:center;">
    <h1 style="color:#D4AF37;font-size:32px;margin:0;letter-spacing:4px;">VIMSA</h1>
  </div>
  <div style="padding:40px;">
    <h2 style="color:#111;">Reset Your Password</h2>
    <p style="color:#666;">Hi ${name}, click the button below to reset your VIMSA password. This link expires in 1 hour.</p>
    <a href="${resetUrl}" style="display:inline-block;background:#D4AF37;color:#000;padding:14px 32px;text-decoration:none;font-weight:700;margin-top:20px;border-radius:2px;">Reset Password</a>
    <p style="color:#999;font-size:12px;margin-top:20px;">If you did not request a password reset, ignore this email.</p>
  </div>
</div>`;

export const orderConfirmationEmail = (order) => `
<div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#fff;">
  <div style="background:#000;padding:30px;text-align:center;">
    <h1 style="color:#D4AF37;font-size:32px;margin:0;letter-spacing:4px;">VIMSA</h1>
  </div>
  <div style="padding:40px;">
    <h2 style="color:#111;">Order Confirmed! 🎉</h2>
    <p style="color:#666;">Thank you for your order. Here are your order details:</p>
    <div style="background:#f8f8f8;padding:20px;border-left:4px solid #D4AF37;margin:20px 0;">
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Total Amount:</strong> LKR ${order.total}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
      <p><strong>Status:</strong> ${order.orderStatus}</p>
    </div>
    <a href="${process.env.FRONTEND_URL}/dashboard/orders" style="display:inline-block;background:#000;color:#fff;padding:14px 32px;text-decoration:none;font-weight:600;border-radius:2px;">Track Order</a>
  </div>
</div>`;

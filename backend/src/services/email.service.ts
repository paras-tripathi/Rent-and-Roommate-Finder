import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your@gmail.com') {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export async function sendInterestNotificationToOwner(
  ownerEmail: string,
  ownerName: string,
  tenantName: string,
  listingTitle: string,
  compatibilityScore: number
): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('Email not configured, skipping notification');
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Rent & Flatmate Finder <noreply@rentflatmate.com>',
      to: ownerEmail,
      subject: `🏠 New Interest: ${tenantName} is interested in "${listingTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">New Interest Received!</h2>
          <p>Hi ${ownerName},</p>
          <p><strong>${tenantName}</strong> has expressed interest in your listing: <strong>${listingTitle}</strong>.</p>
          <div style="background: #f0f9ff; border-left: 4px solid #6366f1; padding: 16px; margin: 16px 0;">
            <p style="margin: 0;">🎯 Compatibility Score: <strong>${compatibilityScore}/100</strong></p>
          </div>
          <p>Log in to your dashboard to accept or decline this interest.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard/owner" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">View Dashboard</a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendInterestAcceptedToTenant(
  tenantEmail: string,
  tenantName: string,
  listingTitle: string,
  ownerName: string
): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Rent & Flatmate Finder <noreply@rentflatmate.com>',
      to: tenantEmail,
      subject: `✅ Your interest in "${listingTitle}" was accepted!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Great News! 🎉</h2>
          <p>Hi ${tenantName},</p>
          <p><strong>${ownerName}</strong> has accepted your interest in: <strong>${listingTitle}</strong>.</p>
          <p>You can now start chatting with the owner directly through the platform!</p>
          <a href="${process.env.FRONTEND_URL}/dashboard/tenant" style="background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">Open Chat</a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendInterestDeclinedToTenant(
  tenantEmail: string,
  tenantName: string,
  listingTitle: string
): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Rent & Flatmate Finder <noreply@rentflatmate.com>',
      to: tenantEmail,
      subject: `Your interest in "${listingTitle}" was not accepted`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6b7280;">Interest Update</h2>
          <p>Hi ${tenantName},</p>
          <p>Unfortunately, your interest in <strong>${listingTitle}</strong> was not accepted at this time.</p>
          <p>Don't be discouraged — there are many other great listings waiting for you!</p>
          <a href="${process.env.FRONTEND_URL}/dashboard/tenant" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">Browse Listings</a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

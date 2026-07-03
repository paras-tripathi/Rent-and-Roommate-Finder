import https from 'https';

// Send email via Brevo HTTP API (bypasses Render's SMTP port blocking)
async function sendBrevoEmail(to: string, subject: string, htmlContent: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log('BREVO_API_KEY not configured, skipping email');
    return;
  }

  let senderEmail = 'coder5238@gmail.com';
  const emailFrom = process.env.EMAIL_FROM;
  if (emailFrom) {
    const match = emailFrom.match(/<(.+?)>/);
    if (match && match[1]) {
      senderEmail = match[1];
    } else if (emailFrom.includes('@')) {
      senderEmail = emailFrom.trim();
    }
  }
  const senderName = 'Rent & Flatmate Finder';

  const body = JSON.stringify({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to }],
    subject,
    htmlContent,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ Email sent to ${to}`);
            resolve();
          } else {
            console.error(`❌ Brevo API error ${res.statusCode}:`, data);
            reject(new Error(`Brevo API error: ${res.statusCode} - ${data}`));
          }
        });
      }
    );
    req.on('error', (err) => {
      console.error('❌ Email request error:', err);
      reject(err);
    });
    req.write(body);
    req.end();
  });
}

export async function sendInterestNotificationToOwner(
  ownerEmail: string,
  ownerName: string,
  tenantName: string,
  listingTitle: string,
  compatibilityScore: number
): Promise<void> {
  try {
    await sendBrevoEmail(
      ownerEmail,
      `🏠 New Interest: ${tenantName} is interested in "${listingTitle}"`,
      `
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
      `
    );
  } catch (error) {
    console.error('Error sending owner notification email:', error);
  }
}

export async function sendInterestAcceptedToTenant(
  tenantEmail: string,
  tenantName: string,
  listingTitle: string,
  ownerName: string
): Promise<void> {
  try {
    await sendBrevoEmail(
      tenantEmail,
      `✅ Your interest in "${listingTitle}" was accepted!`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Great News! 🎉</h2>
          <p>Hi ${tenantName},</p>
          <p><strong>${ownerName}</strong> has accepted your interest in: <strong>${listingTitle}</strong>.</p>
          <p>You can now start chatting with the owner directly through the platform!</p>
          <a href="${process.env.FRONTEND_URL}/dashboard/tenant" style="background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">Open Chat</a>
        </div>
      `
    );
  } catch (error) {
    console.error('Error sending acceptance email:', error);
  }
}

export async function sendInterestDeclinedToTenant(
  tenantEmail: string,
  tenantName: string,
  listingTitle: string
): Promise<void> {
  try {
    await sendBrevoEmail(
      tenantEmail,
      `Your interest in "${listingTitle}" was not accepted`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6b7280;">Interest Update</h2>
          <p>Hi ${tenantName},</p>
          <p>Unfortunately, your interest in <strong>${listingTitle}</strong> was not accepted at this time.</p>
          <p>Don't be discouraged — there are many other great listings waiting for you!</p>
          <a href="${process.env.FRONTEND_URL}/dashboard/tenant" style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">Browse Listings</a>
        </div>
      `
    );
  } catch (error) {
    console.error('Error sending declined email:', error);
  }
}

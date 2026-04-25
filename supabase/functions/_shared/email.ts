/**
 * Email service using Resend (free tier: 100 emails/day, 3,000/month).
 * https://resend.com
 */

const RESEND_API_KEY = () => Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = () => Deno.env.get("FROM_EMAIL") ?? "Atelier Launch <noreply@atelierlaunch.com>";
const SITE_URL = () => Deno.env.get("SITE_URL") || "https://atelierlaunch.com";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send an email via Resend API.
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const apiKey = RESEND_API_KEY();
  if (!apiKey) {
    console.error("RESEND_API_KEY not configured — skipping email");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL(),
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Resend API error:", err);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Email send failed:", err);
    return false;
  }
}

// ============================================================================
// EMAIL TEMPLATE FUNCTIONS
// ============================================================================

export function welcomeDesignerEmail(name: string): SendEmailOptions {
  const siteUrl = SITE_URL();
  return {
    to: "",
    subject: "Welcome to Atelier Launch — Get Verified",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0;">ATELIER LAUNCH</h1>
      <div style="width:60px;height:2px;background:linear-gradient(90deg,#8b5cf6,#ec4899);margin:12px auto;"></div>
    </div>
    <div style="background:#111111;border:1px solid #222;border-radius:12px;padding:32px;">
      <h2 style="color:#ffffff;font-size:22px;margin:0 0 16px;">Welcome, ${name} 🎨</h2>
      <p style="color:#a1a1aa;font-size:15px;line-height:1.6;">You've joined a community of visionary fashion designers. Your next step is getting verified so you can start selling your collections.</p>
      <div style="background:#18181b;border-radius:8px;padding:20px;margin:24px 0;">
        <p style="color:#d4d4d8;font-size:14px;margin:0 0 8px;font-weight:600;">Next Steps:</p>
        <ol style="color:#a1a1aa;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
          <li>Upload your student verification document</li>
          <li>Complete your designer profile with portfolio images</li>
          <li>Add your Instagram handle and bio</li>
          <li>Wait for verification (usually within 24 hours)</li>
        </ol>
      </div>
      <a href="${siteUrl}/dashboard/profile" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Complete Your Profile →</a>
    </div>
    <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px;">© 2026 Atelier Launch. All rights reserved.</p>
  </div>
</body>
</html>`,
  };
}

export function designerVerifiedEmail(name: string): SendEmailOptions {
  const siteUrl = SITE_URL();
  return {
    to: "",
    subject: "You're Verified! Start Selling on Atelier Launch ✨",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0;">ATELIER LAUNCH</h1>
      <div style="width:60px;height:2px;background:linear-gradient(90deg,#8b5cf6,#ec4899);margin:12px auto;"></div>
    </div>
    <div style="background:#111111;border:1px solid #222;border-radius:12px;padding:32px;">
      <div style="text-align:center;margin-bottom:20px;font-size:48px;">🎉</div>
      <h2 style="color:#ffffff;font-size:22px;margin:0 0 16px;text-align:center;">Congratulations, ${name}!</h2>
      <p style="color:#a1a1aa;font-size:15px;line-height:1.6;text-align:center;">Your designer profile has been verified. You can now create collection drops and start selling your pieces to fashion enthusiasts worldwide.</p>
      <div style="background:#18181b;border-radius:8px;padding:20px;margin:24px 0;">
        <p style="color:#d4d4d8;font-size:14px;margin:0 0 8px;font-weight:600;">Quick Tips for Your First Drop:</p>
        <ul style="color:#a1a1aa;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
          <li>Create a collection with 3-5 hero pieces</li>
          <li>Use high-quality photos (natural light works best)</li>
          <li>Set your 72-hour drop window strategically</li>
          <li>Share your drop link on Instagram for maximum reach</li>
        </ul>
      </div>
      <div style="text-align:center;">
        <a href="${siteUrl}/dashboard/collections/new" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Create Your First Drop →</a>
      </div>
    </div>
    <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px;">© 2026 Atelier Launch. All rights reserved.</p>
  </div>
</body>
</html>`,
  };
}

export function newDropAlertEmail(
  designerName: string,
  collectionTitle: string,
  dropStartDate: string,
  collectionId: string
): SendEmailOptions {
  const siteUrl = SITE_URL();
  return {
    to: "",
    subject: `New Drop Alert: ${collectionTitle} by ${designerName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0;">ATELIER LAUNCH</h1>
      <div style="width:60px;height:2px;background:linear-gradient(90deg,#8b5cf6,#ec4899);margin:12px auto;"></div>
    </div>
    <div style="background:#111111;border:1px solid #222;border-radius:12px;padding:32px;">
      <p style="color:#8b5cf6;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">New Drop Alert 🔥</p>
      <h2 style="color:#ffffff;font-size:24px;margin:0 0 8px;">${collectionTitle}</h2>
      <p style="color:#a1a1aa;font-size:15px;margin:0 0 20px;">by ${designerName}</p>
      <div style="background:#18181b;border-radius:8px;padding:16px;margin:20px 0;text-align:center;">
        <p style="color:#d4d4d8;font-size:13px;margin:0;">Drops on</p>
        <p style="color:#ffffff;font-size:20px;font-weight:700;margin:4px 0 0;">${dropStartDate}</p>
        <p style="color:#ec4899;font-size:13px;margin:4px 0 0;">72-hour exclusive window</p>
      </div>
      <div style="text-align:center;">
        <a href="${siteUrl}/collections/${collectionId}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">View Collection →</a>
      </div>
    </div>
    <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px;">You're receiving this because you follow ${designerName}.</p>
  </div>
</body>
</html>`,
  };
}

export function dropEndingSoonEmail(
  collectionTitle: string,
  collectionId: string
): SendEmailOptions {
  const siteUrl = SITE_URL();
  return {
    to: "",
    subject: `Last Chance: ${collectionTitle} ends in 6 hours`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0;">ATELIER LAUNCH</h1>
      <div style="width:60px;height:2px;background:linear-gradient(90deg,#8b5cf6,#ec4899);margin:12px auto;"></div>
    </div>
    <div style="background:#111111;border:1px solid #ec4899;border-radius:12px;padding:32px;">
      <div style="text-align:center;margin-bottom:16px;font-size:48px;">⏰</div>
      <h2 style="color:#ec4899;font-size:22px;margin:0 0 16px;text-align:center;">Last Chance!</h2>
      <p style="color:#ffffff;font-size:18px;text-align:center;margin:0 0 8px;font-weight:600;">${collectionTitle}</p>
      <p style="color:#a1a1aa;font-size:15px;text-align:center;line-height:1.6;">This drop ends in approximately 6 hours. Don't miss out on these limited-edition pieces!</p>
      <div style="text-align:center;margin-top:24px;">
        <a href="${siteUrl}/collections/${collectionId}" style="display:inline-block;background:linear-gradient(135deg,#ec4899,#f43f5e);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">Shop Now Before It's Gone →</a>
      </div>
    </div>
    <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px;">© 2026 Atelier Launch. All rights reserved.</p>
  </div>
</body>
</html>`,
  };
}

export function orderConfirmedBuyerEmail(
  buyerName: string,
  orderId: string,
  productName: string,
  totalAmount: string,
  designerName: string,
  shippingAddress: string
): SendEmailOptions {
  const siteUrl = SITE_URL();
  return {
    to: "",
    subject: `Order Confirmed — Atelier Launch Order #${orderId.slice(0, 8)}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0;">ATELIER LAUNCH</h1>
      <div style="width:60px;height:2px;background:linear-gradient(90deg,#8b5cf6,#ec4899);margin:12px auto;"></div>
    </div>
    <div style="background:#111111;border:1px solid #222;border-radius:12px;padding:32px;">
      <div style="text-align:center;margin-bottom:20px;font-size:48px;">🛍️</div>
      <h2 style="color:#ffffff;font-size:22px;margin:0 0 16px;text-align:center;">Order Confirmed!</h2>
      <p style="color:#a1a1aa;font-size:15px;text-align:center;">Thank you for your purchase, ${buyerName}!</p>
      <div style="background:#18181b;border-radius:8px;padding:20px;margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="color:#71717a;font-size:13px;padding:6px 0;">Order</td><td style="color:#fff;font-size:13px;text-align:right;padding:6px 0;">#${orderId.slice(0, 8)}</td></tr>
          <tr><td style="color:#71717a;font-size:13px;padding:6px 0;">Product</td><td style="color:#fff;font-size:13px;text-align:right;padding:6px 0;">${productName}</td></tr>
          <tr><td style="color:#71717a;font-size:13px;padding:6px 0;">Designer</td><td style="color:#fff;font-size:13px;text-align:right;padding:6px 0;">${designerName}</td></tr>
          <tr style="border-top:1px solid #333;"><td style="color:#d4d4d8;font-size:15px;padding:12px 0 6px;font-weight:600;">Total</td><td style="color:#8b5cf6;font-size:15px;text-align:right;padding:12px 0 6px;font-weight:600;">$${totalAmount}</td></tr>
        </table>
      </div>
      <div style="background:#18181b;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="color:#71717a;font-size:12px;margin:0 0 4px;">Shipping to:</p>
        <p style="color:#d4d4d8;font-size:13px;margin:0;">${shippingAddress}</p>
      </div>
      <div style="text-align:center;">
        <a href="${siteUrl}/orders" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">View Order →</a>
      </div>
    </div>
    <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px;">© 2026 Atelier Launch. All rights reserved.</p>
  </div>
</body>
</html>`,
  };
}

export function newSaleDesignerEmail(
  designerName: string,
  productName: string,
  orderId: string,
  totalAmount: string,
  payout: string,
  shippingAddress: string
): SendEmailOptions {
  const siteUrl = SITE_URL();
  return {
    to: "",
    subject: `New Sale! ${productName} — Order #${orderId.slice(0, 8)}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0;">ATELIER LAUNCH</h1>
      <div style="width:60px;height:2px;background:linear-gradient(90deg,#8b5cf6,#ec4899);margin:12px auto;"></div>
    </div>
    <div style="background:#111111;border:1px solid #222;border-radius:12px;padding:32px;">
      <div style="text-align:center;margin-bottom:20px;font-size:48px;">💰</div>
      <h2 style="color:#ffffff;font-size:22px;margin:0 0 16px;text-align:center;">New Sale, ${designerName}!</h2>
      <div style="background:#18181b;border-radius:8px;padding:20px;margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="color:#71717a;font-size:13px;padding:6px 0;">Product</td><td style="color:#fff;font-size:13px;text-align:right;padding:6px 0;">${productName}</td></tr>
          <tr><td style="color:#71717a;font-size:13px;padding:6px 0;">Order Total</td><td style="color:#fff;font-size:13px;text-align:right;padding:6px 0;">$${totalAmount}</td></tr>
          <tr style="border-top:1px solid #333;"><td style="color:#d4d4d8;font-size:15px;padding:12px 0 6px;font-weight:600;">Your Payout</td><td style="color:#22c55e;font-size:15px;text-align:right;padding:12px 0 6px;font-weight:600;">$${payout}</td></tr>
        </table>
      </div>
      <div style="background:#18181b;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="color:#71717a;font-size:12px;margin:0 0 4px;">Ship to:</p>
        <p style="color:#d4d4d8;font-size:13px;margin:0;">${shippingAddress}</p>
      </div>
      <p style="color:#a1a1aa;font-size:14px;line-height:1.6;">Please ship this order within 3 business days and update the status in your dashboard.</p>
      <div style="text-align:center;margin-top:20px;">
        <a href="${siteUrl}/dashboard/orders" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Manage Orders →</a>
      </div>
    </div>
    <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px;">© 2026 Atelier Launch. All rights reserved.</p>
  </div>
</body>
</html>`,
  };
}

export function orderShippedEmail(
  buyerName: string,
  orderId: string,
  productName: string
): SendEmailOptions {
  const siteUrl = SITE_URL();
  return {
    to: "",
    subject: `Your Order Has Shipped — Order #${orderId.slice(0, 8)}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0;">ATELIER LAUNCH</h1>
      <div style="width:60px;height:2px;background:linear-gradient(90deg,#8b5cf6,#ec4899);margin:12px auto;"></div>
    </div>
    <div style="background:#111111;border:1px solid #222;border-radius:12px;padding:32px;">
      <div style="text-align:center;margin-bottom:20px;font-size:48px;">📦</div>
      <h2 style="color:#ffffff;font-size:22px;margin:0 0 16px;text-align:center;">Your Order Has Shipped!</h2>
      <p style="color:#a1a1aa;font-size:15px;text-align:center;line-height:1.6;">Hey ${buyerName}, your <strong style="color:#fff;">${productName}</strong> is on its way!</p>
      <div style="background:#18181b;border-radius:8px;padding:16px;margin:24px 0;text-align:center;">
        <p style="color:#71717a;font-size:12px;margin:0 0 4px;">Order</p>
        <p style="color:#fff;font-size:14px;margin:0;">#${orderId.slice(0, 8)}</p>
      </div>
      <p style="color:#a1a1aa;font-size:14px;text-align:center;line-height:1.6;">Estimated delivery: 5-7 business days. You'll receive another email when it arrives.</p>
      <div style="text-align:center;margin-top:20px;">
        <a href="${siteUrl}/orders" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Track Order →</a>
      </div>
    </div>
    <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px;">© 2026 Atelier Launch. All rights reserved.</p>
  </div>
</body>
</html>`,
  };
}

export function orderDeliveredEmail(
  buyerName: string,
  orderId: string,
  productName: string,
  designerId: string
): SendEmailOptions {
  const siteUrl = SITE_URL();
  return {
    to: "",
    subject: "Your Order Has Been Delivered 🎉",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#ffffff;font-size:28px;font-weight:700;margin:0;">ATELIER LAUNCH</h1>
      <div style="width:60px;height:2px;background:linear-gradient(90deg,#8b5cf6,#ec4899);margin:12px auto;"></div>
    </div>
    <div style="background:#111111;border:1px solid #222;border-radius:12px;padding:32px;">
      <div style="text-align:center;margin-bottom:20px;font-size:48px;">✨</div>
      <h2 style="color:#ffffff;font-size:22px;margin:0 0 16px;text-align:center;">Delivered!</h2>
      <p style="color:#a1a1aa;font-size:15px;text-align:center;line-height:1.6;">Hey ${buyerName}, your <strong style="color:#fff;">${productName}</strong> has been delivered! We hope you love it.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${siteUrl}/designers/${designerId}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;margin:0 8px;">Follow the Designer →</a>
      </div>
      <p style="color:#71717a;font-size:13px;text-align:center;">Love your piece? Share it on Instagram and tag the designer!</p>
    </div>
    <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px;">© 2026 Atelier Launch. All rights reserved.</p>
  </div>
</body>
</html>`,
  };
}

const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `Campus Lost & Found <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  welcome: (name, collegeName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1f2937; color: #f9fafb; padding: 30px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #d946ef; margin: 0;">Welcome to Lost & Found!</h1>
        <p style="color: #9ca3af; margin-top: 5px;">${collegeName}</p>
      </div>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for joining your campus Lost & Found community. You can now:</p>
      <ul style="color: #d1d5db;">
        <li>Report lost items</li>
        <li>Post found items</li>
        <li>Claim items that belong to you</li>
        <li>Get notified when matches are found</li>
      </ul>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}" style="background: linear-gradient(to right, #d946ef, #a21caf); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Start Browsing
        </a>
      </div>
      <p style="color: #9ca3af; margin-top: 30px; font-size: 12px; text-align: center;">
        Best regards,<br>Campus Lost & Found Team
      </p>
    </div>
  `,

  itemMatch: (name, newItem, matchedItem) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1f2937; color: #f9fafb; padding: 30px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #22c55e;">🎯 Potential Match Found!</h1>
      </div>
      <p>Hi <strong>${name}</strong>,</p>
      <p>We found a potential match for your item:</p>
      <div style="background: #374151; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong style="color: #d946ef;">Your Item:</strong> ${matchedItem.title}</p>
        <p style="margin: 5px 0;"><strong style="color: #22c55e;">Matched Item:</strong> ${newItem.title}</p>
        <p style="margin: 5px 0;"><strong>Category:</strong> ${newItem.category}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${newItem.location}</p>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/items/${newItem._id}" style="background: linear-gradient(to right, #d946ef, #a21caf); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          View Match
        </a>
      </div>
      <p style="color: #9ca3af; margin-top: 30px; font-size: 12px; text-align: center;">
        Best regards,<br>Campus Lost & Found Team
      </p>
    </div>
  `,

  claimRequest: (ownerName, item, claimant) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1f2937; color: #f9fafb; padding: 30px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f59e0b;">📋 New Claim Request!</h1>
      </div>
      <p>Hi <strong>${ownerName}</strong>,</p>
      <p>Someone has claimed your item:</p>
      <div style="background: #374151; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Item:</strong> ${item.title}</p>
        <p style="margin: 5px 0;"><strong>Claimed by:</strong> ${claimant.name}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${claimant.email}</p>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/my-items" style="background: linear-gradient(to right, #d946ef, #a21caf); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Review Claim
        </a>
      </div>
      <p style="color: #9ca3af; margin-top: 30px; font-size: 12px; text-align: center;">
        Best regards,<br>Campus Lost & Found Team
      </p>
    </div>
  `,

  claimStatusUpdate: (claimantName, item, status, notes) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1f2937; color: #f9fafb; padding: 30px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: ${status === 'approved' ? '#22c55e' : '#ef4444'};">
          ${status === 'approved' ? '🎉 Claim Approved!' : '❌ Claim Update'}
        </h1>
      </div>
      <p>Hi <strong>${claimantName}</strong>,</p>
      <p>Your claim for "<strong>${item.title}</strong>" has been <strong style="color: ${status === 'approved' ? '#22c55e' : '#ef4444'};">${status}</strong>.</p>
      ${notes ? `<p style="background: #374151; padding: 15px; border-radius: 8px;"><strong>Notes:</strong> ${notes}</p>` : ''}
      ${status === 'approved' ? '<p>Please login to see contact details and arrange pickup.</p>' : ''}
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/my-claims" style="background: linear-gradient(to right, #d946ef, #a21caf); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          View Details
        </a>
      </div>
      <p style="color: #9ca3af; margin-top: 30px; font-size: 12px; text-align: center;">
        Best regards,<br>Campus Lost & Found Team
      </p>
    </div>
  `,

  collegeVerified: (adminName, collegeName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1f2937; color: #f9fafb; padding: 30px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #22c55e;">✅ College Verified!</h1>
      </div>
      <p>Hi <strong>${adminName}</strong>,</p>
      <p>Great news! <strong>${collegeName}</strong> has been verified and is now live on Campus Lost & Found.</p>
      <p>Your students can now:</p>
      <ul style="color: #d1d5db;">
        <li>Register using their college email</li>
        <li>Report lost and found items</li>
        <li>Connect with fellow students</li>
      </ul>
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL}/admin" style="background: linear-gradient(to right, #d946ef, #a21caf); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          Go to Dashboard
        </a>
      </div>
      <p style="color: #9ca3af; margin-top: 30px; font-size: 12px; text-align: center;">
        Best regards,<br>Campus Lost & Found Team
      </p>
    </div>
  `,
};

module.exports = {
  sendEmail,
  emailTemplates,
  createTransporter,
};

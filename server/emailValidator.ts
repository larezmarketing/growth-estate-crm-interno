import nodemailer from 'nodemailer';

export interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface IMAPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

/**
 * Validate SMTP credentials by attempting to connect
 */
export async function validateSMTP(config: SMTPConfig): Promise<{ valid: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.username,
        pass: config.password,
      },
      connectionTimeout: 10000,
    });

    await transporter.verify();
    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message || 'Failed to connect to SMTP server',
    };
  }
}

/**
 * Send email using SMTP credentials
 */
export async function sendEmail(
  config: SMTPConfig,
  options: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.username,
        pass: config.password,
      },
    });

    const info = await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Get common SMTP/IMAP configurations for popular providers
 */
export function getProviderConfig(provider: string): {
  smtp: { host: string; port: number };
  imap: { host: string; port: number };
} | null {
  const configs: Record<string, any> = {
    gmail: {
      smtp: { host: 'smtp.gmail.com', port: 587 },
      imap: { host: 'imap.gmail.com', port: 993 },
    },
    outlook: {
      smtp: { host: 'smtp-mail.outlook.com', port: 587 },
      imap: { host: 'outlook.office365.com', port: 993 },
    },
    yahoo: {
      smtp: { host: 'smtp.mail.yahoo.com', port: 587 },
      imap: { host: 'imap.mail.yahoo.com', port: 993 },
    },
  };

  return configs[provider.toLowerCase()] || null;
}

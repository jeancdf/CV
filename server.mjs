import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDirectory = path.join(__dirname, 'dist', 'jean-cazals-cv', 'browser');
const indexFile = path.join(staticDirectory, 'index.html');
const port = Number.parseInt(process.env.PORT || '3000', 10);
const contactEmail = process.env.CONTACT_TO_EMAIL || 'jeancdfpro@gmail.com';

const smtpPort = Number.parseInt(process.env.SMTP_PORT || '465', 10);
const smtpSecure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : smtpPort === 465;
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASS;
const mailFrom = process.env.MAIL_FROM || (smtpUser ? `Jean Cazals <${smtpUser}>` : undefined);

const transporter =
  smtpUser && smtpPassword
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPassword },
      })
    : undefined;

const app = express();

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https://tile.openstreetmap.org'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
  }),
);
app.use(express.json({ limit: '20kb' }));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'too_many_requests' },
});

function normalizeSingleLine(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function normalizeMessage(value) {
  return typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : '';
}

function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function confirmationCopy(language, name, message) {
  const safeName = escapeHtml(name);
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');

  if (language === 'en') {
    return {
      subject: 'Your message to Jean Cazals has been received',
      text: `Hello ${name},\n\nThank you for your message. I have received your request and will reply personally as soon as possible.\n\nYour message:\n${message}\n\nJean Cazals`,
      html: `<p>Hello ${safeName},</p><p>Thank you for your message. I have received your request and will reply personally as soon as possible.</p><p><strong>Your message:</strong><br />${safeMessage}</p><p>Jean Cazals</p>`,
    };
  }

  return {
    subject: 'Votre message à Jean Cazals a bien été reçu',
    text: `Bonjour ${name},\n\nMerci pour votre message. J’ai bien reçu votre demande et je vous répondrai personnellement dès que possible.\n\nVotre message :\n${message}\n\nJean Cazals`,
    html: `<p>Bonjour ${safeName},</p><p>Merci pour votre message. J’ai bien reçu votre demande et je vous répondrai personnellement dès que possible.</p><p><strong>Votre message :</strong><br />${safeMessage}</p><p>Jean Cazals</p>`,
  };
}

app.post('/api/contact', contactLimiter, async (request, response) => {
  const name = normalizeSingleLine(request.body?.name);
  const email = normalizeSingleLine(request.body?.email).toLowerCase();
  const message = normalizeMessage(request.body?.message);
  const website = normalizeSingleLine(request.body?.website);
  const language = request.body?.language === 'en' ? 'en' : 'fr';

  // Bots tend to fill this hidden field. Return a neutral success without sending mail.
  if (website) {
    return response.status(202).json({ status: 'received', id: randomUUID() });
  }

  if (
    name.length < 2 ||
    name.length > 100 ||
    !isValidEmail(email) ||
    message.length < 10 ||
    message.length > 5000
  ) {
    return response.status(400).json({ error: 'invalid_request' });
  }

  if (!transporter || !mailFrom) {
    console.error('Contact form disabled: SMTP_USER and SMTP_PASS must be configured.');
    return response.status(503).json({ error: 'mail_unavailable' });
  }

  const requestId = randomUUID();
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');
  const confirmation = confirmationCopy(language, name, message);

  try {
    await Promise.all([
      transporter.sendMail({
        from: mailFrom,
        to: contactEmail,
        replyTo: { name, address: email },
        subject: `[CV] Nouvelle demande de ${name}`,
        text: `Nouvelle demande depuis le CV\n\nNom : ${name}\nE-mail : ${email}\n\nMessage :\n${message}\n\nRéférence : ${requestId}`,
        html: `<h2>Nouvelle demande depuis le CV</h2><p><strong>Nom :</strong> ${safeName}<br /><strong>E-mail :</strong> ${safeEmail}</p><p><strong>Message :</strong><br />${safeMessage}</p><p><small>Référence : ${requestId}</small></p>`,
        headers: { 'X-Contact-Request-Id': requestId },
      }),
      transporter.sendMail({
        from: mailFrom,
        to: { name, address: email },
        replyTo: contactEmail,
        subject: confirmation.subject,
        text: confirmation.text,
        html: confirmation.html,
        headers: { 'X-Contact-Request-Id': requestId },
      }),
    ]);

    return response.status(202).json({ status: 'received', id: requestId });
  } catch (error) {
    console.error('Unable to send contact emails:', error);
    return response.status(502).json({ error: 'mail_delivery_failed' });
  }
});

app.use(
  express.static(staticDirectory, {
    immutable: true,
    maxAge: '1y',
    index: false,
    setHeaders(response, filePath) {
      if (filePath.endsWith('index.html') || filePath.includes(`${path.sep}uploads${path.sep}`)) {
        response.setHeader('Cache-Control', 'no-store');
      }
    },
  }),
);

app.use((request, response) => {
  if (request.path.startsWith('/api/')) {
    return response.status(404).json({ error: 'not_found' });
  }

  if (!existsSync(indexFile)) {
    return response.status(404).send('Angular build not found. Run npm run build first.');
  }

  return response.sendFile(indexFile, { headers: { 'Cache-Control': 'no-store' } });
});

app.listen(port, () => {
  console.log(`CV server listening on port ${port}`);
  if (!transporter)
    console.warn('Contact emails are disabled until SMTP_USER and SMTP_PASS are set.');
});

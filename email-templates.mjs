const PORTFOLIO_URL = 'https://cv-de-jean.duckdns.org';

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function emailDocument({ language, preheader, eyebrow, title, intro, content, automatic }) {
  const footerNote =
    language === 'en'
      ? automatic
        ? 'This is an automatic confirmation sent after your message.'
        : 'Sent automatically from the contact form on your portfolio.'
      : automatic
        ? 'Ceci est une confirmation automatique envoyée à la suite de votre message.'
        : 'Envoyé automatiquement depuis le formulaire de contact de votre portfolio.';

  return `<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(preheader)}</title>
    <style>
      @media only screen and (max-width: 640px) {
        .email-shell { width: 100% !important; }
        .email-padding { padding-left: 24px !important; padding-right: 24px !important; }
        .email-title { font-size: 38px !important; line-height: 42px !important; }
        .email-button { display: block !important; text-align: center !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background:#f5f1e8; color:#1e1b16; font-family:Arial,Helvetica,sans-serif; -webkit-text-size-adjust:100%;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; background:#f5f1e8;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" class="email-shell" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; border-collapse:separate; border-spacing:0; overflow:hidden; background:#fffdf8; border:1px solid #e0d9cb; border-radius:20px; box-shadow:0 18px 50px rgba(30,27,22,.10);">
            <tr>
              <td class="email-padding" style="padding:24px 42px; background:#fffdf8; border-bottom:1px solid #e0d9cb;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle">
                      <span style="font-family:Georgia,'Times New Roman',serif; font-size:25px; line-height:30px; color:#1e1b16;">Jean Cazals</span><br />
                      <span style="font-size:10px; line-height:16px; letter-spacing:2px; color:#8a8272; text-transform:uppercase;">Développeur full-stack</span>
                    </td>
                    <td align="right" valign="middle">
                      <span style="display:inline-block; width:10px; height:10px; border-radius:10px; background:#c0563a;"></span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="email-padding" style="padding:44px 42px 42px; background:#1e1b16;">
                <p style="margin:0 0 18px; font-size:10px; line-height:16px; font-weight:700; letter-spacing:2.4px; color:#f2c94c; text-transform:uppercase;">${eyebrow}</p>
                <h1 class="email-title" style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:48px; line-height:52px; font-weight:400; letter-spacing:-1px; color:#f5f1e8;">${title}</h1>
                <p style="margin:20px 0 0; max-width:470px; font-size:16px; line-height:26px; color:#c9c1b1;">${intro}</p>
              </td>
            </tr>
            <tr>
              <td class="email-padding" style="padding:38px 42px 44px; background:#fffdf8;">
                ${content}
              </td>
            </tr>
            <tr>
              <td class="email-padding" style="padding:24px 42px 28px; background:#f5f1e8; border-top:1px solid #e0d9cb;">
                <p style="margin:0; font-size:12px; line-height:19px; color:#8a8272;">${footerNote}</p>
                <p style="margin:9px 0 0; font-size:12px; line-height:19px; color:#5a544a;">
                  <a href="${PORTFOLIO_URL}" style="color:#c0563a; text-decoration:none; font-weight:700;">Portfolio</a>
                  &nbsp;&middot;&nbsp; Paris, France
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function messageCard(label, safeMessage) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-top:28px; background:#faf7f0; border:1px solid #e0d9cb; border-radius:14px;">
    <tr>
      <td style="padding:24px 26px; border-left:4px solid #c0563a; border-radius:14px;">
        <p style="margin:0 0 12px; font-size:10px; line-height:15px; font-weight:700; letter-spacing:1.8px; color:#8a8272; text-transform:uppercase;">${label}</p>
        <p style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:19px; line-height:29px; color:#302b24; word-break:break-word;">${safeMessage}</p>
      </td>
    </tr>
  </table>`;
}

export function ownerNotificationEmail({ name, email, message, requestId, language }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');
  const safeRequestId = escapeHtml(requestId);
  const receivedAt = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  }).format(new Date());
  const replyHref = escapeHtml(
    `mailto:${email}?subject=${encodeURIComponent(`Re: votre message sur mon portfolio`)}`,
  );

  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
      <tr>
        <td width="56" valign="top" style="width:56px;">
          <div style="width:46px; height:46px; border-radius:46px; background:#ece5d6; text-align:center; font-family:Georgia,'Times New Roman',serif; font-size:22px; line-height:46px; color:#c0563a;">${escapeHtml(name.charAt(0).toUpperCase())}</div>
        </td>
        <td valign="top" style="padding-left:14px;">
          <p style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:27px; line-height:32px; color:#1e1b16;">${safeName}</p>
          <p style="margin:7px 0 0; font-size:14px; line-height:21px; color:#5a544a;"><a href="mailto:${safeEmail}" style="color:#c0563a; text-decoration:none; font-weight:700;">${safeEmail}</a></p>
        </td>
        <td align="right" valign="top">
          <span style="display:inline-block; padding:6px 10px; border-radius:999px; background:#f2e6cf; font-size:9px; line-height:13px; font-weight:700; letter-spacing:1.4px; color:#9b6818; text-transform:uppercase;">${language === 'en' ? 'Message EN' : 'Message FR'}</span>
        </td>
      </tr>
    </table>
    ${messageCard('Message reçu', safeMessage)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-top:28px;">
      <tr>
        <td>
          <a class="email-button" href="${replyHref}" style="display:inline-block; padding:15px 24px; border-radius:999px; background:#c0563a; color:#ffffff; font-size:14px; line-height:18px; font-weight:700; text-decoration:none;">Répondre à ${safeName} &nbsp;&rarr;</a>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-top:30px; padding-top:20px; border-top:1px solid #e0d9cb;">
      <tr>
        <td style="font-size:11px; line-height:18px; color:#8a8272;">Reçu le ${escapeHtml(receivedAt)}<br />Référence : ${safeRequestId}</td>
        <td align="right" valign="top" style="font-size:11px; line-height:18px; color:#8a8272;">Réponds directement à cet e-mail.</td>
      </tr>
    </table>`;

  return {
    subject: `[CV] Nouvelle demande — ${name}`,
    text: `Nouvelle demande depuis le CV\n\nNom : ${name}\nE-mail : ${email}\n\nMessage :\n${message}\n\nRéférence : ${requestId}`,
    html: emailDocument({
      language: 'fr',
      preheader: `${name} vient de vous contacter depuis votre portfolio`,
      eyebrow: 'Nouveau contact',
      title: 'Une nouvelle<br />demande est arrivée.',
      intro: `${safeName} souhaite échanger avec vous. Toutes les informations utiles sont regroupées ci-dessous.`,
      content,
      automatic: false,
    }),
  };
}

export function confirmationEmail({ language, name, message }) {
  const safeName = escapeHtml(name);
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');
  const isEnglish = language === 'en';

  const copy = isEnglish
    ? {
        subject: 'Your message to Jean Cazals has been received',
        preheader: 'Your message is safely in my inbox',
        eyebrow: 'Message received',
        title: `Thank you,<br />${safeName}.`,
        intro:
          'Your message is safely in my inbox. I will read it carefully and get back to you personally as soon as possible.',
        messageLabel: 'A copy of your message',
        nextTitle: 'What happens next?',
        nextBody:
          'I will reply directly to the email address you provided. No ticket number, no robot — just a personal response.',
        signoff: 'See you soon,',
        text: `Hello ${name},\n\nThank you for your message. I have received your request and will reply personally as soon as possible.\n\nYour message:\n${message}\n\nJean Cazals`,
      }
    : {
        subject: 'Votre message à Jean Cazals a bien été reçu',
        preheader: 'Votre message est bien arrivé dans ma boîte de réception',
        eyebrow: 'Message reçu',
        title: `Merci,<br />${safeName}.`,
        intro:
          'Votre message est bien arrivé dans ma boîte de réception. Je vais le lire attentivement et je vous répondrai personnellement dès que possible.',
        messageLabel: 'Copie de votre message',
        nextTitle: 'Et maintenant ?',
        nextBody:
          'Je vous répondrai directement à l’adresse e-mail indiquée. Pas de numéro de ticket, pas de robot — une réponse personnelle.',
        signoff: 'À très vite,',
        text: `Bonjour ${name},\n\nMerci pour votre message. J’ai bien reçu votre demande et je vous répondrai personnellement dès que possible.\n\nVotre message :\n${message}\n\nJean Cazals`,
      };

  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; background:#f3eddf; border-radius:14px;">
      <tr>
        <td width="48" valign="top" style="width:48px; padding:22px 0 22px 24px;">
          <span style="display:inline-block; width:12px; height:12px; margin-top:3px; border-radius:12px; background:#f2c94c; box-shadow:0 0 0 6px #fff7d7;"></span>
        </td>
        <td style="padding:20px 24px 20px 8px;">
          <p style="margin:0; font-family:Georgia,'Times New Roman',serif; font-size:21px; line-height:27px; color:#1e1b16;">${copy.nextTitle}</p>
          <p style="margin:8px 0 0; font-size:14px; line-height:22px; color:#5a544a;">${copy.nextBody}</p>
        </td>
      </tr>
    </table>
    ${messageCard(copy.messageLabel, safeMessage)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-top:30px;">
      <tr>
        <td>
          <p style="margin:0; font-size:14px; line-height:22px; color:#5a544a;">${copy.signoff}</p>
          <p style="margin:5px 0 0; font-family:Georgia,'Times New Roman',serif; font-size:27px; line-height:32px; color:#1e1b16;">Jean Cazals</p>
          <p style="margin:4px 0 0; font-size:11px; line-height:18px; letter-spacing:1.4px; color:#c0563a; text-transform:uppercase;">Développeur full-stack</p>
        </td>
      </tr>
    </table>`;

  return {
    subject: copy.subject,
    text: copy.text,
    html: emailDocument({
      language,
      preheader: copy.preheader,
      eyebrow: copy.eyebrow,
      title: copy.title,
      intro: copy.intro,
      content,
      automatic: true,
    }),
  };
}

import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import * as L from 'leaflet';

type Language = 'fr' | 'en';
type CodeTab = 'fetch' | 'curl' | 'json';
type PinId = 'g7' | 'hetic' | 'mariage' | 'golf';
type ContactError = 'invalid' | 'rateLimit' | 'generic' | null;
type TokenKind = 'punct' | 'key' | 'str' | 'fn' | 'kw' | 'plain' | 'ok' | 'dim';

interface Token {
  text: string;
  kind: TokenKind;
}

interface Pin {
  id: PinId;
  name: string;
  tag: string;
  description: string;
  short: string;
  coordinates: L.LatLngExpression;
  color: string;
}

const copy = {
  fr: {
    nav: {
      about: 'À propos',
      experience: 'Parcours',
      skills: 'Compétences',
      map: 'Carte',
      contact: 'Contact',
      cv: 'CV PDF',
      menu: 'Ouvrir le menu',
    },
    hero: {
      eyebrow: 'Développeur full-stack',
      available: 'Disponible pour de nouveaux projets',
      role: 'Je conçois et je fais tourner des produits web,',
      roleTail: "du front au back, jusqu'en prod.",
      tagline:
        "4 ans d'expérience à transformer des besoins métier en outils fiables — du dispatch de taxis parisiens aux microservices critiques.",
      primary: 'Voir le parcours',
      secondary: 'Me contacter',
      locationLabel: 'BASÉ À',
      experienceLabel: 'EXPÉRIENCE',
      experienceValue: '4 ans · full-stack',
      languagesLabel: 'LANGUES',
      languagesValue: 'Français · Anglais bilingue',
      currentLabel: 'ACTUELLEMENT',
      scroll: 'Faites défiler pour découvrir le parcours',
    },
    about: {
      title: 'À propos',
      lead: 'Développeur full-stack confiant et direct : je pars du besoin réel et je livre des solutions concrètes, fiables et pensées pour ceux qui les utilisent.',
      body: "Côté front, je travaille surtout avec Angular et React (TypeScript, Tailwind) pour des interfaces modernes et maintenables. Côté back, je construis des API et des systèmes d'authentification avec Spring Boot, NestJS, Node.js, Django et Python. J'interviens sur tout le cycle — analyse, conception, développement, intégration, tests et mise en production — avec un vrai soin pour la qualité, la performance, la sécurité et la maintenabilité.",
    },
    journey: {
      title: 'Parcours',
      intro:
        'De ma formation en business à l’ESSEC à mon poste de développeur full-stack chez G7, voici les étapes qui ont construit mon parcours.',
      items: [
        {
          kind: 'education',
          label: 'Formation',
          period: '2018 — 2020',
          company: 'ESSEC Business School',
          place: 'France',
          role: 'E-Bachelor',
          description: 'Formation en management, commerce et entrepreneuriat.',
          bullets: [],
          stack: [],
        },
        {
          kind: 'transition',
          label: 'Réorientation',
          period: '2020 — 2021',
          company: 'Réorientation',
          place: '',
          role: 'Du business au développement web',
          description:
            'Décision de réorienter mon parcours vers la conception et le développement d’applications web.',
          bullets: [],
          stack: [],
        },
        {
          kind: 'education',
          label: 'Formation',
          period: '2021 · 6 mois',
          company: 'O’clock',
          place: 'France',
          role: 'Bootcamp développement web',
          description: 'Formation intensive de six mois aux fondamentaux du développement web.',
          bullets: [],
          stack: [],
        },
        {
          kind: 'education',
          label: 'Formation',
          period: 'sept. 2022 — oct. 2024',
          company: 'HETIC',
          place: 'Montreuil, France',
          role: 'Licence Développeur Web',
          description: 'Conception et développement d’applications web, du front-end au back-end.',
          bullets: [],
          stack: [],
        },
        {
          kind: 'education',
          label: 'Formation',
          period: 'oct. 2024 — déc. 2026',
          company: 'HETIC',
          place: 'Montreuil, France',
          role: 'Master CTO & Tech Lead',
          description: 'Architecture, management technique et pilotage de produits numériques.',
          bullets: [],
          stack: [],
        },
        {
          kind: 'experience',
          label: 'Expérience',
          period: "2024 — aujourd'hui",
          company: 'G7 Taxis',
          place: 'Paris, France',
          role: 'Développeur web full-stack',
          description: '',
          bullets: [
            "Développement et maintenance des outils internes de l'entreprise.",
            'Logiciel de prise de commande et de dispatch des taxis.',
            'CRM de gestion des taxis et des chauffeurs.',
            'Deux outils de test des microservices critiques de la société.',
          ],
          stack: [
            'Angular',
            'React',
            'TypeScript',
            'NestJS',
            'Spring Boot',
            'PostgreSQL',
            'MongoDB',
            'Docker',
          ],
        },
      ],
    },
    skills: {
      title: 'Compétences techniques',
      groups: [
        {
          name: 'Front-end',
          items: ['Angular', 'React', 'TypeScript', 'Bootstrap', 'Tailwind CSS'],
        },
        { name: 'Back-end', items: ['Spring Boot', 'NestJS', 'Node.js', 'Django', 'Python'] },
        { name: 'Bases de données', items: ['PostgreSQL', 'SQL', 'MongoDB'] },
        { name: 'DevOps & outils', items: ['Docker', 'GitLab CI/CD', 'GitHub Actions', 'Git'] },
      ],
    },
    projects: {
      title: 'Projets',
      intro: 'Trois projets personnels — dont Gift Finder, déjà en ligne.',
      visit: 'Voir le projet',
      items: [
        {
          no: 'P1',
          status: 'En cours',
          live: false,
          name: 'Gestion de mariage',
          description:
            'Une plateforme pour organiser un mariage de A à Z : invités, prestataires, budget et planning au même endroit.',
          stack: ['React', 'NestJS', 'PostgreSQL'],
          url: '',
        },
        {
          no: 'P2',
          status: 'En cours',
          live: false,
          name: 'CRM Club de golf',
          description:
            "Un CRM pour gérer les membres d'un club de golf : adhésions, réservations et suivi de l'activité.",
          stack: ['Angular', 'Spring Boot', 'PostgreSQL'],
          url: '',
        },
        {
          no: 'P3',
          status: 'En ligne',
          live: true,
          name: 'Gift Finder',
          description:
            'Un assistant conversationnel qui propose des idées cadeaux personnalisées grâce à l’IA, puis permet de créer et partager sa liste.',
          stack: ['Angular', 'Express', 'PostgreSQL', 'Qwen'],
          url: 'https://gift-finder.duckdns.org',
        },
      ],
    },
    map: {
      title: 'Paris, sur la carte',
      intro: 'Cliquez sur les points pour explorer où se passe mon parcours et mes projets.',
      hint: 'Cliquez sur un autre point pour changer.',
      pins: {
        g7: {
          name: 'G7 Taxis',
          tag: 'EXPÉRIENCE',
          description:
            'Développeur full-stack sur les outils internes : dispatch des taxis, CRM et tests des microservices critiques.',
          short: 'G7',
        },
        hetic: {
          name: 'HETIC',
          tag: 'FORMATION',
          description:
            'École du web à Montreuil : Licence Développeur Web puis Master CTO & Tech Lead (2022 → 2026).',
          short: 'HETIC',
        },
        mariage: {
          name: 'Gestion de mariage',
          tag: 'PROJET · BIENTÔT',
          description:
            "Plateforme d'organisation de mariage — invités, prestataires, budget et planning. En cours de développement.",
          short: 'Projet · Mariage',
        },
        golf: {
          name: 'CRM Club de golf',
          tag: 'PROJET · BIENTÔT',
          description:
            "CRM de gestion des membres d'un club de golf : adhésions, réservations et suivi. En cours de développement.",
          short: 'Projet · Golf',
        },
      },
    },
    hobbies: {
      title: 'En dehors du code',
      tech: {
        title: 'IA & nouvelles technologies',
        description:
          'Je teste les outils qui changent déjà notre façon de concevoir et de développer.',
        items: ['ChatGPT', 'Claude', 'Codex', 'Cursor', 'GitHub Copilot', 'Agents IA', 'MCP'],
      },
      sport: {
        title: 'Sports',
        description: 'Sur le terrain ou avec une raquette.',
        items: ['Football', 'Tennis', 'Padel'],
      },
      music: {
        eyebrow: 'En écoute',
        title: 'Ma sélection',
        description: 'Des classiques aux sons actuels.',
        choose: 'Choisir un morceau',
      },
    },
    contact: {
      title: 'Parlons-en.',
      body: 'Un poste, un projet, une simple question ? Remplissez la requête — elle se construit en direct à droite.',
      name: 'votre nom',
      email: 'vous@email.com',
      message: 'votre message…',
      run: 'envoyer la requête',
      sending: 'envoi en cours…',
      live: 'live',
      queued: 'demande reçue',
      codeHint: '// requête générée en temps réel — fetch, cURL ou JSON, au choix',
      sentTitle: 'Merci !',
      sentBody:
        'Votre demande a bien été envoyée. Un e-mail de confirmation vient de vous être adressé et je vous répondrai personnellement dès que possible.',
      invalid: 'Vérifiez les informations saisies avant de réessayer.',
      rateLimit: 'Trop de demandes ont été envoyées. Réessayez dans quelques minutes.',
      error: "L'envoi a échoué. Réessayez dans un instant ou écrivez-moi à jeancdfpro@gmail.com.",
      reset: 'Écrire un autre message',
    },
    socials: { label: 'Profils sociaux' },
    footer: { top: 'Haut de page' },
  },
  en: {
    nav: {
      about: 'About',
      experience: 'Career',
      skills: 'Skills',
      map: 'Map',
      contact: 'Contact',
      cv: 'PDF CV',
      menu: 'Open menu',
    },
    hero: {
      eyebrow: 'Full-stack developer',
      available: 'Open to new projects',
      role: 'I design and ship web products,',
      roleTail: 'front to back, all the way to prod.',
      tagline:
        '4 years turning business needs into reliable tools — from Parisian taxi dispatch to critical microservices.',
      primary: 'See my career',
      secondary: 'Get in touch',
      locationLabel: 'BASED IN',
      experienceLabel: 'EXPERIENCE',
      experienceValue: '4 yrs · full-stack',
      languagesLabel: 'LANGUAGES',
      languagesValue: 'French · English (bilingual)',
      currentLabel: 'CURRENTLY',
      scroll: 'Scroll to explore the journey',
    },
    about: {
      title: 'About',
      lead: 'A confident, straight-to-the-point full-stack developer: I start from the real need and ship concrete, reliable solutions built for the people who use them.',
      body: 'On the front end I mostly work with Angular and React (TypeScript, Tailwind) for modern, maintainable interfaces. On the back end I build APIs and authentication systems with Spring Boot, NestJS, Node.js, Django and Python. I cover the whole cycle — analysis, design, development, integration, testing and production — with real care for quality, performance, security and maintainability.',
    },
    journey: {
      title: 'Career & education',
      intro:
        'From studying business at ESSEC to working as a full-stack developer at G7, these are the steps that shaped my path.',
      items: [
        {
          kind: 'education',
          label: 'Education',
          period: '2018 — 2020',
          company: 'ESSEC Business School',
          place: 'France',
          role: 'E-Bachelor',
          description: 'Coursework in management, business and entrepreneurship.',
          bullets: [],
          stack: [],
        },
        {
          kind: 'transition',
          label: 'Career change',
          period: '2020 — 2021',
          company: 'Career change',
          place: '',
          role: 'From business to web development',
          description: 'A deliberate shift toward designing and building web applications.',
          bullets: [],
          stack: [],
        },
        {
          kind: 'education',
          label: 'Education',
          period: '2021 · 6 months',
          company: 'O’clock',
          place: 'France',
          role: 'Web development bootcamp',
          description: 'Six-month intensive course covering the fundamentals of web development.',
          bullets: [],
          stack: [],
        },
        {
          kind: 'education',
          label: 'Education',
          period: 'Sep 2022 — Oct 2024',
          company: 'HETIC',
          place: 'Montreuil, France',
          role: "Bachelor's in Web Development",
          description: 'Designing and building web applications across the front end and back end.',
          bullets: [],
          stack: [],
        },
        {
          kind: 'education',
          label: 'Education',
          period: 'Oct 2024 — Dec 2026',
          company: 'HETIC',
          place: 'Montreuil, France',
          role: "Master's in CTO & Tech Lead",
          description: 'Software architecture, technical leadership and digital product delivery.',
          bullets: [],
          stack: [],
        },
        {
          kind: 'experience',
          label: 'Experience',
          period: '2024 — present',
          company: 'G7 Taxis',
          place: 'Paris, France',
          role: 'Full-stack web developer',
          description: '',
          bullets: [
            "Building and maintaining the company's internal tools.",
            'Taxi ordering and dispatch software.',
            'CRM to manage taxis and drivers.',
            "Two testing tools for the company's critical microservices.",
          ],
          stack: [
            'Angular',
            'React',
            'TypeScript',
            'NestJS',
            'Spring Boot',
            'PostgreSQL',
            'MongoDB',
            'Docker',
          ],
        },
      ],
    },
    skills: {
      title: 'Technical skills',
      groups: [
        {
          name: 'Front-end',
          items: ['Angular', 'React', 'TypeScript', 'Bootstrap', 'Tailwind CSS'],
        },
        { name: 'Back-end', items: ['Spring Boot', 'NestJS', 'Node.js', 'Django', 'Python'] },
        { name: 'Databases', items: ['PostgreSQL', 'SQL', 'MongoDB'] },
        { name: 'DevOps & tools', items: ['Docker', 'GitLab CI/CD', 'GitHub Actions', 'Git'] },
      ],
    },
    projects: {
      title: 'Projects',
      intro: 'Three personal projects — including Gift Finder, now live.',
      visit: 'View project',
      items: [
        {
          no: 'P1',
          status: 'In progress',
          live: false,
          name: 'Wedding planner',
          description:
            'A platform to organize a wedding end to end: guests, vendors, budget and schedule in one place.',
          stack: ['React', 'NestJS', 'PostgreSQL'],
          url: '',
        },
        {
          no: 'P2',
          status: 'In progress',
          live: false,
          name: 'Golf club CRM',
          description:
            "A CRM to manage a golf club's members: memberships, bookings and activity tracking.",
          stack: ['Angular', 'Spring Boot', 'PostgreSQL'],
          url: '',
        },
        {
          no: 'P3',
          status: 'Live',
          live: true,
          name: 'Gift Finder',
          description:
            'A conversational assistant that uses AI to suggest personalized gift ideas, then lets users create and share their list.',
          stack: ['Angular', 'Express', 'PostgreSQL', 'Qwen'],
          url: 'https://gift-finder.duckdns.org',
        },
      ],
    },
    map: {
      title: 'Paris, on the map',
      intro: 'Click the points to explore where my career and projects happen.',
      hint: 'Click another point to switch.',
      pins: {
        g7: {
          name: 'G7 Taxis',
          tag: 'EXPERIENCE',
          description:
            'Full-stack developer on internal tools: taxi dispatch, CRM and testing of critical microservices.',
          short: 'G7',
        },
        hetic: {
          name: 'HETIC',
          tag: 'EDUCATION',
          description:
            "Web school in Montreuil: Web Developer bachelor's then CTO & Tech Lead master's (2022 → 2026).",
          short: 'HETIC',
        },
        mariage: {
          name: 'Wedding planner',
          tag: 'PROJECT · SOON',
          description:
            'Wedding organization platform — guests, vendors, budget and schedule. Currently in development.',
          short: 'Project · Wedding',
        },
        golf: {
          name: 'Golf club CRM',
          tag: 'PROJECT · SOON',
          description:
            "CRM to manage a golf club's members: memberships, bookings and tracking. Currently in development.",
          short: 'Project · Golf',
        },
      },
    },
    hobbies: {
      title: 'Beyond the code',
      tech: {
        title: 'AI & emerging technology',
        description: 'I explore the tools already reshaping how we design and build.',
        items: ['ChatGPT', 'Claude', 'Codex', 'Cursor', 'GitHub Copilot', 'AI agents', 'MCP'],
      },
      sport: {
        title: 'Sports',
        description: 'On the pitch or with a racket.',
        items: ['Football', 'Tennis', 'Padel'],
      },
      music: {
        eyebrow: 'Now playing',
        title: 'My selection',
        description: 'From timeless classics to current sounds.',
        choose: 'Choose a track',
      },
    },
    contact: {
      title: "Let's talk.",
      body: 'A role, a project, a quick question? Fill in the request — it builds live on the right.',
      name: 'your name',
      email: 'you@email.com',
      message: 'your message…',
      run: 'send request',
      sending: 'sending…',
      live: 'live',
      queued: 'request received',
      codeHint: '// request generated in real time — fetch, cURL or JSON, your pick',
      sentTitle: 'Thanks!',
      sentBody:
        'Your request has been sent. A confirmation email is on its way, and I will reply personally as soon as possible.',
      invalid: 'Please check the information you entered before trying again.',
      rateLimit: 'Too many requests have been sent. Please try again in a few minutes.',
      error:
        'Unable to send your request. Please try again shortly or email me at jeancdfpro@gmail.com.',
      reset: 'Write another message',
    },
    socials: { label: 'Social profiles' },
    footer: { top: 'Back to top' },
  },
} as const;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapElement') private mapElement?: ElementRef<HTMLDivElement>;

  private readonly sanitizer = inject(DomSanitizer);

  readonly language = signal<Language>('fr');
  readonly t = computed(() => copy[this.language()]);
  readonly mobileMenuOpen = signal(false);
  readonly activeTab = signal<CodeTab>('fetch');
  readonly selectedPinId = signal<PinId>('g7');
  readonly sent = signal(false);
  readonly sending = signal(false);
  readonly contactError = signal<ContactError>(null);
  readonly msgId = signal('');
  readonly year = new Date().getFullYear();
  readonly form = { name: '', email: '', message: '', website: '' };
  readonly selectedTrackIndex = signal(0);
  readonly musicTracks = [
    {
      no: '01',
      title: 'A Day in the Life',
      artist: 'The Beatles',
      spotifyId: '4XiDAxr6alWzxm24i2Rt4K',
    },
    { no: '02', title: 'Sticky', artist: 'Drake', spotifyId: '4rmVZajAF7PkrCagGPHbqa' },
    {
      no: '03',
      title: 'How Deep Is Your Love',
      artist: 'Bee Gees',
      spotifyId: '2JoZzpdeP2G6Csfdq5aLXP',
    },
    { no: '04', title: 'Neighbors', artist: 'J. Cole', spotifyId: '0utlOiJy2weVl9WTkcEWHy' },
    {
      no: '05',
      title: 'Give a Little Bit',
      artist: 'Supertramp',
      spotifyId: '7w9iQxnOMKhJmkLd1hJ4GJ',
    },
  ] as const;
  readonly selectedTrack = computed(() => this.musicTracks[this.selectedTrackIndex()]!);
  readonly spotifyEmbedUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://open.spotify.com/embed/track/${this.selectedTrack().spotifyId}?utm_source=generator&theme=0`,
    ),
  );

  readonly pins = computed<Pin[]>(() => {
    const labels = this.t().map.pins;
    return [
      { id: 'g7', ...labels.g7, coordinates: [48.8988602, 2.304037], color: '#f2c94c' },
      { id: 'hetic', ...labels.hetic, coordinates: [48.8555, 2.439], color: '#c0563a' },
      { id: 'mariage', ...labels.mariage, coordinates: [48.8792259, 2.2832742], color: '#e9e1cf' },
      { id: 'golf', ...labels.golf, coordinates: [48.8941179, 2.2855198], color: '#97a798' },
    ];
  });
  readonly selectedPin = computed(
    () => this.pins().find((pin) => pin.id === this.selectedPinId()) ?? this.pins()[0]!,
  );

  private map?: L.Map;
  private markers = new Map<PinId, L.Marker>();
  private observer?: IntersectionObserver;
  private mapResizeObserver?: ResizeObserver;
  private mapRefreshFrame?: number;
  private mapRevealTimer?: number;

  contactErrorMessage(): string {
    const error = this.contactError();
    if (error === 'invalid') return this.t().contact.invalid;
    if (error === 'rateLimit') return this.t().contact.rateLimit;
    return error ? this.t().contact.error : '';
  }

  private clip(value: string, placeholder: string): string {
    const trimmed = (value || '').replace(/\s+/g, ' ').trim();
    if (!trimmed) return placeholder;
    return trimmed.length > 46 ? `${trimmed.slice(0, 46)}…` : trimmed;
  }

  private tok(text: string, kind: TokenKind): Token {
    return { text, kind };
  }

  codeLines(): Token[][] {
    const t = (text: string, kind: TokenKind) => this.tok(text, kind);
    const q = (value: string) => `"${value}"`;
    const url =
      this.activeTab() === 'curl' ? 'https://cv-de-jean.duckdns.org/api/contact' : '/api/contact';
    const n = this.clip(this.form.name, '…');
    const e = this.clip(this.form.email, '…');
    const m = this.clip(this.form.message, '…');
    const language = this.language();

    if (this.activeTab() === 'curl') {
      return [
        [
          t('$ ', 'punct'),
          t('curl ', 'fn'),
          t('-X POST', 'kw'),
          t(` ${url} `, 'plain'),
          t('\\', 'punct'),
        ],
        [t('  -H ', 'kw'), t(q('Content-Type: application/json'), 'str'), t(' \\', 'punct')],
        [t('  -d ', 'kw'), t("'{", 'punct')],
        [
          t('      ', 'plain'),
          t(q('name'), 'key'),
          t(': ', 'punct'),
          t(q(n), 'str'),
          t(',', 'punct'),
        ],
        [
          t('      ', 'plain'),
          t(q('email'), 'key'),
          t(': ', 'punct'),
          t(q(e), 'str'),
          t(',', 'punct'),
        ],
        [
          t('      ', 'plain'),
          t(q('message'), 'key'),
          t(': ', 'punct'),
          t(q(m), 'str'),
          t(',', 'punct'),
        ],
        [t('      ', 'plain'), t(q('language'), 'key'), t(': ', 'punct'), t(q(language), 'str')],
        [t("  }'", 'punct')],
      ];
    }

    if (this.activeTab() === 'json') {
      return [
        [t('{', 'punct')],
        [t('  ', 'plain'), t(q('name'), 'key'), t(': ', 'punct'), t(q(n), 'str'), t(',', 'punct')],
        [t('  ', 'plain'), t(q('email'), 'key'), t(': ', 'punct'), t(q(e), 'str'), t(',', 'punct')],
        [
          t('  ', 'plain'),
          t(q('message'), 'key'),
          t(': ', 'punct'),
          t(q(m), 'str'),
          t(',', 'punct'),
        ],
        [t('  ', 'plain'), t(q('language'), 'key'), t(': ', 'punct'), t(q(language), 'str')],
        [t('}', 'punct')],
      ];
    }

    return [
      [t('await ', 'kw'), t('fetch', 'fn'), t('(', 'punct'), t(q(url), 'str'), t(', {', 'punct')],
      [t('  method', 'key'), t(': ', 'punct'), t(q('POST'), 'str'), t(',', 'punct')],
      [
        t('  headers', 'key'),
        t(': { ', 'punct'),
        t(q('Content-Type'), 'key'),
        t(': ', 'punct'),
        t(q('application/json'), 'str'),
        t(' },', 'punct'),
      ],
      [
        t('  body', 'key'),
        t(': ', 'punct'),
        t('JSON', 'fn'),
        t('.', 'punct'),
        t('stringify', 'fn'),
        t('({', 'punct'),
      ],
      [t('    name', 'key'), t(': ', 'punct'), t(q(n), 'str'), t(',', 'punct')],
      [t('    email', 'key'), t(': ', 'punct'), t(q(e), 'str'), t(',', 'punct')],
      [t('    message', 'key'), t(': ', 'punct'), t(q(m), 'str'), t(',', 'punct')],
      [t('    language', 'key'), t(': ', 'punct'), t(q(language), 'str')],
      [t('  })', 'punct')],
      [t('})', 'punct')],
    ];
  }

  responseLines(): Token[][] {
    const t = (text: string, kind: TokenKind) => this.tok(text, kind);
    const q = (value: string) => `"${value}"`;
    return [
      [t('← 202 ACCEPTED', 'ok'), t('   (142 ms)', 'dim')],
      [
        t('{ ', 'punct'),
        t(q('status'), 'key'),
        t(': ', 'punct'),
        t(q('received'), 'str'),
        t(', ', 'punct'),
        t(q('id'), 'key'),
        t(': ', 'punct'),
        t(q(this.msgId()), 'str'),
        t(' }', 'punct'),
      ],
    ];
  }

  ngAfterViewInit(): void {
    this.observeSections();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.mapResizeObserver?.disconnect();
    if (this.mapRefreshFrame) cancelAnimationFrame(this.mapRefreshFrame);
    if (this.mapRevealTimer) window.clearTimeout(this.mapRevealTimer);
    this.map?.remove();
  }

  toggleLanguage(): void {
    this.language.update((language) => (language === 'fr' ? 'en' : 'fr'));
    document.documentElement.lang = this.language();
    this.scheduleMapRefresh();
  }

  toggleMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  setTab(tab: CodeTab): void {
    this.activeTab.set(tab);
  }

  selectPin(pinId: PinId): void {
    this.selectedPinId.set(pinId);
    const pin = this.pins().find((candidate) => candidate.id === pinId);
    if (pin) {
      this.map?.flyTo(pin.coordinates, 13, { duration: 0.7 });
      this.markers.get(pinId)?.openTooltip();
    }
  }

  selectTrack(index: number): void {
    this.selectedTrackIndex.set(index);
  }

  async submitContact(form: NgForm): Promise<void> {
    if (this.sending()) return;

    this.contactError.set(null);

    if (form.invalid) {
      form.control.markAllAsTouched();
      this.contactError.set('invalid');
      return;
    }

    this.sending.set(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...this.form, language: this.language() }),
      });
      const result = (await response.json().catch(() => ({}))) as { id?: string };

      if (!response.ok) {
        this.contactError.set(response.status === 429 ? 'rateLimit' : 'generic');
        return;
      }

      this.msgId.set(result.id || 'received');
      this.sent.set(true);
    } catch {
      this.contactError.set('generic');
    } finally {
      this.sending.set(false);
    }
  }

  resetContact(form: NgForm): void {
    this.sent.set(false);
    this.sending.set(false);
    this.contactError.set(null);
    this.msgId.set('');
    form.resetForm();
  }

  private createMap(): void {
    if (this.map || !this.mapElement) return;

    const mapContainer = this.mapElement.nativeElement;
    this.map = L.map(mapContainer, {
      center: [48.882, 2.328],
      zoom: 11.2,
      minZoom: 10,
      maxZoom: 17,
      scrollWheelZoom: false,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    for (const pin of this.pins()) {
      const icon = L.divIcon({
        className: 'portfolio-map-marker',
        html: `<span style="--pin-color:${pin.color}"><b></b></span>`,
        iconSize: [32, 42],
        iconAnchor: [16, 40],
      });
      const marker = L.marker(pin.coordinates, { icon })
        .addTo(this.map)
        .bindTooltip(pin.name, { direction: 'top', offset: [0, -34] })
        .on('click', () => this.selectedPinId.set(pin.id));
      this.markers.set(pin.id, marker);
    }

    if ('ResizeObserver' in window) {
      this.mapResizeObserver = new ResizeObserver(() => this.scheduleMapRefresh());
      this.mapResizeObserver.observe(mapContainer);
    }

    this.map.whenReady(() => this.scheduleMapRefresh());
  }

  private scheduleMapRefresh(): void {
    if (!this.map) return;
    if (this.mapRefreshFrame) cancelAnimationFrame(this.mapRefreshFrame);

    this.mapRefreshFrame = requestAnimationFrame(() => {
      this.mapRefreshFrame = requestAnimationFrame(() => {
        this.map?.invalidateSize({ pan: false, debounceMoveend: true });
        this.mapRefreshFrame = undefined;
      });
    });
  }

  private observeSections(): void {
    const sections = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      sections.forEach((element) => element.classList.add('is-visible'));
      this.createMap();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          entry.target.classList.add('is-visible');
          if (entry.target.id === 'carte') {
            this.createMap();
            this.scheduleMapRefresh();
            if (this.mapRevealTimer) window.clearTimeout(this.mapRevealTimer);
            this.mapRevealTimer = window.setTimeout(() => this.scheduleMapRefresh(), 750);
          }

          this.observer?.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );

    sections.forEach((element) => this.observer?.observe(element));
  }
}

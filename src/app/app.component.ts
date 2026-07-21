import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import * as L from 'leaflet';

type Language = 'fr' | 'en';
type CodeTab = 'fetch' | 'curl' | 'json';
type PinId = 'g7' | 'hetic' | 'mariage' | 'golf';

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
      cv: 'Télécharger le CV',
      menu: 'Ouvrir le menu',
    },
    hero: {
      eyebrow: 'Développeur full-stack',
      available: 'Disponible à Paris',
      role: 'Je conçois des produits web',
      roleTail: 'utiles et durables.',
      tagline:
        'Du besoin métier à la mise en production, je transforme des idées complexes en expériences simples, robustes et maintenables.',
      primary: 'Voir mon parcours',
      secondary: 'Me contacter',
      locationLabel: 'Localisation',
      experienceLabel: 'Expérience',
      experienceValue: '4 ans',
      currentLabel: 'Actuellement',
      scroll: 'Découvrir mon profil',
    },
    about: {
      title: 'À propos',
      lead:
        'Développeur full-stack avec une sensibilité produit, j’aime construire des interfaces soignées autant que des systèmes solides.',
      body:
        'Je participe à toutes les étapes d’un projet : analyse du besoin, conception technique, développement, intégration et mise en production. Habitué au travail en équipe, j’accorde une attention particulière à la qualité du code, aux performances, à la sécurité et à la maintenabilité.',
      statA: 'années à transformer des besoins métier en produits web',
      statB: 'vision front, back, data et déploiement',
    },
    experience: {
      title: 'Parcours',
      items: [
        {
          period: 'Aujourd’hui',
          company: 'G7 Taxis',
          role: 'Développeur web',
          place: 'Paris, Île-de-France',
          description:
            'Développement et évolution d’applications métier, de l’interface à l’API. Contribution aux choix techniques, aux revues de code, à la correction et à la mise en production.',
          tags: ['Angular', 'TypeScript', 'Spring Boot', 'API', 'CI/CD'],
        },
      ],
    },
    skills: {
      title: 'Compétences',
      groups: [
        { index: '01', name: 'Front-end', items: ['Angular', 'React', 'TypeScript', 'Bootstrap', 'Tailwind CSS'] },
        { index: '02', name: 'Back-end', items: ['Spring Boot', 'NestJS', 'Node.js', 'Django', 'Python'] },
        { index: '03', name: 'Data', items: ['PostgreSQL', 'SQL', 'MongoDB', 'Modélisation'] },
        { index: '04', name: 'DevOps', items: ['Docker', 'GitLab CI/CD', 'GitHub Actions', 'Déploiement'] },
      ],
    },
    projects: {
      title: 'Projets choisis',
      intro: 'Quelques terrains de jeu où produit, design et technique avancent ensemble.',
      visit: 'Voir le projet',
      items: [
        {
          number: '01',
          name: 'Mon Mariage',
          category: 'Produit web · Full-stack',
          description: 'Une expérience numérique pensée pour rendre l’organisation d’un mariage plus fluide et plus personnelle.',
          stack: ['Angular', 'NestJS', 'PostgreSQL'],
          tone: 'rust',
        },
        {
          number: '02',
          name: 'Carnet de golf',
          category: 'Application · Data',
          description: 'Un carnet de jeu clair pour suivre ses parties, ses parcours et sa progression au fil du temps.',
          stack: ['TypeScript', 'API', 'Data'],
          tone: 'forest',
        },
        {
          number: '03',
          name: 'Expérimentations',
          category: 'Lab · Produit',
          description: 'Des prototypes courts pour explorer de nouvelles interactions, architectures et idées de produit.',
          stack: ['Angular', 'UX', 'Open source'],
          tone: 'yellow',
        },
      ],
    },
    education: {
      title: 'Formation',
      items: [
        {
          period: 'Oct. 2024 — Déc. 2026',
          school: 'HETIC',
          degree: 'Master — CTO & Tech Lead',
          description: 'Pilotage technique, architecture, stratégie produit et management des équipes tech.',
        },
        {
          period: 'Sept. 2022 — Oct. 2024',
          school: 'HETIC',
          degree: 'Licence — Développeur web',
          description: 'Conception et développement d’applications web modernes, du front-end au back-end.',
        },
      ],
    },
    map: {
      title: 'Mon Paris',
      intro: 'Un parcours professionnel et personnel ancré dans le Grand Paris.',
      hint: 'Sélectionnez un lieu sur la carte ou dans la liste.',
      pins: {
        g7: {
          name: 'G7 Taxis',
          tag: 'Aujourd’hui · Travail',
          description: 'Là où je développe des applications métier au service de la mobilité parisienne.',
          short: 'G7',
        },
        hetic: {
          name: 'HETIC',
          tag: 'Formation · Tech',
          description: 'Le terrain où j’approfondis architecture, produit et leadership technique.',
          short: 'HETIC',
        },
        mariage: {
          name: 'Mon Mariage',
          tag: 'Side project · Produit',
          description: 'Un projet personnel où je relie conception produit, design et développement full-stack.',
          short: 'Projet mariage',
        },
        golf: {
          name: 'Carnet de golf',
          tag: 'Side project · Data',
          description: 'Une application née de l’envie de mêler pratique sportive, progression et données.',
          short: 'Projet golf',
        },
      },
    },
    hobbies: {
      title: 'En dehors du code',
      note: 'La curiosité reste mon meilleur outil — devant un écran comme ailleurs.',
      items: [
        { icon: '↗', name: 'Golf', detail: 'Précision, patience, progression.' },
        { icon: '◎', name: 'Produit', detail: 'Observer les usages et simplifier.' },
        { icon: '⌁', name: 'Veille tech', detail: 'Tester, apprendre, transmettre.' },
        { icon: '◇', name: 'Projets perso', detail: 'Transformer une idée en expérience.' },
      ],
    },
    contact: {
      title: 'Construisons quelque chose de solide.',
      body: 'Un projet, une opportunité ou simplement une question ? Écrivez-moi, je vous répondrai avec plaisir.',
      run: 'Exécuter la requête',
      live: 'aperçu en direct',
      codeHint: 'Le message reste sur votre appareil et s’ouvre dans votre messagerie.',
      sentTitle: 'Requête prête à partir.',
      sentBody: 'Votre messagerie va s’ouvrir avec le message prérempli.',
      sentCta: 'Ouvrir ma messagerie',
      reset: 'Écrire un autre message',
      name: 'votre nom',
      email: 'vous@email.com',
      message: 'votre message…',
    },
    footer: { top: 'Retour en haut' },
  },
  en: {
    nav: {
      about: 'About',
      experience: 'Experience',
      skills: 'Skills',
      map: 'Map',
      contact: 'Contact',
      cv: 'Download résumé',
      menu: 'Open menu',
    },
    hero: {
      eyebrow: 'Full-stack developer',
      available: 'Based in Paris',
      role: 'I build web products that are',
      roleTail: 'useful and built to last.',
      tagline:
        'From business need to production, I turn complex ideas into simple, robust and maintainable experiences.',
      primary: 'View my experience',
      secondary: 'Get in touch',
      locationLabel: 'Location',
      experienceLabel: 'Experience',
      experienceValue: '4 years',
      currentLabel: 'Currently',
      scroll: 'Discover my profile',
    },
    about: {
      title: 'About',
      lead:
        'I am a product-minded full-stack developer who cares as much about polished interfaces as resilient systems.',
      body:
        'I contribute throughout a project’s lifecycle: requirements, technical design, development, integration and delivery. Used to collaborative teams, I pay close attention to code quality, performance, security and maintainability.',
      statA: 'years turning business needs into web products',
      statB: 'across front-end, back-end, data and delivery',
    },
    experience: {
      title: 'Experience',
      items: [
        {
          period: 'Present',
          company: 'G7 Taxis',
          role: 'Web developer',
          place: 'Paris, France',
          description:
            'Building and evolving business applications, from user interfaces to APIs. Contributing to technical decisions, code reviews, maintenance and production delivery.',
          tags: ['Angular', 'TypeScript', 'Spring Boot', 'API', 'CI/CD'],
        },
      ],
    },
    skills: {
      title: 'Skills',
      groups: [
        { index: '01', name: 'Front-end', items: ['Angular', 'React', 'TypeScript', 'Bootstrap', 'Tailwind CSS'] },
        { index: '02', name: 'Back-end', items: ['Spring Boot', 'NestJS', 'Node.js', 'Django', 'Python'] },
        { index: '03', name: 'Data', items: ['PostgreSQL', 'SQL', 'MongoDB', 'Data modelling'] },
        { index: '04', name: 'DevOps', items: ['Docker', 'GitLab CI/CD', 'GitHub Actions', 'Delivery'] },
      ],
    },
    projects: {
      title: 'Selected projects',
      intro: 'A few playgrounds where product, design and engineering move together.',
      visit: 'View project',
      items: [
        {
          number: '01',
          name: 'Mon Mariage',
          category: 'Web product · Full-stack',
          description: 'A digital experience designed to make planning a wedding smoother and more personal.',
          stack: ['Angular', 'NestJS', 'PostgreSQL'],
          tone: 'rust',
        },
        {
          number: '02',
          name: 'Golf notebook',
          category: 'Application · Data',
          description: 'A clear playing journal for tracking rounds, courses and progress over time.',
          stack: ['TypeScript', 'API', 'Data'],
          tone: 'forest',
        },
        {
          number: '03',
          name: 'Experiments',
          category: 'Lab · Product',
          description: 'Short prototypes exploring new interactions, architectures and product ideas.',
          stack: ['Angular', 'UX', 'Open source'],
          tone: 'yellow',
        },
      ],
    },
    education: {
      title: 'Education',
      items: [
        {
          period: 'Oct. 2024 — Dec. 2026',
          school: 'HETIC',
          degree: 'Master — CTO & Tech Lead',
          description: 'Technical leadership, architecture, product strategy and engineering management.',
        },
        {
          period: 'Sep. 2022 — Oct. 2024',
          school: 'HETIC',
          degree: 'Bachelor — Web development',
          description: 'Design and development of modern web applications, from front-end to back-end.',
        },
      ],
    },
    map: {
      title: 'My Paris',
      intro: 'A professional and personal journey rooted in Greater Paris.',
      hint: 'Select a place on the map or in the list.',
      pins: {
        g7: {
          name: 'G7 Taxis',
          tag: 'Today · Work',
          description: 'Where I build business applications serving mobility across Paris.',
          short: 'G7',
        },
        hetic: {
          name: 'HETIC',
          tag: 'Education · Tech',
          description: 'Where I deepen my skills in architecture, product and technical leadership.',
          short: 'HETIC',
        },
        mariage: {
          name: 'Mon Mariage',
          tag: 'Side project · Product',
          description: 'A personal project connecting product thinking, design and full-stack engineering.',
          short: 'Wedding project',
        },
        golf: {
          name: 'Golf notebook',
          tag: 'Side project · Data',
          description: 'An application born from the idea of connecting sport, progress and data.',
          short: 'Golf project',
        },
      },
    },
    hobbies: {
      title: 'Beyond code',
      note: 'Curiosity remains my best tool — at a screen and everywhere else.',
      items: [
        { icon: '↗', name: 'Golf', detail: 'Precision, patience, progress.' },
        { icon: '◎', name: 'Product', detail: 'Watch how people use things. Simplify.' },
        { icon: '⌁', name: 'Tech watch', detail: 'Test, learn and share.' },
        { icon: '◇', name: 'Side projects', detail: 'Turn an idea into an experience.' },
      ],
    },
    contact: {
      title: 'Let’s build something solid.',
      body: 'A project, an opportunity or just a question? Send me a note — I will be happy to reply.',
      run: 'Run request',
      live: 'live preview',
      codeHint: 'Your message stays on your device and opens in your email client.',
      sentTitle: 'Request ready to go.',
      sentBody: 'Your email client will open with the message filled in.',
      sentCta: 'Open email client',
      reset: 'Write another message',
      name: 'your name',
      email: 'you@email.com',
      message: 'your message…',
    },
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

  readonly language = signal<Language>('fr');
  readonly t = computed(() => copy[this.language()]);
  readonly mobileMenuOpen = signal(false);
  readonly activeTab = signal<CodeTab>('fetch');
  readonly selectedPinId = signal<PinId>('g7');
  readonly sent = signal(false);
  readonly year = new Date().getFullYear();
  readonly form = { name: '', email: '', message: '' };

  readonly pins = computed<Pin[]>(() => {
    const labels = this.t().map.pins;
    return [
      { id: 'g7', ...labels.g7, coordinates: [48.9005, 2.3206], color: '#f2c94c' },
      { id: 'hetic', ...labels.hetic, coordinates: [48.8624, 2.4412], color: '#c0563a' },
      { id: 'mariage', ...labels.mariage, coordinates: [48.8736, 2.3392], color: '#e9e1cf' },
      { id: 'golf', ...labels.golf, coordinates: [48.8524, 2.3509], color: '#97a798' },
    ];
  });
  readonly selectedPin = computed(
    () => this.pins().find((pin) => pin.id === this.selectedPinId()) ?? this.pins()[0]!,
  );

  mailtoHref(): string {
    const subject = encodeURIComponent(`Contact CV — ${this.form.name || 'Nouveau message'}`);
    const body = encodeURIComponent(`${this.form.message}\n\n${this.form.name}\n${this.form.email}`);
    return `mailto:jeancdfpro@gmail.com?subject=${subject}&body=${body}`;
  }

  codePreview(): string {
    const data = {
      name: this.form.name || this.t().contact.name,
      email: this.form.email || this.t().contact.email,
      message: this.form.message || this.t().contact.message,
    };

    switch (this.activeTab()) {
      case 'curl':
        return `curl -X POST \\\n  https://jean-cazals.dev/contact \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(data, null, 2)}'`;
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'fetch':
        return `const response = await fetch(
  "/api/contact",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(${JSON.stringify(data, null, 2)})
  }
);

return response.json();`;
    }
  }

  private map?: L.Map;
  private markers = new Map<PinId, L.Marker>();
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.createMap();
    this.observeSections();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.map?.remove();
  }

  toggleLanguage(): void {
    this.language.update((language) => (language === 'fr' ? 'en' : 'fr'));
    document.documentElement.lang = this.language();
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

  submitContact(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.sent.set(true);
    window.location.href = this.mailtoHref();
  }

  resetContact(form: NgForm): void {
    this.sent.set(false);
    form.resetForm();
  }

  private createMap(): void {
    if (!this.mapElement) return;

    this.map = L.map(this.mapElement.nativeElement, {
      center: [48.873, 2.365],
      zoom: 11,
      minZoom: 10,
      maxZoom: 16,
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
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

    window.setTimeout(() => this.map?.invalidateSize(), 0);
  }

  private observeSections(): void {
    if (!('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        }
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll('.reveal').forEach((element) => this.observer?.observe(element));
  }
}

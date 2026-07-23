# CV — Jean Cazals

Portfolio personnel développé avec Angular. Le site présente le parcours, les compétences, les projets et les coordonnées de Jean Cazals dans une interface bilingue et responsive.

## Lancer le projet

```bash
npm install
npm start
```

L’application est ensuite disponible sur `http://localhost:4200`.

## Configurer le formulaire de contact

Le formulaire envoie chaque demande à `jeancdfpro@gmail.com` et adresse automatiquement un accusé de réception au visiteur. Les identifiants SMTP restent uniquement sur le serveur.

1. Activez la validation en deux étapes sur le compte Google utilisé pour l’envoi, puis créez un mot de passe d’application Google.
2. Copiez `.env.example` vers `.env` et remplacez `SMTP_PASS` par ce mot de passe d’application. Ne renseignez jamais le mot de passe normal du compte.
3. Lancez l’API dans un premier terminal :

```bash
npm run start:api
```

4. Lancez Angular dans un second terminal :

```bash
npm start
```

### Configuration GitHub Actions pour la production

Dans `Settings > Secrets and variables > Actions` du dépôt GitHub :

- ajoutez `SMTP_PASS` dans l’onglet **Secrets** avec le mot de passe d’application Google ;
- ajoutez les valeurs non sensibles dans l’onglet **Variables** : `SMTP_USER`, `CONTACT_TO_EMAIL`, `MAIL_FROM`, `SMTP_HOST`, `SMTP_PORT` et `SMTP_SECURE`.

Le workflow utilise des valeurs par défaut pour toutes les variables non sensibles. `SMTP_PASS` est le seul réglage obligatoire. À chaque déploiement, le workflow :

1. détecte automatiquement le service utilisant l’image du CV ;
2. génère le fichier sécurisé `~/cv-de-jean/mailing.env` sur le VPS ;
3. génère un fichier Compose complémentaire qui relie cette configuration au bon service ;
4. redémarre l’application avec les deux fichiers Compose.

Aucune connexion manuelle au VPS n’est nécessaire.

## Build de production

```bash
npm run build
```

Le résultat est généré dans `dist/jean-cazals-cv/browser`.

## Régénérer le CV PDF

Le CV téléchargeable suit une mise en page Harvard sobre et compatible avec les logiciels de
recrutement. Sa source se trouve dans `cv/jean-cazals-cv.html`.

Après une modification du contenu, régénérez `public/uploads/Profile.pdf` avec :

```bash
npm run cv:pdf
```

Le script utilise Chrome, Chromium ou Edge en mode headless. La variable `CHROME_PATH` permet
d’indiquer un autre exécutable si nécessaire.

## Fonctionnalités

- Angular standalone et détection de changements `OnPush`
- version française et anglaise
- carte interactive Leaflet
- formulaire de contact avec notification SMTP et accusé de réception automatique
- CV PDF téléchargeable
- navigation et mise en page adaptées au mobile

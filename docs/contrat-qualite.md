# Contrat qualité — version Define

**Application :** gestion de projets académiques. Références : modèle produit ISO/IEC 25010:2023 et modèle qualité à l’utilisation ISO/IEC 25019:2023. [ISO/IEC 25010](https://www.iso.org/standard/78176.html) · [Catalogue ISO/IEC JTC 1/SC 7](https://www.iso.org/committee/45086/x/catalogue/).

Ce contrat reprend toutes les mesures non vides du classeur `Interaction_Capability_Measurements.xlsx`, sans sélection : 16 mesures de capacité d’interaction et 35 mesures de sécurité. Les cellules de résultats laissées vides dans le classeur sont conservées comme champs à renseigner. Les mesures d’usage sont prévues sur staging.

## Capacité d’interaction et qualité à l’utilisation

Objectifs, méthodes, sources et résultats sont repris de la feuille `Measurements`.

| Characteristic | ID | Layer | Measurement name | Tool / method | Goal | Source | Target type | Actual result | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Appropriateness recognizability | AR-1 | Frontend | % of UI labels using cahier vocabulary (Projet, Sprint, User Story, Tâche, Réunion, Rapport, Validation) and the 4 exact status names | Playwright text assertions on each screen | 100% | Nielsen heuristic 2 | Own target |  |  |
| Learnability | LE-1 | Frontend | Time for a first-time student to create project → sprint → user story → task without help | Screen recording + stopwatch, 5 testers (same session as AC-1 and AC-2) | ≤ 10 min (median) | Nielsen, Usability Engineering | Own target |  |  |
| Operability | OP-1 | Frontend | LCP (Largest Contentful Paint) of each main screen | Lighthouse | ≤ 2.5 s | Core Web Vitals (web.dev) | Literature-based |  |  |
| Operability | OP-2 | Frontend | Number of interactions (click, drag, key) to change a task status | Playwright step count | ≤ 2 | Card, Moran & Newell (keystroke-level model) | Own target |  |  |
| User error protection | EP-1 | Frontend | Actions forbidden for a role are hidden or disabled (no create buttons for supervisors, validate only on Done tasks) | Playwright, one test per role × screen | 100% of cases | Cahier §5; Nielsen heuristic 5 | Cahier rule |  |  |
| User error protection | EP-2 | Frontend | % of required fields showing an inline error message linked to the field | Playwright + axe-core | 100% | WCAG 3.3.1; Nielsen heuristic 9 | Literature-based |  |  |
| User engagement | UE-1 | Frontend | % of write actions giving visible confirmation (message, status update) | Playwright | 100% | Shneiderman golden rules 3–4 | Literature-based |  |  |
| Inclusivity | IN-1 | Both | Text contrast ratio on UI screens and HTML reports | Lighthouse / axe DevTools | ≥ 4.5:1 (≥ 3:1 large text) | WCAG 1.4.3 | Literature-based |  |  |
| Inclusivity | IN-2 | Both | Lighthouse Accessibility score of each UI screen and HTML report | Lighthouse | ≥ 90 | WCAG 2.2 | Own target |  |  |
| Inclusivity | IN-3 | Both | Status (ToDo, InProgress, Standby, Done) shown by text or icon, not colour alone | Manual check of the 4 statuses | 4 of 4 | WCAG 1.4.1 | Literature-based |  |  |
| Inclusivity | IN-4 | Frontend | Horizontal scrolling or lost content at 320 px width | Chrome DevTools device mode | 0 failures | WCAG 1.4.10 | Literature-based |  |  |
| User assistance | UA-1 | Frontend | % of non-obvious terms with a tooltip or helper text (Standby, 'hors réunion', validation states: validé / invalidé / en attente) | Playwright check on a fixed list of terms | 100% of listed terms | Nielsen heuristic 10 | Own target |  |  |
| Self-descriptiveness | SD-1 | Frontend | Task card shows status and validation badge as text (not colour only) and last update | Playwright | 100% of fields | Nielsen heuristic 1 | Cahier rule |  |  |
| Overall acceptance | AC-1 | Both | SUS (System Usability Scale) score | 10-question SUS form (Google Forms), 5 testers | ≥ 68; target ≥ 80 | Sauro & Lewis; Nielsen & Landauer (5 users) | Literature-based |  |  |
| Overall acceptance | AC-2 | Both | Task success rate in the same test session | Observation sheet | ≥ 78% | Sauro & Lewis | Literature-based |  |  |
| Overall acceptance | AC-3 | Frontend | End-to-end UI scenarios passing | Playwright in GitHub Actions | 100% | Cahier §7 | Cahier rule |  |  |

## Sécurité — ISO/IEC 25010

Mesures, méthodes, seuils et sources de la feuille `securite-iso25010`.

| Characteristic | ID | Measurement name | Tool / method | Goal | Source |
| --- | --- | --- | --- | --- | --- |
| Confidentiality | SE-01 | Secrets présents dans tout l'historique Git | Gitleaks (--all --redact), job bloquant | 0 secret | ISO 25010 §Confidentiality ; CWE-798 ; ASVS 6.1 |
| Confidentiality | SE-02 | Secrets dans l'image Docker et le contexte de build | Gitleaks sur l'image + .dockerignore vérifié | 0 secret | CWE-538 ; ASVS 6.2 |
| Confidentiality | SE-03 | Champs password / refreshToken jamais sérialisés en JSON | Test d'intégration sur chaque endpoint (assertion sur les clés) | 100 % des réponses | CWE-200 ; ASVS 3.2 |
| Confidentiality | SE-04 | JWT et objet user absents du localStorage | Semgrep (règle locale) + test Vitest (jsdom) | 0 occurrence | CWE-522 ; ASVS 3.4 |
| Confidentiality | SE-05 | Cookie refreshToken : HttpOnly + Secure + SameSite=Strict | Test d'intégration sur Set-Cookie (supertest) | 100 % conformes | CWE-614 / CWE-1004 ; ASVS 3.3 |
| Confidentiality | SE-06 | En-têtes de sécurité HTTP (CSP, nosniff, frame-ancestors, Referrer-Policy, HSTS) | helmet + test de headers / OWASP ZAP baseline | 100 % présents, CSP sans unsafe-inline | CWE-693 ; ASVS 14.4 |
| Confidentiality | SE-07 | IDOR : accès aux ressources d'un autre utilisateur refusé | Matrice 3 rôles × ressources (projet, tâche, rapport, réunion) | 100 % → 403 / 404 | CWE-639 ; ASVS 4.1 |
| Confidentiality | SE-08 | Énumération de comptes via /api/auth/users/by-email/:email | Test d'intégration + revue de code | Réponse neutre, 0 email d'autrui exposé | CWE-204 / CWE-200 ; ASVS 2.2 |
| Confidentiality | SE-09 | Stack trace et détails internes absents des erreurs en production | Test avec NODE_ENV=production | 0 champ stack | CWE-209 ; ASVS 7.4 |
| Confidentiality | SE-10 | Fichiers uploadés servis en téléchargement, jamais inline | Test : Content-Disposition + X-Content-Type-Options | 100 % attachment + nosniff | CWE-434 / CWE-79 ; ASVS 12.2 |
| Confidentiality | SE-11 | Injection NoSQL ($ne, $gt, $where) via body et query | Semgrep + tests de payloads hostiles | 0 requête acceptée | CWE-943 ; ASVS 5.3 |
| Confidentiality | SE-12 | Taille de requête bornée (déni de service) | express.json({ limit }) + test corps 1 Mo → 413 | 100 % → 413 | CWE-400 ; ASVS 4.4 |
| Confidentiality | SE-13 | HTTPS forcé et HSTS sur l'environnement de staging | curl -I / OWASP ZAP baseline | 301 → HTTPS, max-age ≥ 31536000 | CWE-319 ; ASVS 9.1 |
| Integrity | SE-14 | Vulnérabilités HIGH/CRITICAL des dépendances npm (backend + frontend) | npm audit --audit-level=high | 0.0 | CWE-1104 ; ASVS 12.3 |
| Integrity | SE-15 | CVE HIGH/CRITICAL de l'image Docker | Trivy --severity HIGH,CRITICAL --exit-code 1 | 0.0 | CWE-1104 ; ASVS 12.3 |
| Integrity | SE-16 | Build reproductible à partir du lockfile | npm ci + vérification du package-lock.json versionné | 100 % | CWE-494 ; ASVS 12.3 |
| Integrity | SE-17 | Validation Zod sur 100 % des endpoints d'écriture | Script d'inventaire routes × validateRequest | 100 % | CWE-20 ; ASVS 5.1 |
| Integrity | SE-18 | Mot de passe haché bcrypt (cost ≥ 12), jamais en clair | Test d'intégration + lecture du document MongoDB | 0 clair, cost ≥ 12 | CWE-256 / CWE-916 ; ASVS 2.4 |
| Integrity | SE-19 | Transitions de statut valides (machine à états TaskHistory) | Test unitaire des transitions autorisées / interdites | 100 % | CWE-840 ; ASVS 5.1 |
| Integrity | SE-20 | XSS stocké dans les rapports HTML générés | Test d'injection <script> dans un titre puis génération | 0 contenu non échappé | CWE-79 ; ASVS 5.3 |
| Authenticity | SE-21 | Toutes les routes non publiques refusent l'absence de token | Inventaire de routes + appel sans header Authorization | 100 % → 401 | CWE-306 ; ASVS 4.1 |
| Authenticity | SE-22 | JWT expiré ou signature invalide rejeté | Test d'intégration (token expiré, mauvaise clé) | 100 % → 401 | CWE-347 ; ASVS 3.5 |
| Authenticity | SE-23 | Rôle non choisi par le client à l'inscription (escalade de privilèges) | Test signup avec role=ENCADRANT_UNIVERSITAIRE | 100 % refusé / ignoré | CWE-269 ; ASVS 4.2 |
| Authenticity | SE-24 | Secret JWT ≥ 32 octets, refus de démarrer sinon | Test unitaire sur config/env.ts | 100 % | CWE-521 ; ASVS 6.4 |
| Authenticity | SE-25 | Politique de mot de passe ≥ 12 caractères + complexité | Test Zod sur signupSchema | 100 % | CWE-521 ; ASVS 2.1 |
| Authenticity | SE-26 | Rotation et révocation du refresh token (logout) | Test : réutilisation d'un ancien token → 401 | 100 % → 401 | CWE-613 ; ASVS 3.3 |
| Resistance | SE-27 | Rate limiting sur /api/auth/login (force brute) | express-rate-limit + test 6 tentatives → 429, k6 | ≤ 5/min/IP, 429 dès la 6e | CWE-307 ; ASVS 2.2 |
| Resistance | SE-28 | Verrouillage progressif après échecs répétés | Test d'intégration : 10 échecs consécutifs | Blocage 15 min | CWE-307 ; ASVS 2.2 |
| Resistance | SE-29 | Analyse statique de sécurité (SAST) | Semgrep p/owasp-top-ten + p/nodejs + p/typescript | 0 ERROR / HIGH | CWE-693 ; ASVS 14.2 |
| Resistance | SE-30 | Scan dynamique de sécurité (DAST) | OWASP ZAP baseline sur staging | 0 High, 0 Medium | ASVS 14.2 |
| Resistance | SE-31 | Délais d'attente et résistance au slowloris | Configuration serveur + test de connexion lente | ≤ 30 s | CWE-400 ; ASVS 4.4 |
| Resistance | SE-32 | Entrées malformées : aucune erreur 500 non maîtrisée | Fuzz léger (fast-check) sur les schémas Zod | 0 crash / 0 réponse 500 | CWE-20 ; ASVS 5.1 |
| Accountability | SE-33 | Journal d'audit : acteur + horodatage pour chaque mutation | Test d'intégration sur TaskHistory et Validation | 100 % des mutations | ISO 25010 §Accountability ; ASVS 7.1 |
| Accountability | SE-34 | Logs sans secret ni donnée personnelle en clair | Test regex sur les logs + revue | 0 fuite | CWE-532 ; ASVS 7.1 |
| Non-repudiation | SE-35 | Validation d'encadrant traçable (acteur, date, décision) | Test d'intégration sur /api/validation | 100 % | ISO 25010 §Non-repudiation ; ASVS 7.1 |

## Règles de mesure

- Les cibles définissent les seuils visés; elles ne sont pas des résultats mesurés.
- Compléter les résultats après exécution, avec date, commit, versions d’outils et paramètres exacts. Conserver les rapports dans `docs/mesures/`.
- Pour la qualité à l’utilisation, utiliser un environnement de staging stable et noter anonymement le profil des testeurs.
- Modifier une cible uniquement avec justification et modification versionnée de ce contrat.

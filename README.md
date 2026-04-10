# Transform Salone

Static website for [Transform Salone](https://transformsalone.org), a UK-registered charity (No. 1162900) supporting communities in Sierra Leone through education, medical care and food relief.

## Structure

```
.
├── index.html            Home page
├── about.html            Our story + team
├── projects.html         Projects overview
├── solar.html            Light Up Salone campaign
├── get-involved.html     Sponsorship, fundraising, volunteering
├── donate.html           Donation options
├── contact.html          Contact details + form
├── 404.html              Not-found page (also used by GitHub Pages)
├── css/styles.css        All styling (mobile-first, no framework)
├── js/main.js            Mobile menu, scroll reveal, stat counters
├── assets/images/        Logo, hero imagery, other photos
├── build.py              Optional: rebuild pages from shared template
└── README.md
```

## Local preview

Any static server will do. From the project root:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Editing content

Each HTML page can be edited directly. If you want to share the header and footer across pages automatically, use `build.py`:

```bash
python3 build.py
```

This rewrites every page except `index.html` from the templates in `build.py`. Edit the templates in that file, run it, and all pages stay in sync.

## Deploying to GitHub Pages

1. Create a new public GitHub repository (for example `transform-salone/website`).
2. From this folder, run:

   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<your-org>/<your-repo>.git
   git push -u origin main
   ```

3. On GitHub, go to **Settings → Pages**, set the source to `Deploy from a branch`, select `main` and the `/ (root)` folder, and save.
4. After a minute or two, GitHub will publish the site. The URL appears at the top of the Pages settings screen.

### Custom domain (transformsalone.org)

1. Add a file called `CNAME` in this folder with a single line: `transformsalone.org`.
2. In your domain registrar&rsquo;s DNS settings, create either:
   - `A` records for `transformsalone.org` pointing to GitHub&rsquo;s Pages IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, **or**
   - A `CNAME` for `www.transformsalone.org` pointing to `<your-org>.github.io`.
3. Back on GitHub **Settings → Pages**, enter `transformsalone.org` as the custom domain and tick &ldquo;Enforce HTTPS&rdquo; once the certificate is ready.

## Replacing placeholder imagery

The initial site ships with one hero image pulled from the current live site. To use fresh photos, drop your own JPGs or WebP files into `assets/images/` and update the `src` / `background-image` references in the HTML. Recommended sizes:

- Hero: 1600&times;900 (or larger), optimised
- Cards / team photos: 800&times;600 or square crops

## Contact forms

`contact.html` currently uses a `mailto:` fallback. For a proper submit-to-email experience on GitHub Pages, point the form `action` to a service like [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) and update the `method`.

## Credits

Design and build: refreshed in 2026. Original content and photography &copy; Transform Salone.

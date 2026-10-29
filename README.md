# kornflex28.github.io

Personal resume site of Louis Chauvet, served at <https://touchevisual.dev>.

Built with [Jekyll](https://jekyllrb.com/) 4 and deployed to GitHub Pages by the
[`pages.yml`](.github/workflows/pages.yml) workflow on every push to `master`.

The resume is drawn as a tower in the painted style of *Le Roi et l'Oiseau*: a castle generated at
random on every visit (or again from its ID, `?castle=<ID>`), an elevator riding down the floors,
a day and night theme, and a name whose letters fly off into its anagram.

## Structure

- `_data/*.yml`: resume content (experience, publications, education, skills...)
- `_config.yml`: site settings and which resume sections are shown
- `_layouts/`: `resume.html` (home page) and `frogs.html` (`/frogs`, a p5.js generative frog toy)
- `assets/js/`: `skyline.js` (the castle), `elevator.js`, `anagram.js` (the name), `theme.js` (day and night)
- `_sass/`, `css/`: styles
- `404.html`: the page for missing addresses
- `card.html`: the link preview picture, redrawn with a new castle at each deployment into
  `images/social-card.jpg`
- `files/`: PDFs linked from the resume

## Run locally

Needs Ruby 3.x (on Windows, RubyInstaller with DevKit).

```bash
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000>. To open it from a phone on the same network, serve with
`--host 0.0.0.0` and browse to the computer's local address.

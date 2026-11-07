# kornflex28.github.io

Personal resume site of Louis Chauvet, served at <https://touchevisual.dev>.

Built with [Jekyll](https://jekyllrb.com/) 4 and deployed to GitHub Pages by the
[`pages.yml`](.github/workflows/pages.yml) workflow on every push to `master`.

The resume is drawn as a tower in the painted style of *Le Roi et l'Oiseau*: a castle generated at random on every visit (or again from its ID, `?castle=<ID>`).

![Today's castle, as the link previews show it](https://touchevisual.dev/images/social-card.jpg)

## What the workflows do

- [`pages.yml`](.github/workflows/pages.yml), on every push and **every morning**: builds the site,
  checks that its pages draw without a script error, photographs **the castle of the day** for the
  link previews (above), photographs **a gallery of castles** (<https://touchevisual.dev/castles/>),
  compares the pages with the last publication's pictures (in the run's summary), and publishes.
- [`publications.yml`](.github/workflows/publications.yml), every Monday: offers in a pull request
  the works on ORCID that the resume doesn't list yet.
- [`links.yml`](.github/workflows/links.yml), every Monday: tries every link of the site and lists
  the broken ones in an issue.

![Castles drawn at the last publication](https://touchevisual.dev/castles/castles.webp)

## Run locally

Needs Ruby 3.x (on Windows, RubyInstaller with DevKit).

```bash
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000>. To open it from a phone on the same network, serve with
`--host 0.0.0.0` and browse to the computer's local address.

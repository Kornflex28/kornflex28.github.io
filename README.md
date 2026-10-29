# kornflex28.github.io

Personal resume site of Louis Chauvet, served at <https://touchevisual.dev>.

Built with [Jekyll](https://jekyllrb.com/) 4 and deployed to GitHub Pages by the
[`pages.yml`](.github/workflows/pages.yml) workflow on every push to `master`.

## Structure

- `_data/*.yml`: resume content (experience, education, projects, skills...)
- `_config.yml`: site settings and which resume sections are shown
- `_layouts/`: `resume.html` (home page) and `frogs.html` (`/frogs`, a p5.js generative frog toy)
- `_sass/`, `css/`: styles
- `files/`: PDFs linked from the resume

## Run locally

Needs Ruby 3.x (on Windows, RubyInstaller with DevKit).

```bash
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000>.

# Songbook

Chords and lyrics website for my church.

## Features

Fully functional full-stack application. Pages:

### Home — with song list and search

  <img width="1440" alt="Screenshot 2022-09-03 at 15 56 18" src="https://user-images.githubusercontent.com/75225148/188272422-a4b0de7b-41ed-44ac-b046-8c925c7256c6.png">
  <img width="1440" alt="Screenshot 2022-09-03 at 15 56 10" src="https://user-images.githubusercontent.com/75225148/188272418-abb60bfa-4e46-4b10-ac32-51a3a39ed6eb.png">

### Song view with Apple Music and YouTube links, lyrics, chords, automatic transposition

  <img width="1440" alt="Screenshot 2022-09-03 at 15 54 59" src="https://user-images.githubusercontent.com/75225148/188272436-73fcb32a-9531-4d60-857d-e03d7e30294f.png">
  <img width="1440" alt="Screenshot 2022-09-03 at 15 55 05" src="https://user-images.githubusercontent.com/75225148/188272457-5a931204-f7f4-4261-be7d-a99ec484aa7f.png">
  <img width="1440" alt="Screenshot 2022-09-03 at 15 55 14" src="https://user-images.githubusercontent.com/75225148/188272440-fb104278-9790-4373-a9be-2790e20669fa.png">

### Login page

  <img width="1440" alt="Screenshot 2022-09-03 at 15 56 43" src="https://user-images.githubusercontent.com/75225148/188272444-20cf403c-fa74-43ed-a7e3-666fc721e268.png">

### 🔒 Song add/edit view

  <img width="1440" alt="Screenshot 2022-09-03 at 15 55 21" src="https://user-images.githubusercontent.com/75225148/188272497-f61b378a-6670-40a4-8bb5-435cb4263dc5.png">

### 🔒🔒 Users view — list of users and add/edit/delete

  <img width="1440" alt="Screenshot 2022-09-03 at 15 55 37" src="https://user-images.githubusercontent.com/75225148/188272502-aade311a-66f6-4ef1-aa49-0255d5e923b2.png">

## Stack

- Python backend with [FastAPI](https://fastapi.tiangolo.com/),
- Frontend with [Vue](https://vuejs.org/), [Vite](https://vitejs.dev/) and [TailwindCSS](https://tailwindcss.com/),
- [Deta Base](https://www.deta.sh/),
- [Vercel](https://vercel.com/).

Thoroughly tested with [Pytest](https://pytest.org/) and [Vitest](https://vitest.dev/).

## Getting started

### Development — locally

### Running

Install Python 3.9 and [Hatch](https://hatch.pypa.io), and Node, then:

```sh
npm install  # Install Node dependencies
```

After that you should create `.env` and fill it according to [`backend.app.factory.Settings` class](https://github.com/vrslev/songbook/blob/45917e2826e491c0d6ab971f09d7e9c1874f2884/backend/app/factory.py#L38). Also there's `VITE_SENTRY_DSN` for [Sentry](https://sentry.io/) in the browser.

Run `make backend` to start backend server (with prefilled testing data, otherwise: `make backend-clean`), open another terminal tab and run `make frontend` to start frontend server. Open `localhost:3000` and login with username and password `super`. Done.

### Testing

```sh
hatch run pytest  # Run Python tests
npm test  # Run Node tests
```

### Production — Vercel & Deta

- Create Deta project.
- Install Vercel CLI and run `vercel`. Then fill environment variables in project settings.
- Create superuser: `SUPERSER__USERNAME=... SUPERUSER__PASSWORD=... python -m backend.add_superuser`.

Done!

# Preproute Test Management Application

A React + TypeScript test management application built for the Preproute frontend developer task. The app follows the provided Figma flow and integrates the documented backend APIs for login, test creation, question creation, preview, and publishing.

## Live Flow

1. Login with the provided credentials.
2. Create a draft test with dynamic subjects, topics, and sub-topics.
3. Add MCQ questions to the selected test.
4. Preview test details and questions.
5. Publish or schedule the test.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Fetch API
- Lucide React icons

## API Base URL

The production API base URL is:

```txt
https://admin-moderator-backend-staging.up.railway.app/api
```

By default, the frontend calls `/api`. For local development, Vite proxies `/api` to the backend to avoid browser CORS issues:

```txt
/api -> https://admin-moderator-backend-staging.up.railway.app
```

You can override the API URL with:

```txt
VITE_API_BASE_URL=https://admin-moderator-backend-staging.up.railway.app/api
```

For deployment, `vercel.json` and `public/_redirects` are included so Vercel or Netlify can proxy `/api/*` to the Railway backend.

## Implemented APIs

- `POST /auth/login`
- `GET /tests/:id`
- `POST /tests`
- `PUT /tests/:id`
- `DELETE /tests/:id`
- `GET /subjects`
- `GET /topics/subject/:subjectId`
- `POST /sub-topics/multi-topics`
- `POST /questions/bulk`
- `POST /questions/fetchBulk`

## Technical Decisions

- Centralized all API calls in `src/services/api.ts`.
- Stored JWT and user data in local storage through `src/services/storage.ts`.
- Attached `Authorization: Bearer <token>` automatically for authenticated API requests.
- Added a centralized toast utility for user-friendly success and error feedback.
- Added reusable loader states for slow API calls.
- Kept the existing Figma-based UI structure and styling intact while replacing static/mock data with backend-driven state.
- Used documented APIs only. Undocumented delete/edit-question APIs are not called.

## Known Backend Gaps

- No documented API for updating an existing question.
- No documented API for deleting question records. The current UI can detach a question from a test by updating the test question list.
- Test type, difficulty, publish duration, and publish time options are UI-defined because no backend option APIs were provided.

## Run Locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run lint
npm run build
```

Both commands pass in the current implementation.

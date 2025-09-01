## Rules
- ALWAYS run `bun tsc --noEmit` after editing ANY TypeScript file in the relevant directory
- Javascript is deprecated. All new files should be in TypeScript, with a strong preference for Effect-ts
### Frontend
- If react logic is being duplicated, write a custom hook in app/client/src/hooks
- React components should be short and easy to read. low level logic should not be mixed with high level logic
- Minimise prop drilling
- New StyledComponents should be placed in app/client/src/components, props should be defined inline if 3 or less
- Never copy paste components - abstract where possible
- Prioritise effect-atom for state, zustand is legacy.
- Use effect-ts for complex logic. Ideal data flow is EffectServer -> effectAtomHttpClient -> Derived Atom using Custom Effect Logic -> React
- When using the effect-atom-http client make sure to handle all error and loading states
- Expected errors should display the server error.message which will be user friendly. Unexpected errors should display a generic error message
- If there is a loading state we should create a skeleton component

### Backend
- Unexpected errors aka defects when there is a bug in our code. We should Effect.die on these
- Expected errors happen when users try do something we do not support. These are expected and should be mapped to a user facing API error that can be displayed in the frontend
- When creating new endpoints add tests that cover both happy and sad paths

## Development Commands

### App (Frontend and Backend)
```bash
cd app
bun run dev                # Start frontend pointing to production backend
bun run dev:both           # Start frontend and local dev backend. Frontend is pointing to local backend for /social endpoints. Production for all else
```

### Client (Frontend)
```bash
cd app/client
bun run dev                 # Start development server with hot reload
bun run dev:local-social    # Start with local social API
bun run build               # Build for production
```

### Server (Backend)
```bash
cd app/server
bun server.ts              # Run backend server locally. Only exposes effect/social & bun/social endpoints. Requires vermilion db to be created
bun test                   # Run tests. Requires vermilion_test db to be created 
bun test:watch             # Run tests in watch mode
```

### Database (Postgresql)
Requires manual setup. see Init postgres server in `.github/workflows/1. Deploy Config.yml' for an example.

### Type Checking
The project uses TypeScript with strict settings. Run type checking with:
```bash
bun tsc --noEmit          # Check types without emitting files
```

## Architecture Overview

### Monorepo Structure
- `app/client/` - React frontend built with Bun
- `app/server/` - Backend server with Effect-TS
- `app/shared/` - Shared types and utilities between client/server

### Key Technologies
- **Frontend**: React 19, Styled Components, React Router, Effect-TS atoms
- **Backend**: Effect-TS, PostgreSQL
- **Build Tool**: Bun for both frontend and backend

### Effect-atom
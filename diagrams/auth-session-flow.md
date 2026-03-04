# Auth Session Flow

```mermaid
flowchart TD
    subgraph LoginFlow [Phase 1 - Login and cookie creation]
      A[User submits login form<br/>File: src/components/auth/LoginForm.tsx] --> B[Frontend calls POST api auth login<br/>File: src/lib/api/auth.api.ts]
      B --> C[Next login route calls Nest auth login]
      C --> D[Nest validates credentials and returns access token]
      D --> E[Next stores token in HttpOnly cookie<br/>File: src/app/api/auth/login/route.ts]
      E --> F[Browser keeps cookie for next requests]
    end

    subgraph FastGate [Phase 2 - Fast gate at route level]
      G[User opens boards or admin page] --> H[proxy.ts runs for matched routes]
      H --> I{Cookie token exists?}
      I -- No --> J[Redirect to login page]
      I -- Yes --> K[Request can continue]
    end

    subgraph SessionCheck [Phase 3 - Real session verification]
      L[ProtectedLayout mounts<br/>File: src/components/auth/ProtectedLayout.tsx] --> M[useMeQuery requests users me<br/>File: src/hooks/auth/use-me-query.ts]
      M --> N[Next API proxy route reads cookie<br/>File: src/app/api/nest/catch-all route.ts]
      N --> O[Proxy adds Authorization Bearer token]
      O --> P[Nest users me validates JWT and returns user]
      P --> Q{Response status is 200?}
      Q -- No 401 --> R[Redirect to login page]
      Q -- Yes --> S[User and permissions available in frontend]
    end

    subgraph PermissionGate [Phase 4 - Permission based access]
      S --> T{Has requiredPermission?<br/>Files: src/lib/auth/permissions.ts + src/components/auth/ProtectedLayout.tsx}
      T -- No --> U[Redirect to forbidden page<br/>File: src/app/forbidden/page.tsx]
      T -- Yes --> V[Render protected page content<br/>Files: src/app/boards/layout.tsx or src/app/admin/layout.tsx]
    end

    F --> G
    K --> L
```

## Notes

- `proxy.ts` quick filter file: `src/proxy.ts`.
- `ProtectedLayout` real auth and permission gate file: `src/components/auth/ProtectedLayout.tsx`.
- If JWT is invalid or expired, Nest returns 401 and frontend redirects to login.
- Even with frontend guards, backend remains the final source of truth for authorization.

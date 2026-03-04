# Request Routing Split

```mermaid
flowchart TD
    A[Frontend action] --> B{Which request type?}

    subgraph ManualAuth [Manual auth routes]
      C[Login submit<br/>File: src/components/auth/LoginForm.tsx]
      D[Logout click<br/>File: src/components/auth/ProtectedLayout.tsx]
      E[POST api auth login<br/>File: src/lib/api/auth.api.ts]
      F[POST api auth logout<br/>File: src/lib/api/auth.api.ts]
      G[Next login route<br/>File: src/app/api/auth/login/route.ts]
      H[Next logout route<br/>File: src/app/api/auth/logout/route.ts]
      I[Call Nest auth login]
      J[Set HttpOnly cookie token]
      K[Clear HttpOnly cookie token]
    end

    subgraph NestProxy [Generic Nest proxy route]
      L[Orval or custom fetch call<br/>Files: generated clients + src/lib/api/custom-fetch.ts]
      M[Request goes to api nest path<br/>Example api nest users me]
      N[Catch all Next route<br/>File: src/app/api/nest/catch-all route.ts]
      O[Read token from cookie and add Authorization]
      P[Forward request to Nest endpoint]
      Q[Return Nest response to frontend]
    end

    B -- Login --> C --> E --> G --> I --> J
    B -- Logout --> D --> F --> H --> K
    B -- Any other API call --> L --> M --> N --> O --> P --> Q
```

## Notes

- Login and logout are handled manually with dedicated Next routes.
- All other backend calls are funneled through the generic `api/nest` catch-all route.
- The catch-all route centralizes token injection into the `Authorization` header.


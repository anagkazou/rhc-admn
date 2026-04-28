# Sessions management

How the active-sessions view and termination feature was built.

## 1. Inspect the auth schema

Used the Supabase MCP to query `information_schema.columns` for `auth.sessions` and confirm the columns: `id`, `user_id`, `created_at`, `refreshed_at`, `not_after`, `user_agent`, `ip`, etc.

Checked `pg_constraint` for foreign keys and confirmed:

```
auth.refresh_tokens.session_id → auth.sessions.id  ON DELETE CASCADE
```

Deleting a session row therefore also revokes its refresh token, with no extra cleanup needed.

## 2. Pick an access strategy

The `auth` schema is **not** exposed via PostgREST, so the supabase-js client can't query `auth.sessions` directly — even with the service-role key.

Decision: write SECURITY DEFINER functions in `public` that touch `auth.*` internally, and call them from the app via `supabase.rpc(...)`.

## 3. Migration: `admin_session_management`

Two SQL functions, both gated on `admin_users` membership.

```sql
create or replace function public.list_admin_sessions()
returns table (
  id uuid,
  user_id uuid,
  email text,
  created_at timestamptz,
  refreshed_at timestamp,
  not_after timestamptz,
  user_agent text,
  ip text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.admin_users a where a.id = auth.uid()
  ) then
    raise exception 'forbidden';
  end if;

  return query
    select s.id, s.user_id, u.email::text,
           s.created_at, s.refreshed_at, s.not_after,
           s.user_agent, s.ip::text
    from auth.sessions s
    join auth.users u on u.id = s.user_id
    join public.admin_users a on a.id = s.user_id
    where (s.not_after is null or s.not_after > now())
    order by coalesce(s.refreshed_at::timestamptz, s.created_at) desc;
end;
$$;

create or replace function public.terminate_session(target_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.admin_users a where a.id = auth.uid()
  ) then
    raise exception 'forbidden';
  end if;

  if not exists (
    select 1 from auth.sessions s
    join public.admin_users a on a.id = s.user_id
    where s.id = target_session_id
  ) then
    raise exception 'session not found';
  end if;

  delete from auth.sessions where id = target_session_id;
end;
$$;

revoke all on function public.list_admin_sessions() from public, anon;
revoke all on function public.terminate_session(uuid) from public, anon;
grant execute on function public.list_admin_sessions() to authenticated;
grant execute on function public.terminate_session(uuid) to authenticated;
```

Notes:

- `set search_path = ''` forces every reference to be schema-qualified, defending against search-path attacks against SECURITY DEFINER functions.
- `auth.uid()` returns `null` for anon, so even without the explicit `revoke`, anon callers couldn't pass the admin check — but explicit grants make intent obvious.
- The cascade on `auth.refresh_tokens` means a single `delete from auth.sessions` is enough.

## 4. Regenerate types

Ran `mcp__supabase__generate_typescript_types` and merged the new `Functions` block into `lib/supabase/database.types.ts`. Added an `AdminSession` row alias:

```ts
export type AdminSession =
  Database['public']['Functions']['list_admin_sessions']['Returns'][number]
```

## 5. Server action — `app/dashboard/sessions/actions.ts`

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

export async function terminateSession(formData: FormData) {
  await requireAdmin()
  const sessionId = String(formData.get('sessionId') ?? '')
  if (!sessionId) throw new Error('Missing session id')

  const supabase = await createClient()
  const { error } = await supabase.rpc('terminate_session', {
    target_session_id: sessionId,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/sessions')
}
```

`requireAdmin()` is defense-in-depth on top of the SQL check.

## 6. Page — `app/dashboard/sessions/page.tsx`

Server component:

1. `requireAdmin()` (gates access at the page layer too)
2. `supabase.rpc('list_admin_sessions')`
3. shadcn `<Table>` with columns: **Admin** · **Device** · **IP** · **Last active** · **Terminate**

Each Terminate button is its own `<form action={terminateSession}>` with a hidden `sessionId` input — progressive enhancement, works without client-side JS.

Helpers in the page:

- `formatTimestamp(value)` — handles the `timestamp without time zone` returned for `refreshed_at` (appends `Z` if no TZ info present).
- `summarizeUserAgent(ua)` — small regex to render a `Browser · OS` summary; full UA is available via the `title` tooltip.

Responsive column visibility: Device hidden below `md`, IP hidden below `sm`.

## 7. Loading state — `app/dashboard/sessions/loading.tsx`

Same centered `Loader2Icon` spinner as `/dashboard/player` and `/dashboard/partners` for consistent navigation feel.

## 8. Sidebar navigation

Refactored `app/dashboard/sidebar-nav.tsx` to support multiple groups via a small `NavGroup` helper, then added a **Security** group containing the **Sessions** link (`KeyRoundIcon`). Active state still uses `data-active:text-gold` to highlight the current route.

## 9. Verify build

`next build` shows the new route:

```
├ ƒ /dashboard/sessions
```

No type errors, RPC calls are typed end-to-end.

## Caveat: stateless JWTs

Supabase access tokens are stateless JWTs. Deleting an `auth.sessions` row immediately revokes the **refresh** token, but the user's current **access** token stays valid until it expires (default ~1 hour). The next failed refresh after expiry bounces them to `/login`.

For instant kick-out, the options are:

- Shorten JWT TTL in the Supabase project settings.
- Add a per-request session-state check in `proxy.ts` (extra DB hit per request).

Neither is implemented here — basic termination via session delete was deemed sufficient for an admin tool.

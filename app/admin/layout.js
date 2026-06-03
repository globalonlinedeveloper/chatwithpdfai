import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUser, SESSION_COOKIE } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';

// Owner-only section. Gate server-side so non-owners never see the shell
// (the data API is already 403-protected; this avoids the empty-shell flash
// and the console 403 a logged-in non-owner used to get).
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const token = cookies().get(SESSION_COOKIE)?.value || null;
  const u = await getSessionUser(token);
  if (!u) redirect('/signin?next=/admin');
  if (!isAdmin(u.email)) redirect('/dashboard');
  return children;
}

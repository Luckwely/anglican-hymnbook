import { Link } from 'react-router-dom';
import { routes } from '../lib/routes';
import { btnPrimary } from '../lib/ui';

export function NotFoundPage({ message = 'Page not found.' }: { message?: string }) {
  return (
    <main className="app-main max-w-3xl min-h-dvh bg-neu-base py-10 text-center text-slate-800">
      <p className="mb-4">{message}</p>
      <Link to={routes.home} className={`${btnPrimary} !rounded-xl !border-0 !bg-neu-base !text-indigo-700 !shadow-neu-btn active:!shadow-neu-pressed transition-all duration-150`}>Back to list</Link>
    </main>
  );
}

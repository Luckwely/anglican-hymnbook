import { useEffect, useRef, useState } from 'react';
import { Mail, MessageCircle, MoreVertical, Phone, X } from 'lucide-react';
import { author } from '../lib/author';

export function AboutMenu() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const linkCls =
    'flex items-center gap-3 rounded-xl bg-neu-base px-3 py-2.5 text-sm text-slate-800 shadow-neu-btn transition-all duration-150 active:shadow-neu-pressed';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="À propos"
        aria-haspopup="dialog"
        className="flex h-10 w-5 shrink-0 items-center justify-center rounded-xl bg-neu-base text-slate-700 shadow-neu-btn transition-all duration-150 active:shadow-neu-pressed"
      >
        <MoreVertical size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neu-base p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="À propos"
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl bg-neu-base p-5 text-slate-800 shadow-neu-flat"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="absolute right-3 top-3 rounded-xl bg-neu-base p-1.5 text-slate-600 shadow-neu-btn active:shadow-neu-pressed"
            >
              <X size={16} />
            </button>

            <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-indigo-700">À propos</h2>

            <div className="mt-4 flex flex-col items-center text-center">
              <img
                src={author.photo}
                alt={author.name}
                className="h-24 w-24 rounded-full object-cover shadow-neu-btn"
              />
              <p className="mt-3 text-lg font-bold">{author.name}</p>
              <p className="text-sm text-slate-600">{author.role}</p>
            </div>

            <p className="mt-4 text-center text-sm text-slate-600">
              Un problème ou une erreur dans l’application ? Contactez-moi :
            </p>

            <div className="mt-3 flex flex-col gap-3">
              {author.email && (
                <a href={`mailto:${author.email}`} className={linkCls}>
                  <Mail size={18} className="text-indigo-700" /> <span className="min-w-0 break-all">{author.email}</span>
                </a>
              )}
              {author.phone && (
                <a href={`tel:${author.phone.replace(/\s/g, '')}`} className={linkCls}>
                  <Phone size={18} className="text-indigo-700" /> {author.phone}
                </a>
              )}
              {author.whatsapp && (
                <a href={`https://wa.me/${author.whatsapp}`} target="_blank" rel="noreferrer" className={linkCls}>
                  <MessageCircle size={18} className="text-indigo-700" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// app/notes/page.tsx
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { fetchNotes } from '@/lib/api';
import NotesClient from './Notes.client';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const asStr = (v: string | string[] | undefined, d = '') =>
  Array.isArray(v) ? v[0] ?? d : v ?? d;

const asNum = (v: string | string[] | undefined, d: number) => {
  const raw = Array.isArray(v) ? v[0] : v;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : d;
};

export default async function NotesPage({ searchParams }: Props) {
  const sp = await searchParams; 
  const search = asStr(sp.search, '');
  const page = asNum(sp.page, 1);
  const perPage = 12;

  const qc = new QueryClient();
  const queryKey = ['notes', { search, page, perPage }] as const;

  await qc.prefetchQuery({
    queryKey,
    queryFn: () => fetchNotes({ page, perPage, search }),
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NotesClient initialSearch={search} initialPage={page} perPage={perPage} />
    </HydrationBoundary>
  );
}

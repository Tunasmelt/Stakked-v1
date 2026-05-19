'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Heart, Share2, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { saveProject } from '@/lib/db';
import { STARTER_TEMPLATES } from '@/data/templates/starters';
import { StakkedProject } from '@/types/project';
import { supabase, isSupabaseConfigured, getCurrentUserId } from '@/lib/supabase';
import { useUIStore } from '@/stores/ui-store';
import { v4 as uuidv4 } from 'uuid';
import styles from '@/styles/Community.module.css';

/**
 * Pure generator for remix projects to satisfy strict render-body checks.
 */
function generateRemixProject(
  template: Template,
  starter: Partial<StakkedProject>,
  userId: string,
): StakkedProject {
  const now = new Date().toISOString();
  const timestamp = Date.now();
  const newId = uuidv4();

  return {
    ...starter,
    id: newId,
    userId,
    title: `${starter.title} (Remix)`,
    slug: `${template.slug}-remix-${timestamp}`,
    createdAt: now,
    updatedAt: now,
    published: false,
    visibility: 'private',
    forkedFrom: template.id,
    forkCount: 0,
    tags: starter.tags || [],
    pages: starter.pages?.map(p => ({ ...p, id: uuidv4() })) || [],
    settings: starter.settings || { theme: 'ghost' }
  } as StakkedProject;
}

/**
 * Community — public template gallery.
 * Shows static starter templates merged with live published projects from
 * Supabase when configured. Falls back gracefully to static data only.
 */

type Vis = 'visA' | 'visB' | 'visC' | 'visD';
const VIS_CLASSES: Record<Vis, string> = {
  visA: styles.visA,
  visB: styles.visB,
  visC: styles.visC,
  visD: styles.visD,
};

const VIS_CYCLE: Vis[] = ['visA', 'visB', 'visC', 'visD'];

interface Template {
  id: string;
  title: string;
  author: string;
  category: 'music' | 'portfolio' | 'merch' | 'editorial' | 'other';
  forks: number;
  vis: Vis;
  slug?: string;
  isLive?: boolean;
  liveUrl?: string;
  comingSoon?: boolean;
}

const STATIC_TEMPLATES: Template[] = [
  { id: '1',  title: 'Neon Arcade',    author: '@ari',  category: 'music',     forks: 124, vis: 'visA', slug: 'neon-arcade' },
  { id: '2',  title: 'Static Bloom',   author: '@kai',  category: 'portfolio', forks: 87,  vis: 'visB', slug: 'static-bloom' },
  { id: '3',  title: 'Outline Field',  author: '@nova', category: 'editorial', forks: 211, vis: 'visC', comingSoon: true },
  { id: '4',  title: 'Red Room',       author: '@vox',  category: 'merch',     forks: 44,  vis: 'visD', comingSoon: true },
  { id: '5',  title: 'Synthwave EP',   author: '@echo', category: 'music',     forks: 93,  vis: 'visA', comingSoon: true },
  { id: '6',  title: 'Lo-fi Daily',    author: '@mira', category: 'editorial', forks: 62,  vis: 'visB', comingSoon: true },
  { id: '7',  title: 'Studio Minimal', author: '@pax',  category: 'portfolio', forks: 301, vis: 'visC', comingSoon: true },
  { id: '8',  title: 'Tour Merch',     author: '@jude', category: 'merch',     forks: 19,  vis: 'visD', comingSoon: true },
];

const CATEGORIES = ['all', 'music', 'portfolio', 'merch', 'editorial', 'other'] as const;

interface PublishedRow {
  id: string;
  slug: string;
  title: string;
  user_id: string;
  fork_count: number | null;
  tags: string[] | null;
  created_at: string;
}

export default function CommunityPage() {
  const router = useRouter();
  const { showConfirm } = useUIStore();
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>('all');
  const [query, setQuery] = useState('');
  const [isCloning, setIsCloning] = useState<string | null>(null);
  const [liveProjects, setLiveProjects] = useState<Template[]>([]);
  const [liveLoading, setLiveLoading] = useState(isSupabaseConfigured);
  const [livePage, setLivePage] = useState(0);
  const [liveHasMore, setLiveHasMore] = useState(false);
  const PAGE_SIZE = 24;

  // Fetch live published projects from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLiveLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchPublished() {
      try {
        const { data, error } = await supabase!
          .from('published_projects')
          .select('id, slug, title, user_id, fork_count, tags, created_at')
          .order('created_at', { ascending: false })
          .range(livePage * PAGE_SIZE, livePage * PAGE_SIZE + PAGE_SIZE - 1);

        if (cancelled) return;
        if (error) {
          console.warn('[community] Supabase fetch failed:', error.message);
          setLiveLoading(false);
          return;
        }

        const rows = (data ?? []) as PublishedRow[];
        const converted: Template[] = rows.map((row, idx) => ({
          id: `live-${row.id}`,
          title: row.title,
          author: `@${(row.user_id ?? 'anon').slice(0, 8)}`,
          category: (row.tags?.[0] as Template['category']) ?? 'other',
          forks: row.fork_count ?? 0,
          vis: VIS_CYCLE[idx % 4],
          slug: row.slug,
          isLive: true,
          liveUrl: `/v/${row.slug}`,
        }));

        setLiveHasMore(rows.length === PAGE_SIZE);
        setLiveProjects(prev => livePage === 0 ? converted : [...prev, ...converted]);
      } catch (err) {
        if (!cancelled) console.warn('[community] fetch error:', err);
      } finally {
        if (!cancelled) setLiveLoading(false);
      }
    }

    fetchPublished();
    return () => { cancelled = true; };
  }, [livePage, PAGE_SIZE]);

  const handleRemix = async (e: React.MouseEvent, template: Template) => {
    e.stopPropagation();
    if (!template.slug) return;

    setIsCloning(template.id);
    const starter = STARTER_TEMPLATES[template.slug as keyof typeof STARTER_TEMPLATES];

    if (!starter) {
      showConfirm(
        'Template not available',
        "This template's content isn't bundled locally. Open the live project and use the Remix button there.",
        () => {},
        'OK',
        '',
      );
      setIsCloning(null);
      return;
    }

    const userId = await getCurrentUserId();
    const newProject = generateRemixProject(template, starter, userId);
    await saveProject(newProject);
    router.push(`/editor/${newProject.id}`);
  };

  // Merge live + static; live projects appear first
  const allTemplates = useMemo(() => [...liveProjects, ...STATIC_TEMPLATES], [liveProjects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTemplates.filter((t) => {
      if (active !== 'all' && t.category !== active) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) || t.author.toLowerCase().includes(q)
      );
    });
  }, [allTemplates, active, query]);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.topLeft}>
          <span className={styles.dot} aria-hidden="true" />
          <Link href="/" className={styles.brand}>
            Stakked
          </Link>
          <span className={styles.sep}>/</span>
          <span className={styles.crumb}>Community</span>
        </div>
        <div className={styles.topRight}>
          <Link href="/workspace" className={styles.pill}>
            Workspace
          </Link>
        </div>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>Community Gallery</h1>
        <p className={styles.sub}>
          Remix a starter template or fork a public project. Designs are
          forkable — click Remix to spin up your own copy.
          {isSupabaseConfigured && !liveLoading && liveProjects.length > 0 && (
            <span className={styles.liveChip}>
              <Globe size={10} /> {liveProjects.length} live
            </span>
          )}
        </p>
      </header>

      <div className={styles.filters}>
        <div className={styles.search}>
          <Search size={14} />
          <input
            type="search"
            placeholder="Search templates or creators"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search community"
          />
        </div>
        <div className={styles.chips} role="tablist">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active === cat}
              className={`${styles.chip} ${active === cat ? styles.chipActive : ''}`}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {liveLoading ? (
        <div className={styles.loadingRow}>
          <span className={styles.loadingDot} />
          <span>{'// fetching live projects…'}</span>
        </div>
      ) : null}

      <div className={styles.grid}>
        {filtered.map((t) => (
          <article
            key={t.id}
            className={`${styles.card} ${t.isLive ? styles.cardLive : ''} ${t.comingSoon ? styles.cardComingSoon : ''}`}
          >
            <div className={`${styles.thumb} ${VIS_CLASSES[t.vis]}`} aria-hidden="true">
              {t.isLive && (
                <span className={styles.liveTag}>
                  <Globe size={9} /> live
                </span>
              )}
              {t.comingSoon && (
                <span className={styles.comingSoonBadge}>Coming soon</span>
              )}
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardTop}>
                <h3 className={styles.cardTitle}>{t.title}</h3>
                <span className={styles.cardAuthor}>{t.author}</span>
              </div>
              <div className={styles.cardMeta}>
                <span className={styles.cardCat}>{t.category}</span>
                <span className={styles.cardForks}>
                  <Heart size={12} /> {t.forks}
                </span>
              </div>
              <div className={styles.cardActions}>
                {t.isLive ? (
                  <>
                    <a
                      href={t.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.remixBtn}
                    >
                      View
                    </a>
                    <button
                      type="button"
                      className={styles.remixBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Fork: open the live project slug in the editor via remix
                        router.push(`/v/${t.slug}?fork=1`);
                      }}
                    >
                      Fork
                    </button>
                  </>
                ) : t.comingSoon ? (
                  <span className={styles.comingSoonBtn} aria-disabled="true">
                    Coming soon
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.remixBtn}
                    onClick={(e) => handleRemix(e, t)}
                    disabled={isCloning === t.id || !t.slug}
                  >
                    {isCloning === t.id ? 'Cloning…' : 'Remix'}
                  </button>
                )}
                {!t.comingSoon && (
                  <button
                    type="button"
                    className={styles.shareBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/v/${t.slug ?? t.id}`,
                        );
                      }
                    }}
                    aria-label="Copy share link"
                  >
                    <Share2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {liveHasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
          <button
            type="button"
            className={styles.remixBtn}
            onClick={() => { setLivePage(p => p + 1); setLiveLoading(true); }}
            disabled={liveLoading}
          >
            {liveLoading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}

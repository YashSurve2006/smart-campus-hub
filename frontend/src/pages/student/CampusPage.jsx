/**
 * CampusPage — Enterprise upgrade.
 * Previous: light theme (text-slate-900, border-slate-200, bg-white/80-90 inputs),
 *           bg-gradient-to-br from-slate-100 via-white, light POI map canvas,
 *           from-hub-blue to-hub-purple pin colors.
 * Now: dark abstract map canvas with grid/glow pins, dark search input,
 *      dark category pills, dark POI list cards, PageHeader.
 */
import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, X, Building2, Dumbbell, Home, Zap, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { Orb, GridTexture, fadeUp } from '../../utils/animations';

const CATEGORIES = [
  { id: '',         label: 'All',       icon: Layers },
  { id: 'building', label: 'Buildings', icon: Building2 },
  { id: 'facility', label: 'Facilities', icon: Zap },
  { id: 'sports',   label: 'Sports',    icon: Dumbbell },
  { id: 'hostel',   label: 'Hostels',   icon: Home },
];

/* ── Category pin color map ── */
const CAT_PIN = {
  building: 'from-indigo-500 to-violet-500 shadow-indigo-500/40',
  facility: 'from-cyan-500 to-blue-500 shadow-cyan-500/40',
  sports:   'from-emerald-500 to-teal-500 shadow-emerald-500/40',
  hostel:   'from-amber-500 to-orange-500 shadow-amber-500/40',
  landmark: 'from-rose-500 to-pink-500 shadow-rose-500/40',
  default:  'from-slate-500 to-slate-600 shadow-slate-500/30',
};

function pinColor(cat) {
  return CAT_PIN[cat] || CAT_PIN.default;
}

/* ── Category chip ── */
function CatChip({ cat, active, onClick }) {
  const Icon = cat.icon;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={[
        'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        active
          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
          : 'border border-slate-700/60 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-slate-200',
      ].join(' ')}
    >
      <Icon className="h-3.5 w-3.5" />
      {cat.label}
    </motion.button>
  );
}

/* ── POI detail card ── */
function PlaceCard({ place, index, onClick, selected }) {
  const color = pinColor(place.category);
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onClick(place)}
      className={[
        'group w-full rounded-2xl border p-4 text-left transition-all duration-200',
        selected
          ? 'border-indigo-500/30 bg-indigo-500/[0.06] shadow-glow-indigo'
          : 'border-slate-800/60 bg-slate-900/50 hover:border-indigo-500/20 hover:bg-indigo-500/[0.03]',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          <MapPin className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-200 group-hover:text-white transition">
            {place.name}
          </p>
          <p className={`text-[11px] font-semibold capitalize text-slate-500 mt-0.5`}>
            {place.category}
          </p>
        </div>
      </div>
      {(place.description || place.building) && (
        <div className="mt-2.5">
          {place.description && (
            <p className="text-xs text-slate-500 line-clamp-2">{place.description}</p>
          )}
          {place.building && (
            <p className="mt-1 text-[10px] text-slate-600">
              {place.building}{place.floor ? ` · Floor ${place.floor}` : ''}
            </p>
          )}
        </div>
      )}
    </motion.button>
  );
}

export default function CampusPage() {
  const [places,    setPlaces]    = useState([]);
  const [search,    setSearch]    = useState('');
  const [cat,       setCat]       = useState('');
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/campus/places', {
        params: { search: search || undefined, category: cat || undefined },
      });
      setPlaces(data.places || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load campus places');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [search, cat]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load]);

  const bounds = useMemo(() => {
    const xs = places.map((p) => Number(p.map_x || 0));
    const ys = places.map((p) => Number(p.map_y || 0));
    return { maxX: Math.max(80, ...xs, 1), maxY: Math.max(80, ...ys, 1) };
  }, [places]);

  return (
    <div className="relative space-y-8">
      <Orb className="h-96 w-96 -left-32 -top-20 bg-teal-600/8" />
      <Orb className="h-64 w-64 right-0 top-24 bg-indigo-600/8" />
      <GridTexture />

      {/* Header */}
      <PageHeader
        breadcrumb="Student · Campus"
        title="Campus Navigation"
        subtitle="Explore points of interest on the abstract campus canvas."
      />

      {/* Search + Filters */}
      <motion.div {...fadeUp(0.06)} className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search library, hostel, lab…"
            className="ent-input pl-10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <CatChip
              key={c.id || 'all'}
              cat={c}
              active={cat === c.id}
              onClick={() => { setCat(c.id); setSelected(null); }}
            />
          ))}
        </div>
      </motion.div>

      {/* Map + List */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Abstract map canvas — dark theme */}
        <motion.div {...fadeUp(0.1)}>
          <GlassCard noPadding noAnimation>
            <div className="border-b border-slate-800/60 px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                Abstract Campus Map
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-b-2xl bg-[#080e1a]">
              {/* Inner grid texture */}
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />
              {/* POI pins */}
              <AnimatePresence>
                {places.map((p, i) => {
                  const isSelected = selected?.id === p.id;
                  return (
                    <motion.button
                      key={p.id}
                      type="button"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 20 }}
                      whileHover={{ scale: 1.3, zIndex: 10 }}
                      title={p.name}
                      onClick={() => setSelected(isSelected ? null : p)}
                      className={[
                        'absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2',
                        'items-center justify-center rounded-full bg-gradient-to-br',
                        'text-white shadow-lg transition-all duration-200',
                        pinColor(p.category),
                        isSelected ? 'ring-2 ring-white/50 scale-125' : '',
                      ].join(' ')}
                      style={{
                        left: `${(Number(p.map_x || 0) / bounds.maxX) * 88 + 6}%`,
                        top:  `${(Number(p.map_y || 0) / bounds.maxY) * 88 + 6}%`,
                        zIndex: isSelected ? 10 : 1,
                      }}
                    >
                      <MapPin className="h-4 w-4" />
                    </motion.button>
                  );
                })}
              </AnimatePresence>
              {/* Selected tooltip */}
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 rounded-xl border border-white/10 bg-slate-950/95 px-4 py-2 text-center shadow-xl backdrop-blur-xl"
                >
                  <p className="text-xs font-bold text-white">{selected.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{selected.category}</p>
                </motion.div>
              )}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-400" />
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* POI list */}
        <motion.div {...fadeUp(0.12)}>
          <div className="flex max-h-[520px] flex-col">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
                {places.length} location{places.length !== 1 ? 's' : ''}
              </p>
              {selected && (
                <button type="button" onClick={() => setSelected(null)} className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                  Clear selection
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 shrink-0" rounded="rounded-xl" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-3.5 w-32" rounded="rounded-full" />
                        <Skeleton className="h-3 w-20" rounded="rounded-full" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full" rounded="rounded-full" />
                  </div>
                ))
              ) : places.length > 0 ? (
                places.map((p, i) => (
                  <PlaceCard
                    key={p.id}
                    place={p}
                    index={i}
                    onClick={setSelected}
                    selected={selected?.id === p.id}
                  />
                ))
              ) : (
                <EmptyState
                  title="No places match your filters"
                  description="Try clearing the search text or switching to a different category."
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

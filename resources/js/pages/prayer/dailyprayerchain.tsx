import { usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function PrayerChain() {
  const { dailyPrayerChain, allPrayersLazy, userTz } = usePage().props;
  const [expanded, setExpanded] = useState(false);

  const [sessionOpen, setSessionOpen] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  });

  const toggleSession = (session: string) => {
    setSessionOpen(prev => ({
      ...prev,
      [session]: !prev[session],
    }));
  };


  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz !== userTz) {
      document.cookie = `user_tz=${tz}; path=/`;
      router.reload({
        only: ['dailyPrayerChain', 'allPrayersLazy', 'userTz'],
      });
    }
  }, []);

  const prayersToShow = expanded ? allPrayersLazy : dailyPrayerChain;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🔥 Daily Prayer Chain</h1>
        <p className="text-gray-600">Session-specific prayers, updated daily for you!</p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setExpanded(v => !v)}
          className="px-6 py-3 rounded-full shadow transition bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {expanded ? 'Hide All Prayers' : 'View All Prayers'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {prayersToShow ? (
          <motion.div
            key={expanded ? 'expanded' : 'collapsed'}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className={expanded ? 'space-y-10' : 'grid md:grid-cols-2 gap-6'}
          >
            {expanded
              ? ['morning', 'afternoon', 'evening'].map(session => (
                  <div key={session} className="mb-6">
                    {/* Session Toggle Button */}
                    <button
                      onClick={() => toggleSession(session)}
                      className="w-full flex justify-between items-center px-4 py-2 text-lg font-semibold bg-indigo-100 hover:bg-indigo-200 rounded"
                    >
                      <span>{session.charAt(0).toUpperCase() + session.slice(1)} Prayers</span>
                      <span>{sessionOpen[session] ? '-' : '+'}</span>
                    </button>

                    {/* Animate Expansion */}
                    <AnimatePresence initial={false}>
                      {sessionOpen[session] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="overflow-hidden mt-4"
                        >
                          <div className="grid md:grid-cols-2 gap-6">
                            {prayersToShow[session] &&
                              Object.entries(prayersToShow[session]).map(([cat, prayer]) => (
                                <div key={cat} className="p-6 bg-white rounded-lg shadow-md border">
                                  <h3 className="text-xl font-semibold mb-2">{cat}</h3>
                                  {prayer.title && <p className="text-lg font-bold mb-1">{prayer.title}</p>}
                                  {prayer.scripture && (
                                    <blockquote className="italic text-gray-600 mb-2">📖 {prayer.scripture}</blockquote>
                                  )}
                                  <p>{prayer.decree || prayer.prayer}</p>
                                </div>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              : Object.entries(prayersToShow).map(([cat, prayer]) => (
                  <div key={cat} className="p-6 bg-white rounded-lg shadow-md border">
                    <h2 className="text-xl font-semibold mb-2">{cat}</h2>
                    {prayer.title && <p className="text-lg font-bold mb-1">{prayer.title}</p>}
                    {prayer.scripture && (
                      <blockquote className="italic text-gray-600 mb-2">📖 {prayer.scripture}</blockquote>
                    )}
                    <p>{prayer.decree || prayer.prayer}</p>
                  </div>
                ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-500 mt-6"
          >
            No prayers available.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

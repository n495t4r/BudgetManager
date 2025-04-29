import { usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function PrayerChain() {
    const { dailyPrayerChain, allPrayersLazy, userTz, prayerSession } = usePage().props;

    const [expanded, setExpanded] = useState(false);
    const [sessionOpen, setSessionOpen] = useState({
      morning: false,
      afternoon: false,
      evening: false,
    });

    const sessionRefs = useRef({
      morning: null,
      afternoon: null,
      evening: null,
    });

    const toggleSession = (session: string) => {
      setSessionOpen(prev => {
        const updated = { ...prev, [session]: !prev[session] };
        if (!prev[session]) {
          setTimeout(() => {
            sessionRefs.current[session]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 250);
        }
        return updated;
      });
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

    const now = new Date();
    const formattedDate = now.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    const currentSession = prayerSession;

    let nextSessionLabel = '';
    const nextSessionTime = new Date(now);

    if (currentSession === 'morning') {
      nextSessionLabel = 'afternoon';
      nextSessionTime.setHours(12, 0, 0, 0);
    } else if (currentSession === 'afternoon') {
      nextSessionLabel = 'evening';
      nextSessionTime.setHours(17, 0, 0, 0);
    } else {
      nextSessionLabel = 'tomorrow morning';
      nextSessionTime.setDate(nextSessionTime.getDate() + 1);
      nextSessionTime.setHours(1, 0, 0, 0);
    }

    const [countdown, setCountdown] = useState(
      Math.floor((nextSessionTime.getTime() - now.getTime()) / 1000)
    );

    useEffect(() => {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            router.reload({ only: ['dailyPrayerChain', 'allPrayersLazy', 'userTz'] });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const hrs = Math.floor(countdown / 3600);
    const mins = Math.floor((countdown % 3600) / 60);
    const secs = countdown % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const countdownString = `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;

    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🔥 Daily Prayer Chain</h1>
          <p className="text-gray-700">Session-specific prayers, updated daily for you!</p>
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
              {!expanded ? (
                <>
                  <div className="col-span-full sticky top-0 z-10 bg-white py-4 text-center shadow-sm">
                    <p className="text-sm text-gray-500">
                      {formattedDate} — {formattedTime}
                    </p>
                    <p className="text-md font-medium text-indigo-600">
                      📌 You are viewing today’s <span className="capitalize">{currentSession}</span> session prayers
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      ⏳ Next session (<span className="capitalize">{nextSessionLabel}</span>) starts in{' '}
                      <span className="font-semibold">{countdownString}</span>
                    </p>
                  </div>

                  {Object.entries(prayersToShow).map(([cat, prayer]) => (
                    <div key={cat} className="p-6 bg-white rounded-lg shadow-md border">
                      <h2 className="text-sm font-semibold mb-2">{cat}</h2>
                      {prayer.title && <p className="italic text-sm font-bold text-gray-500 mb-1">{prayer.title}</p>}
                      {prayer.scripture && (
                        <blockquote className="italic text-gray-600 mb-2">📖 {prayer.scripture}</blockquote>
                      )}
                      <p>{prayer.decree || prayer.prayer}</p>
                    </div>
                  ))}
                </>
              ) : (
                ['morning', 'afternoon', 'evening'].map(session => (
                  <div key={session} className="mb-6" ref={el => (sessionRefs.current[session] = el)}>
                    <button
                      onClick={() => toggleSession(session)}
                      className={`w-full flex justify-between items-center px-4 py-2 text-lg font-semibold rounded transition
                        ${currentSession === session
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'}
                      `}
                    >
                      <span>
                        {session.charAt(0).toUpperCase() + session.slice(1)} Prayers
                        {currentSession === session && (
                          <span className="ml-2 inline-block px-2 py-1 text-xs bg-yellow-300 text-yellow-900 rounded-full">
                            Current
                          </span>
                        )}
                      </span>
                      <span>{sessionOpen[session] ? '-' : '+'}</span>
                    </button>

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
                                  <h3 className="text-sm font-semibold mb-2">{cat}</h3>
                                  {prayer.title && <p className="italic text-sm font-bold text-gray-500 mb-1">{prayer.title}</p>}
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
              )}
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


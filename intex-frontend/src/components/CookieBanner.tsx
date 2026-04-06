import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "novapath_cookie_consent";

type ConsentValue = "accepted" | "declined";

export default function CookieBanner({
  onConsent,
}: {
  onConsent?: (value: ConsentValue) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const id = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(id);
    }
  }, []);

  function handleChoice(value: ConsentValue) {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
    onConsent?.(value);
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            aria-hidden="true"
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(6,14,9,0.7) 0%, transparent 45%)",
            }}
          />

          <motion.div
            key="banner"
            role="dialog"
            aria-modal="false"
            aria-label="Cookie consent"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "110%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 32,
              mass: 0.9,
            }}
            className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 w-auto sm:w-full sm:max-w-2xl"
          >
            <div
              className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(13,26,20,0.97) 0%, rgba(9,20,9,0.97) 100%)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <div
                aria-hidden="true"
                className="absolute top-0 inset-x-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #34d399 30%, #facc15 65%, transparent)",
                }}
              />

              <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    aria-hidden="true"
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg mt-0.5"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(52,211,153,0.15),rgba(250,204,21,0.1))",
                      border: "1px solid rgba(52,211,153,0.2)",
                    }}
                  >
                    🍪
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm leading-snug mb-1">
                      We use cookies
                    </p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Nova Path uses essential and analytical cookies to improve
                      your experience. We never sell your data. Read our{" "}
                      <a
                        href="/privacy"
                        className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded"
                      >
                        Privacy Policy
                      </a>{" "}
                      to learn more.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleChoice("declined")}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/10 hover:border-white/20 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    aria-label="Decline non-essential cookies"
                  >
                    Decline
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleChoice("accepted")}
                    className="relative px-5 py-2.5 rounded-xl text-sm font-semibold text-[#060e09] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1a14]"
                    style={{
                      background: "linear-gradient(135deg,#34d399,#16a34a)",
                    }}
                    aria-label="Accept all cookies"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl opacity-50"
                      style={{
                        background:
                          "linear-gradient(135deg,rgba(255,255,255,0.15),transparent)",
                      }}
                    />
                    <span className="relative">Accept</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatTicker = ({ text }) => {
  const [displayText, setDisplayText] = useState(text || "Initializing secure session context...");

  useEffect(() => {
    if (text && text !== displayText) {
      setDisplayText(text);
    }
  }, [text, displayText]);

  return (
    <div className="h-[40px] bg-accent flex items-center justify-center px-4 overflow-hidden border-b border-white/10 shrink-0">
      <AnimatePresence mode="wait">
        <motion.p
          key={displayText}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="text-white/80 text-[11px] font-mono tracking-widest uppercase flex items-center"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-success mr-3 animate-pulse"></span>
          {displayText}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default ChatTicker;

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight, Leaf } from 'lucide-react';
import { useLang } from '../../contexts/LangContext';
import HeroImage from './HeroImage';

export default function Hero() {
  const { t } = useLang();
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);

  // Track scroll progress relative to hero section
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  // Image: fades + drifts up. Disabled if user prefers reduced motion.
  const imgOpacity = useTransform(scrollYProgress, [0, 0.4, 0.7], [1, 0.6, 0]);
  const imgY       = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const imgScale   = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  // Text: subtle parallax in the opposite direction
  const textY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <section
      ref={ref}
      className="relative min-h-[88vh] flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* LEFT — content */}
        <motion.div style={reduceMotion ? {} : { y: textY }} className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                       bg-farm-green/10 text-farm-green dark:text-farm-light mb-5"
          >
            <Leaf size={14} /> {t('tagline')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-5"
          >
            {t('hero_title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="text-base sm:text-lg text-khet-600 dark:text-khet-300 leading-relaxed mb-8 max-w-xl"
          >
            {t('hero_sub')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-wrap gap-3"
          >
            <Link to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                         bg-farm-green text-white hover:bg-farm-green/90 transition shadow-lg shadow-farm-green/20">
              {t('hero_cta')} <ArrowRight size={18} />
            </Link>
            <Link to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                         border-2 border-farm-green text-farm-green hover:bg-farm-green/5 transition">
              {t('hero_explore')}
            </Link>
          </motion.div>
        </motion.div>

        {/* RIGHT — animated image */}
        <motion.div
          style={reduceMotion ? {} : { opacity: imgOpacity, y: imgY, scale: imgScale }}
          className="relative will-change-transform"
        >
          <HeroImage />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-farm-wheat/20 rounded-full blur-2xl -z-10" />
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-farm-green/20 rounded-full blur-2xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
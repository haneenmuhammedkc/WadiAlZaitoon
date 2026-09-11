import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export const PageTransition = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { opacity: 0, y: shouldReduceMotion ? 0 : -8, transition: { duration: 0.25 } },
  };

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={variants}>
      {children}
    </motion.div>
  );
};

export const FadeIn = ({ children, delay = 0, direction = "up", className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  const getDirectionOffset = () => {
    if (shouldReduceMotion) return { x: 0, y: 0 };
    switch (direction) {
      case "up": return { x: 0, y: 24 };
      case "down": return { x: 0, y: -24 };
      case "left": return { x: 24, y: 0 };
      case "right": return { x: -24, y: 0 };
      default: return { x: 0, y: 0 };
    }
  };

  const offset = getDirectionOffset();

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.1, 0.25, 1.0] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ children, className = "", staggerDelay = 0.08 }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-30px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: "easeOut" },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ScaleOnHover = ({ children, className = "", scale = 1.02 }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { scale, y: -3 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

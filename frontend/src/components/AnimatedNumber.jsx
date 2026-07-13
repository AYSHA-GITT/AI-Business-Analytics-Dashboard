import { useEffect, useRef } from "react";
import { useMotionValue, useTransform, animate } from "framer-motion";

function AnimatedNumber({ value, prefix = "", decimals = 0 }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => `${prefix}${v.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}`);
  const ref = useRef(null);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 1, ease: "easeOut" });
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value]);

  return <span ref={ref}>{prefix}0</span>;
}

export default AnimatedNumber;
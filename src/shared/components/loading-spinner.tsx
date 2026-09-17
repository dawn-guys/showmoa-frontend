"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "cn";

interface LoadingSpinnerProps {
  /** 원의 지름(px). 기본 50 */
  size?: number;
  /** 스크린리더용 라벨. 기본 "로딩 중" */
  label?: string;
  className?: string;
}

// 바깥부터 안쪽까지 커지는 불투명도를 가진 동심원 (Figma 디자인 시스템 기준)
const RINGS = [
  { scale: 1, opacity: 0.05 },
  { scale: 0.8, opacity: 0.2 },
  { scale: 0.6, opacity: 0.5 },
  { scale: 0.4, opacity: 1 },
];

/**
 * 동심원이 순차적으로 밝아지는 로딩 스피너.
 * prefers-reduced-motion이면 애니메이션을 멈춘다.
 */
export function LoadingSpinner({
  size = 50,
  label = "로딩 중",
  className,
}: LoadingSpinnerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <span
      role="status"
      aria-label={label}
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size }}
    >
      {RINGS.map((ring, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
          style={{
            width: size * ring.scale,
            height: size * ring.scale,
            opacity: ring.opacity,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [
                    ring.opacity,
                    Math.min(1, ring.opacity + 0.3),
                    ring.opacity,
                  ],
                }
          }
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </span>
  );
}

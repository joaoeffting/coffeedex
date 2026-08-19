"use client";

import { useRef, useState } from "react";

// Marking a shop "visited" is an honor-system claim with no verification
// behind it — a press-and-hold makes it a deliberate act instead of a
// stray tap, without actually stopping anyone determined to fake it
// (which is fine: this is a personal tracker, not a leaderboard).
// Keyboard users skip the hold and confirm on Enter/Space directly —
// replicating a timed hold via keyboard isn't a natural interaction.
export function HoldToConfirmButton({
  onConfirm,
  holdMs = 1100,
  idleLabel,
  holdingLabel,
  className,
}: {
  onConfirm: () => void;
  holdMs?: number;
  idleLabel: string;
  holdingLabel: string;
  className?: string;
}) {
  const [holding, setHolding] = useState(false);
  const firedRef = useRef(false);

  function start() {
    firedRef.current = false;
    setHolding(true);
  }

  function cancel() {
    setHolding(false);
  }

  function handleFillTransitionEnd(e: React.TransitionEvent<HTMLSpanElement>) {
    if (e.propertyName !== "transform") return;
    if (holding && !firedRef.current) {
      firedRef.current = true;
      setHolding(false);
      onConfirm();
    }
  }

  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onConfirm();
      }}
      className={`relative touch-none overflow-hidden select-none ${className ?? ""}`}
    >
      <span
        onTransitionEnd={handleFillTransitionEnd}
        className="absolute inset-0 origin-left bg-primary-foreground/25"
        style={{
          transform: holding ? "scaleX(1)" : "scaleX(0)",
          transitionProperty: "transform",
          transitionDuration: holding ? `${holdMs}ms` : "150ms",
          transitionTimingFunction: holding ? "linear" : "ease-out",
        }}
        aria-hidden="true"
      />
      <span className="relative">{holding ? holdingLabel : idleLabel}</span>
    </button>
  );
}

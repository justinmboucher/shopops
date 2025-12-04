// src/components/common/Avatar.jsx
import React from "react";
import clsx from "clsx"; // if you don't use clsx, we can inline string joins

// Dark-ish colors that work well with white text
const AVATAR_COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#22c55e", // green-500
  "#06b6d4", // cyan-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
];

function stringToIndex(str, max) {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % max;
}

function computeInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar
 *
 * Props:
 * - name: string (used for initials + color)
 * - imageUrl?: string
 * - idForColor?: string | number (optional stable key for color)
 * - size?: "xs" | "sm" | "md" | "lg"
 * - className?: string (extra classes)
 */
export default function Avatar({
  name,
  imageUrl,
  idForColor,
  size = "md",
  className,
}) {
  const key = (idForColor ?? name ?? "").toString();
  const colorIndex = stringToIndex(key, AVATAR_COLORS.length);
  const bg = AVATAR_COLORS[colorIndex];
  const initials = computeInitials(name);

  return (
    <div
      className={clsx("avatar", `avatar--${size}`, className)}
      style={{
        backgroundColor: bg,
        color: "#ffffff",
        fontWeight: 700,
      }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name || "Avatar"} />
      ) : (
        <span className="avatar__initials">{initials}</span>
      )}
    </div>
  );
}

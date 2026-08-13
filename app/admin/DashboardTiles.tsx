"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IdCard, Stamp, Banknote, Lock, type LucideIcon } from "lucide-react";
import type { Department } from "@/lib/adminUsers";

type Tile = {
  department: Department;
  title: string;
  description: string;
  href: string;
  ready: boolean;
};

const ICONS: Record<Department, LucideIcon> = {
  protocole: IdCard,
  consulaire: Stamp,
  paierie: Banknote,
};

const ACCENTS: Record<Department, { ring: string; glow: string; iconBg: string; iconText: string }> = {
  protocole: {
    ring: "hover:ring-ci-green",
    glow: "from-ci-green/30 via-ci-green/10 to-transparent",
    iconBg: "bg-ci-green-pale",
    iconText: "text-ci-green-dark",
  },
  consulaire: {
    ring: "hover:ring-ci-orange",
    glow: "from-ci-orange/30 via-ci-orange/10 to-transparent",
    iconBg: "bg-ci-orange-pale",
    iconText: "text-ci-orange-dark",
  },
  paierie: {
    ring: "hover:ring-navy",
    glow: "from-navy/25 via-navy/10 to-transparent",
    iconBg: "bg-neutral-100",
    iconText: "text-navy-deep",
  },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const tileVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const glowVariants = {
  rest: { opacity: 0, scale: 0.85 },
  hover: { opacity: 1, scale: 1.15, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.12, rotate: [0, -6, 6, 0], transition: { duration: 0.5, ease: "easeInOut" as const } },
};

export function DashboardTiles({ tiles, departments }: { tiles: Tile[]; departments: Department[] }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-wrap items-stretch justify-center gap-6 sm:gap-8"
    >
      {tiles.map((tile) => {
        const authorized = departments.includes(tile.department);
        const Icon = ICONS[tile.department];
        const accent = ACCENTS[tile.department];

        if (!authorized) {
          return (
            <motion.div
              key={tile.department}
              variants={tileVariants}
              title="Accès non autorisé"
              className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-neutral-100 ring-1 ring-black/5 flex flex-col items-center justify-center text-center px-6 opacity-70 grayscale"
            >
              <div className="w-16 h-16 rounded-2xl bg-neutral-200 flex items-center justify-center mb-4">
                <Lock className="w-7 h-7 text-neutral-400" />
              </div>
              <h2 className="text-xl font-bold text-neutral-500">{tile.title}</h2>
              <p className="text-sm text-neutral-400 mt-2">{tile.description}</p>
              <p className="text-xs text-neutral-400 mt-4 font-medium uppercase tracking-wide">Accès non autorisé</p>
            </motion.div>
          );
        }

        return (
          <motion.div key={tile.department} variants={tileVariants} initial="rest" whileHover="hover" whileTap={{ scale: 0.97 }} className="relative">
            <motion.div
              variants={glowVariants}
              className={`absolute -inset-3 rounded-[2rem] bg-gradient-to-br ${accent.glow} blur-xl -z-10`}
            />
            <Link
              href={tile.href}
              className={`group relative flex flex-col items-center justify-center text-center w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-white px-6 shadow-md ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-2xl ${accent.ring}`}
            >
              <motion.div
                variants={iconVariants}
                className={`w-16 h-16 rounded-2xl ${accent.iconBg} flex items-center justify-center mb-5`}
              >
                <Icon className={`w-8 h-8 ${accent.iconText}`} />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-deep">{tile.title}</h2>
              <p className="text-sm text-neutral-500 mt-3 leading-snug">{tile.description}</p>
              {!tile.ready && (
                <p className="text-xs text-ci-orange-dark mt-4 font-semibold uppercase tracking-wide">
                  En construction
                </p>
              )}
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

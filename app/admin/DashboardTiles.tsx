"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IdCard, Stamp, Banknote, FileClock, Lock, type LucideIcon } from "lucide-react";
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
  chrono: FileClock,
};

const ICON_TINTS: Record<Department, string> = {
  protocole: "text-ci-green-dark",
  consulaire: "text-ci-orange-dark",
  paierie: "text-navy-deep",
  chrono: "text-navy-deep",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const tileVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.035, y: -6, transition: { duration: 0.3, ease: "easeOut" as const } },
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

        if (!authorized) {
          return (
            <motion.div
              key={tile.department}
              variants={tileVariants}
              title="Accès non autorisé"
              className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl bg-neutral-100 ring-1 ring-black/5 flex flex-col items-center text-center px-6 pt-9 opacity-70 grayscale"
            >
              <div className="w-16 h-16 rounded-2xl bg-neutral-200 flex items-center justify-center mb-5 shrink-0">
                <Lock className="w-7 h-7 text-neutral-400" />
              </div>
              <h2 className="text-xl font-bold text-neutral-500 leading-tight">{tile.title}</h2>
              <p className="text-sm text-neutral-400 mt-3">{tile.description}</p>
              <p className="text-xs text-neutral-400 mt-4 font-medium uppercase tracking-wide">Accès non autorisé</p>
            </motion.div>
          );
        }

        return (
          <motion.div
            key={tile.department}
            variants={tileVariants}
            className="relative"
          >
            <motion.div
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: 0.97 }}
              variants={cardHoverVariants}
              className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl shadow-[0_25px_60px_-18px_rgba(20,30,50,0.28),0_10px_24px_-12px_rgba(20,30,50,0.14)] transition-shadow duration-300 hover:shadow-[0_32px_70px_-16px_rgba(20,30,50,0.32),0_14px_30px_-10px_rgba(20,30,50,0.18)]"
            >
            {/* glowing tricolor blob, clipped to the card's rounded bounds */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute top-1/2 left-1/2 w-[75%] aspect-square rounded-full opacity-90 blur-[38px] animate-ambaci-blob bg-gradient-to-r from-ci-orange via-white to-ci-green" />
            </div>

            {/* frosted glass panel holding the content */}
            <Link
              href={tile.href}
              className="group absolute inset-[5px] rounded-xl bg-white/90 backdrop-blur-xl ring-1 ring-white/70 flex flex-col items-center text-center px-6 pt-9 overflow-hidden"
            >
              <motion.div
                variants={iconVariants}
                className="w-16 h-16 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 flex items-center justify-center mb-5 shrink-0"
              >
                <Icon className={`w-8 h-8 ${ICON_TINTS[tile.department]}`} />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-deep leading-tight">{tile.title}</h2>
              <p className="text-sm text-neutral-600 mt-3 leading-snug">{tile.description}</p>
              {!tile.ready && (
                <p className="text-xs text-ci-orange-dark mt-4 font-semibold uppercase tracking-wide">
                  En construction
                </p>
              )}
            </Link>
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

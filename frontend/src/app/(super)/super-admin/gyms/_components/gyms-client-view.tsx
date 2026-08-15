"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Search,
  Phone,
  Mail,
  Calendar,
  Users,
  Ban,
  AlertTriangle,
  X,
  TrendingUp,
  Activity,
  Eye,
  Pencil,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { GymMobileCard } from "./gym-mobile-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Gym {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  subscriptionStatus: string;
  createdAt: string;
}

interface Overview {
  totalGyms: number;
  pastDueGyms: number;
  gyms: Gym[];
}

/* ─── Status Dot Badge ─── */
function StatusBadge({
  status,
  type,
}: {
  status: string;
  type: "gym" | "sub";
}) {
  const normalized = status.toLowerCase();

  const gymConfig: Record<
    string,
    { bg: string; text: string; dot: string; label: string }
  > = {
    active: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
      label: "Active",
    },
    inactive: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      dot: "bg-slate-400",
      label: "Inactive",
    },
    suspended: {
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-700 dark:text-rose-400",
      dot: "bg-rose-500",
      label: "Suspended",
    },
  };

  const subConfig: Record<
    string,
    { bg: string; text: string; dot: string; label: string }
  > = {
    active: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
      label: "Active",
    },
    past_due: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
      label: "Past Due",
    },
    suspended: {
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-700 dark:text-rose-400",
      dot: "bg-rose-500",
      label: "Suspended",
    },
    cancelled: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      dot: "bg-slate-400",
      label: "Cancelled",
    },
  };

  const config =
    type === "gym"
      ? gymConfig[normalized] || gymConfig.inactive
      : subConfig[normalized] || {
          bg: "bg-slate-100 dark:bg-slate-800",
          text: "text-slate-600 dark:text-slate-400",
          dot: "bg-slate-400",
          label: status.replace("_", " "),
        };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </div>
  );
}

/* ─── Animated Stat Card ─── */
function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  iconBg,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      <Card className="relative border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 transition-all duration-500">
        <div className={`absolute inset-x-0 top-0 h-1 ${gradient}`} />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {label}
              </p>
              <motion.p
                className="text-2xl font-black text-slate-900 dark:text-white tabular-nums"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: delay + 0.15,
                }}
              >
                {value}
              </motion.p>
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} shadow-sm`}
            >
              <Icon className="h-5 w-5 text-white" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Table Row ─── */
function GymTableRow({ gym, index }: { gym: Gym; index: number }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
      className="group border-b border-slate-100 dark:border-slate-800/80 transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
    >
      <TableCell className="pl-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-700 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
              {gym.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors duration-200 truncate">
              {gym.name}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[180px]">
              {gym.email || "No email provided"}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <div className="space-y-1.5">
          {gym.phone && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                <Phone className="h-2.5 w-2.5 text-slate-400" />
              </div>
              {gym.phone}
            </div>
          )}
          {gym.email && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                <Mail className="h-2.5 w-2.5 text-slate-400" />
              </div>
              <span className="truncate max-w-[160px]">{gym.email}</span>
            </div>
          )}
          {!gym.phone && !gym.email && (
            <span className="text-xs text-slate-400 italic">
              No contact info
            </span>
          )}
        </div>
      </TableCell>

      <TableCell className="py-4">
        <StatusBadge status={gym.status} type="gym" />
      </TableCell>

      <TableCell className="py-4">
        <StatusBadge status={gym.subscriptionStatus} type="sub" />
      </TableCell>

      <TableCell className="py-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span className="tabular-nums">{formatDate(gym.createdAt)}</span>
        </div>
      </TableCell>

      <TableCell className="pr-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link href={`/super-admin/gyms/${gym.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-slate-600 hover:text-violet-700 hover:bg-violet-50 dark:text-slate-400 dark:hover:text-violet-400 dark:hover:bg-violet-900/20 transition-all duration-200"
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              View
            </Button>
          </Link>
          <Link href={`/super-admin/gyms/${gym.id}/edit`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-slate-600 hover:text-violet-700 hover:bg-violet-50 dark:text-slate-400 dark:hover:text-violet-400 dark:hover:bg-violet-900/20 transition-all duration-200"
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
        </div>
      </TableCell>
    </motion.tr>
  );
}

/* ─── Main Client View ─── */
export function GymsClientView({
  overview,
  activeCount,
  suspendedCount,
}: {
  overview: Overview;
  activeCount: number;
  suspendedCount: number;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  /* Working search */
  const filteredGyms = useMemo(() => {
    if (!searchQuery.trim()) return overview.gyms;
    const q = searchQuery.toLowerCase();
    return overview.gyms.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.email?.toLowerCase() || "").includes(q) ||
        (g.phone?.toLowerCase() || "").includes(q),
    );
  }, [searchQuery, overview.gyms]);

  const stats = [
    {
      label: "Total Gyms",
      value: overview.totalGyms,
      icon: Building2,
      gradient: "bg-gradient-to-r from-violet-500 to-purple-500",
      iconBg: "bg-gradient-to-br from-violet-400 to-purple-600",
    },
    {
      label: "Active",
      value: activeCount,
      icon: Activity,
      gradient: "bg-gradient-to-r from-emerald-400 to-teal-500",
      iconBg: "bg-gradient-to-br from-emerald-400 to-teal-600",
    },
    {
      label: "Suspended",
      value: suspendedCount,
      icon: Ban,
      gradient: "bg-gradient-to-r from-rose-400 to-pink-500",
      iconBg: "bg-gradient-to-br from-rose-400 to-pink-600",
    },
    {
      label: "Past Due",
      value: overview.pastDueGyms,
      icon: AlertTriangle,
      gradient: "bg-gradient-to-r from-amber-400 to-orange-500",
      iconBg: "bg-gradient-to-br from-amber-400 to-orange-600",
    },
  ];

  return (
    <>
      {/* ─── Quick Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.08} />
        ))}
      </div>

      {/* ─── Gyms Table / Cards ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-5 pt-6 px-6 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                All Gyms
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 tabular-nums">
                  {filteredGyms.length}
                </span>
              </CardTitle>
              <CardDescription className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                {filteredGyms.length === 0 && searchQuery
                  ? "No gyms match your search"
                  : `${filteredGyms.length} ${filteredGyms.length === 1 ? "gym" : "gyms"} registered on the platform`}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-80">
              <Search
                className={`absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transition-colors duration-200 ${
                  isSearchFocused ? "text-violet-500" : "text-slate-400"
                }`}
              />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`h-10 pl-9 pr-9 text-sm bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 transition-all duration-300 rounded-lg ${
                  isSearchFocused
                    ? "border-violet-400 ring-2 ring-violet-100 dark:ring-violet-900/20 bg-white dark:bg-slate-800"
                    : "hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {overview.gyms.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Building2}
                  title="No gyms yet"
                  description="Once gyms are onboarded, you'll be able to view and manage them here."
                />
              </div>
            ) : filteredGyms.length === 0 ? (
              <div className="p-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 mb-4">
                    <Search className="h-7 w-7 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    No gyms found
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    No gyms match "
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {searchQuery}
                    </span>
                    ". Try a different search term.
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20"
                  >
                    Clear search
                  </button>
                </motion.div>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-6 w-[30%]">
                          Gym
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Contact
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Status
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Subscription
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Joined
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pr-6 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="popLayout">
                        {filteredGyms.map((gym, index) => (
                          <GymTableRow key={gym.id} gym={gym} index={index} />
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                  <AnimatePresence mode="popLayout">
                    {filteredGyms.map((gym: any, index) => (
                      <motion.div
                        key={gym.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, delay: index * 0.03 }}
                        className="p-4"
                      >
                        <GymMobileCard gym={gym} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}

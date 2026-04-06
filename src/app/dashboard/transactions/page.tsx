"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type Transaction = {
  id: string;
  amount: string;
  status: "pending" | "paid" | "failed";
  paidAt: string | null;
  createdAt: string;
  firstName: string;
  lastName: string;
  appointmentId: string;
  chosenDatetime: string;
};

const PERIOD_TABS = ["TODAY", "WEEK", "MONTH", "YEAR"] as const;
type Period = (typeof PERIOD_TABS)[number];

const PERIOD_MAP: Record<Period, string> = {
  TODAY: "today",
  WEEK: "week",
  MONTH: "month",
  YEAR: "year",
};

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  paid: { label: "Paid", bg: "var(--inkby-surface-neutral)", color: "var(--inkby-fg)" },
  pending: { label: "Pending", bg: "var(--inkby-orange)", color: "var(--inkby-surface)" },
  failed: { label: "Failed", bg: "var(--inkby-error, #e53e3e)", color: "var(--inkby-surface)" },
};

function formatAmount(raw: string | number): string {
  return Number(raw).toLocaleString("en-US");
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CreditCardIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 10h22" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-2xl p-4 bg-inkby-surface"
        >
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TransactionsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>("MONTH");
  const [earnings, setEarnings] = useState<number | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    setEarningsLoading(true);
    fetch(`/api/artist/earnings?period=${PERIOD_MAP[activePeriod]}`)
      .then((r) => r.json())
      .then((data) => setEarnings(data.total ?? 0))
      .catch(() => setEarnings(0))
      .finally(() => setEarningsLoading(false));
  }, [activePeriod]);

  useEffect(() => {
    setTxLoading(true);
    fetch("/api/artist/transactions")
      .then((r) => r.json())
      .then((data) => setTransactions(data.transactions ?? []))
      .catch(() => setTransactions([]))
      .finally(() => setTxLoading(false));
  }, []);

  return (
    <div className="max-w-xl mx-auto flex flex-col pb-28 bg-inkby-canvas min-h-screen">
      <header className="px-4 pt-5 pb-4">
        <h1 className="text-xl font-bold text-inkby-fg">Transactions</h1>
      </header>

      {/* Earnings card */}
      <div className="px-4 mb-4">
        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: "var(--inkby-surface)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest uppercase text-inkby-fg-muted">
              Earnings
            </p>
            <div
              className="flex items-center gap-0.5 rounded-full p-0.5"
              style={{ background: "var(--inkby-surface-neutral)" }}
            >
              {PERIOD_TABS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePeriod(p)}
                  className="rounded-full px-3 py-1 text-[10px] font-semibold transition-colors cursor-pointer"
                  style={{
                    background: activePeriod === p ? "var(--inkby-fg)" : "transparent",
                    color: activePeriod === p ? "var(--inkby-surface)" : "var(--inkby-fg-muted)",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {earningsLoading ? (
            <Skeleton className="h-9 w-36" />
          ) : (
            <p className="text-3xl font-bold text-inkby-fg">
              ₮{formatAmount(earnings ?? 0)}
            </p>
          )}
        </div>
      </div>

      {/* Transaction list */}
      <div className="px-4 mb-3">
        <p className="text-xs font-semibold tracking-widest uppercase text-inkby-fg-muted">
          All transactions
        </p>
      </div>

      {txLoading ? (
        <TransactionsSkeleton />
      ) : !transactions?.length ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 px-8 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-inkby-fg-muted"
            style={{ background: "var(--inkby-surface-neutral)" }}
          >
            <CreditCardIcon />
          </div>
          <div>
            <p className="font-semibold text-sm text-inkby-fg">No transactions yet</p>
            <p className="text-xs mt-1 text-inkby-fg-muted">
              Payments from clients will appear here once received.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-4">
          {transactions.map((tx) => {
            const style = STATUS_STYLES[tx.status] ?? STATUS_STYLES.pending;
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-2xl px-4 py-3.5"
                style={{ background: "var(--inkby-surface)" }}
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-inkby-fg">
                    {tx.firstName} {tx.lastName}
                  </p>
                  <p className="text-xs text-inkby-fg-muted">
                    {formatDate(tx.paidAt ?? tx.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-bold text-inkby-fg">
                    ₮{formatAmount(tx.amount)}
                  </p>
                  <span
                    className="text-[10px] font-semibold rounded-full px-2.5 py-0.5"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {style.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

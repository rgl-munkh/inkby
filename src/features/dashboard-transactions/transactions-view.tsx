"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/domain/money";
import { formatDate } from "@/lib/domain/dates";
import type { Transaction, Period } from "./types";
import { PERIOD_TABS, PERIOD_MAP, STATUS_STYLES } from "./types";

function CreditCardIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 10h22" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function TransactionsView({
  initialTransactions,
  initialEarnings,
}: {
  initialTransactions: Transaction[];
  initialEarnings: number;
}) {
  const [activePeriod, setActivePeriod] = useState<Period>("MONTH");
  const [earnings, setEarnings] = useState<number>(initialEarnings);
  const [earningsLoading, setEarningsLoading] = useState(false);

  useEffect(() => {
    if (activePeriod === "MONTH") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset to server-provided month total
      setEarnings(initialEarnings);
      return;
    }
    setEarningsLoading(true);
    fetch(`/api/artist/earnings?period=${PERIOD_MAP[activePeriod]}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setEarnings(data.total ?? 0))
      .catch(() => setEarnings(0))
      .finally(() => setEarningsLoading(false));
  }, [activePeriod, initialEarnings]);

  return (
    <div className="max-w-xl mx-auto flex flex-col pb-28 bg-background min-h-screen">
      <header className="px-4 pt-5 pb-4">
        <h1 className="text-xl font-bold text-foreground">Transactions</h1>
      </header>

      <div className="px-4 mb-4">
        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: "var(--card)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Earnings
            </p>
            <div
              className="flex items-center gap-0.5 rounded-full p-0.5"
              style={{ background: "var(--muted)" }}
            >
              {PERIOD_TABS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePeriod(p)}
                  className="rounded-full px-3 py-1 text-[10px] font-semibold transition-colors cursor-pointer"
                  style={{
                    background: activePeriod === p ? "var(--foreground)" : "transparent",
                    color: activePeriod === p ? "var(--card)" : "var(--muted-foreground)",
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
            <p className="text-3xl font-bold text-foreground">
              ₮{formatAmount(earnings)}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 mb-3">
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          All transactions
        </p>
      </div>

      {!initialTransactions.length ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 px-8 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-muted-foreground"
            style={{ background: "var(--muted)" }}
          >
            <CreditCardIcon />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">No transactions yet</p>
            <p className="text-xs mt-1 text-muted-foreground">
              Payments from clients will appear here once received.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-4">
          {initialTransactions.map((tx) => {
            const style = STATUS_STYLES[tx.status] ?? STATUS_STYLES.pending;
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-2xl px-4 py-3.5"
                style={{ background: "var(--card)" }}
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    {tx.firstName} {tx.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(tx.paidAt ?? tx.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-bold text-foreground">
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

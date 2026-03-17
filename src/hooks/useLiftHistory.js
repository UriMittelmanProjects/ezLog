import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useLiftHistory(userId) {
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("lift_history")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    const grouped = {};
    for (const row of data ?? []) {
      if (!grouped[row.lift_name]) grouped[row.lift_name] = [];
      grouped[row.lift_name].push({ date: row.date, weight: row.weight });
    }
    setHistory(grouped);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  async function upsertLiftEntry(liftName, date, weight) {
    const { error } = await supabase.from("lift_history").upsert(
      { user_id: userId, lift_name: liftName, date, weight },
      { onConflict: "user_id,lift_name,date" }
    );
    if (error) throw error;
    await fetchHistory();
  }

  return { history, loading, upsertLiftEntry, refetch: fetchHistory };
}

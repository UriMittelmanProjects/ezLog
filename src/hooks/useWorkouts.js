import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useWorkouts(userId) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkouts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("workouts")
      .select("*, lifts(*)")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) setError(error.message);
    else setWorkouts(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchWorkouts(); }, [fetchWorkouts]);

  async function createWorkout(payload) {
    const { muscles, ai_infer, ...rest } = payload;
    const { data: workout, error } = await supabase
      .from("workouts")
      .insert({ ...rest, muscle_groups: muscles ?? [], ai_infer_muscles: ai_infer ?? true, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    await fetchWorkouts();
    return workout;
  }

  async function updateWorkout(id, patch) {
    const { muscles, lifts: _l, ...rest } = patch;
    const update = { ...rest };
    if (muscles !== undefined) update.muscle_groups = muscles;

    if (Object.keys(update).length) {
      const { error } = await supabase.from("workouts").update(update).eq("id", id);
      if (error) throw error;
    }
    await fetchWorkouts();
  }

  async function deleteWorkout(id) {
    await supabase.from("lifts").delete().eq("workout_id", id);
    const { error } = await supabase.from("workouts").delete().eq("id", id);
    if (error) throw error;
    await fetchWorkouts();
  }

  async function addLift(workoutId, lift) {
    const { error } = await supabase
      .from("lifts")
      .insert({ ...lift, workout_id: workoutId });
    if (error) throw error;
    await fetchWorkouts();
  }

  async function updateLift(liftId, patch) {
    const { error } = await supabase.from("lifts").update(patch).eq("id", liftId);
    if (error) throw error;
    await fetchWorkouts();
  }

  async function deleteLift(liftId) {
    const { error } = await supabase.from("lifts").delete().eq("id", liftId);
    if (error) throw error;
    await fetchWorkouts();
  }

  return {
    workouts,
    loading,
    error,
    refetch: fetchWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    addLift,
    updateLift,
    deleteLift,
  };
}

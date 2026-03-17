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
      .select(`
        *,
        workout_muscle_groups(*),
        lifts(*)
      `)
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) setError(error.message);
    else setWorkouts(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchWorkouts(); }, [fetchWorkouts]);

  async function createWorkout(payload) {
    const { muscles, ...rest } = payload;
    const { data: workout, error: wErr } = await supabase
      .from("workouts")
      .insert({ ...rest, user_id: userId })
      .select()
      .single();
    if (wErr) throw wErr;

    if (muscles?.length) {
      const muscleRows = muscles.map((name) => ({
        workout_id: workout.id,
        name,
        sets: 0,
      }));
      await supabase.from("workout_muscle_groups").insert(muscleRows);
    }
    await fetchWorkouts();
    return workout;
  }

  async function updateWorkout(id, patch) {
    const { muscles, lifts: _lifts, workout_muscle_groups: _mg, ...rest } = patch;

    if (Object.keys(rest).length) {
      const { error } = await supabase
        .from("workouts")
        .update(rest)
        .eq("id", id);
      if (error) throw error;
    }

    if (muscles !== undefined) {
      await supabase.from("workout_muscle_groups").delete().eq("workout_id", id);
      if (muscles.length) {
        await supabase.from("workout_muscle_groups").insert(
          muscles.map((name) => ({ workout_id: id, name, sets: 0 }))
        );
      }
    }
    await fetchWorkouts();
  }

  async function deleteWorkout(id) {
    await supabase.from("lifts").delete().eq("workout_id", id);
    await supabase.from("workout_muscle_groups").delete().eq("workout_id", id);
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
    const { error } = await supabase
      .from("lifts")
      .update(patch)
      .eq("id", liftId);
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

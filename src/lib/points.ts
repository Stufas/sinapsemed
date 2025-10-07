import { supabase } from "@/integrations/supabase/client";

export const POINTS = {
  FLASHCARD_CREATED: 5,
  FLASHCARD_CORRECT: 10,
  FLASHCARD_INCORRECT: 2,
  QUESTION_CREATED: 5,
  QUESTION_CORRECT: 15,
  QUESTION_INCORRECT: 3,
  PRACTICE_COMPLETED: 50,
  STUDY_HOUR: 20, // Per hour studied
} as const;

export async function trackActivity(
  activityType: string,
  points: number,
  metadata?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all groups user is a member of
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    if (!memberships || memberships.length === 0) {
      // User not in any groups, just track locally
      return;
    }

    // Create activity for each group
    const activities = memberships.map((membership) => ({
      user_id: user.id,
      group_id: membership.group_id,
      activity_type: activityType,
      points,
      metadata: metadata || {},
    }));

    await supabase.from("user_activities").insert(activities);
  } catch (error) {
    console.error("Error tracking activity:", error);
  }
}

// Hardcoded user profile photos mapping
// Format: userId -> photoURL

export const USER_PROFILES: Record<string, string> = {
  "user_1771481082260_uxu20": "https://i.pravatar.cc/150?img=1",
  // Add more users here as needed
  // "user_xxxx": "https://i.pravatar.cc/150?img=2",
};

export function getUserProfilePhoto(userId: string): string | undefined {
  return USER_PROFILES[userId];
}
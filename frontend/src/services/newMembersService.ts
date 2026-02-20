const API_URL = "https://us-central1-orazaapp.cloudfunctions.net/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export interface NewMember {
  userId: string;
  displayName: string;
  createdAt: number;
}

// Get list of new members that current user hasn't seen yet
export async function getUnseenNewMembers(): Promise<NewMember[]> {
  try {
    const response = await fetch(`${API_URL}/members/new-unseen`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch new members");
    return response.json();
  } catch (error) {
    console.error("Failed to get new members:", error);
    return [];
  }
}

// Mark current user as a new member (called after registration)
export async function markMemberAsNew(): Promise<void> {
  try {
    await fetch(`${API_URL}/members/mark-new`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({}),
    });
  } catch (error) {
    console.error("Failed to mark as new member:", error);
  }
}

// Mark a new member as seen by current user
export async function markMemberAsSeen(memberId: string): Promise<void> {
  try {
    await fetch(`${API_URL}/members/mark-seen`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ memberId }),
    });
  } catch (error) {
    console.error("Failed to mark member as seen:", error);
  }
}

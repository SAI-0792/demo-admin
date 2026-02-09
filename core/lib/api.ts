// Mock data for demo
export const MOCK_USERS: Record<string, { password: string; user: any }> = {
  "admin@example.com": {
    password: "password",
    user: {
      id: "1",
      email: "admin@example.com",
      name: "Admin User",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      modules: ["hotel", "restaurant", "travel"],
      outlets: [
        { id: "h1", name: "Grand Hotel", type: "hotel" },
        { id: "h2", name: "Beach Resort", type: "hotel" },
        { id: "r1", name: "Italian Kitchen", type: "restaurant" },
        { id: "t1", name: "Adventure Tours", type: "travel" },
      ],
      currentOutletId: "h1",
    },
  },
  "hotel@example.com": {
    password: "password",
    user: {
      id: "2",
      email: "hotel@example.com",
      name: "Hotel Manager",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hotel",
      modules: ["hotel"],
      outlets: [{ id: "h3", name: "City Hotel", type: "hotel" }],
      currentOutletId: "h3",
    },
  },
  "superstar@mistnove.com": {
    password: "admin1234",
    user: {
      id: "3",
      email: "superstar@mistnove.com",
      name: "Super Admin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=superstar",
      modules: ["hotel", "restaurant", "travel"],
      outlets: [
        { id: "h1", name: "Grand Hotel", type: "hotel" },
        { id: "h2", name: "Beach Resort", type: "hotel" },
        { id: "r1", name: "Italian Kitchen", type: "restaurant" },
        { id: "t1", name: "Adventure Tours", type: "travel" },
      ],
      currentOutletId: "h1",
    },
  },
}

export async function loginUser(email: string, password: string) {
  const userData = MOCK_USERS[email]
  if (!userData || userData.password !== password) {
    throw new Error("Invalid credentials")
  }
  return userData.user
}

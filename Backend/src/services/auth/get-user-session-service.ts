import { UserRepository } from "@/repositories/user-repository";

export const getUserSessionService = async (userId: string) => {
  const userRepository = new UserRepository();

  try {
    const user = await userRepository.findById(userId);

    if (!user) {
      return { code: 404, status: "error", message: "User not found" };
    }

    return {
      code: 200,
      status: "success",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user.role ?? "USER").toUpperCase() === "ADMIN" ? "ADMIN" : "USER",
          emailVerified: user.emailVerified ?? null,
        },
      },
    };
  } catch (error) {
    console.error("getUserSessionService Error", error);
    return { code: 500, status: "error", message: "Failed to fetch user data" };
  }
};

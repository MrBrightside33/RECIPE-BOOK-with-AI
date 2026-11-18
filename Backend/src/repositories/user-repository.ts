import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { SignupInput } from "@/schema/auth-schema";

type UserCreateInput = Pick<SignupInput, "name" | "email"> & { passwordHash?: string; password?: string };

export function normalizeUserRole(role?: string | null): "USER" | "ADMIN" {
  return (role ?? "user").trim().toUpperCase() === "ADMIN" ? "ADMIN" : "USER";
}

export function toDatabaseRole(role?: string | null): "user" | "admin" {
  return (role ?? "USER").trim().toLowerCase() === "admin" ? "admin" : "user";
}

// Return account details without exposing the stored password hash.
const publicFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  createdAt: users.createdAt,
  role: users.role,
};

export class UserRepository {
  async findById(id: string) {
    const [user] = await db
      .select({
        ...publicFields,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user) {
      user.role = normalizeUserRole(user.role);
    }

    return user;
  }

  async findByEmail(email: string) {
    // Login needs the password hash to check the supplied password.
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user) {
      user.role = normalizeUserRole(user.role);
    }

    return user;
  }

  async create(data: UserCreateInput) {
    const passwordHash = data.passwordHash ?? data.password;

    if (!passwordHash) {
      throw new Error("Password hash is required to create a user");
    }

    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        passwordHash,
        role: toDatabaseRole("USER"),
      })
      .returning(publicFields);

    if (user) {
      user.role = normalizeUserRole(user.role);
    }

    return user;
  }

  async markEmailVerified(userId: string) {
    return null;
  }
}

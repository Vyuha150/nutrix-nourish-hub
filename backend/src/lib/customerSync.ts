import type { Collection, Db } from "mongodb";
import { getCollection } from "./mongo";
import type { CustomerRecord, UserRecord } from "../types";

/**
 * Computes the next customer ID in the format C-#### (e.g. C-1009, C-1010).
 * Seeded data ended at C-1008.
 */
export const getNextCustomerId = async (
  customersCollection: Collection<CustomerRecord>
): Promise<string> => {
  const all = await customersCollection.find({}, { projection: { id: 1 } }).toArray();
  let maxSeq = 1008;

  for (const c of all) {
    if (typeof c.id === "string") {
      const match = c.id.match(/^C-(\d+)$/);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num >= 1000 && num < 1000000 && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  }

  return `C-${maxSeq + 1}`;
};

/**
 * Links an existing customer profile to a user or creates a new customer profile.
 * - Normalized email is used as identity key.
 * - If customer exists: updates userId if not already set, keeping existing orders/LTV/segment.
 * - If customer doesn't exist: generates sequential C-#### ID and creates customer profile.
 */
export const ensureCustomerProfileForUser = async (user: {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
}): Promise<CustomerRecord> => {
  const customers = getCollection<CustomerRecord>("customers");
  const normEmail = user.email.trim().toLowerCase();

  // Find customer by userId or normalized email
  let customer = await customers.findOne({
    $or: [{ userId: user.id }, { email: normEmail }],
  });

  if (customer) {
    // If not yet linked to this userId, update it
    if (!customer.userId || customer.userId !== user.id) {
      const now = new Date();
      await customers.updateOne(
        { id: customer.id },
        { $set: { userId: user.id, updatedAt: now } }
      );
      customer = { ...customer, userId: user.id, updatedAt: now };
    }
    return customer;
  }

  // No customer exists: generate sequential ID and create
  const nextId = await getNextCustomerId(customers);
  const now = new Date();
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toISOString().slice(0, 10)
    : now.toISOString().slice(0, 10);

  const newCustomer: CustomerRecord = {
    id: nextId,
    userId: user.id,
    name: user.name || "Customer",
    email: normEmail,
    joined: joinedDate,
    segment: "New",
    createdAt: user.createdAt ? new Date(user.createdAt) : now,
    updatedAt: now,
  };

  try {
    await customers.insertOne(newCustomer);
    return newCustomer;
  } catch (_err: any) {
    // In case of race condition or simultaneous insert, lookup again
    const existing = await customers.findOne({
      $or: [{ userId: user.id }, { email: normEmail }],
    });
    if (existing) {
      if (!existing.userId || existing.userId !== user.id) {
        await customers.updateOne(
          { id: existing.id },
          { $set: { userId: user.id, updatedAt: new Date() } }
        );
      }
      return existing;
    }
    throw _err;
  }
};

/**
 * Reconciles customer profiles with registered user accounts.
 * - Runs automatically on server startup / database initialization.
 * - Ensures all users with role === 'customer' have a corresponding customer profile.
 * - Links existing customer profiles to users where emails match.
 * - Preserves all existing store customers and historical order data.
 */
export const reconcileCustomerProfiles = async (_db?: Db): Promise<{ linked: number; created: number }> => {
  const usersCollection = getCollection<UserRecord>("users");
  const customersCollection = getCollection<CustomerRecord>("customers");

  // Ensure unique index on customers.email
  try {
    await customersCollection.createIndex({ email: 1 }, { unique: true });
  } catch (err) {
    // Index may already exist
  }

  // Ensure index on customers.userId
  try {
    await customersCollection.createIndex({ userId: 1 });
  } catch (err) {
    // Index may already exist
  }

  const customerUsers = await usersCollection.find({ role: "customer" }).toArray();
  let linked = 0;
  let created = 0;

  for (const user of customerUsers) {
    const normEmail = user.email.trim().toLowerCase();
    const existing = await customersCollection.findOne({
      $or: [{ userId: user.id }, { email: normEmail }],
    });

    if (existing) {
      if (!existing.userId || existing.userId !== user.id) {
        await customersCollection.updateOne(
          { id: existing.id },
          { $set: { userId: user.id, updatedAt: new Date() } }
        );
        linked++;
      }
    } else {
      await ensureCustomerProfileForUser(user);
      created++;
    }
  }

  // Also check if any existing customers match ANY user (including admins who shopped)
  const allUsers = await usersCollection.find({}).toArray();
  const userMap = new Map(allUsers.map((u) => [u.email.trim().toLowerCase(), u]));
  const customersWithoutUserId = await customersCollection.find({ userId: { $exists: false } }).toArray();

  for (const cust of customersWithoutUserId) {
    const matchingUser = userMap.get(cust.email.trim().toLowerCase());
    if (matchingUser) {
      await customersCollection.updateOne(
        { id: cust.id },
        { $set: { userId: matchingUser.id, updatedAt: new Date() } }
      );
      linked++;
    }
  }

  if (linked > 0 || created > 0) {
    console.log(`[CustomerSync] Reconciled: ${linked} linked, ${created} created.`);
  }

  return { linked, created };
};

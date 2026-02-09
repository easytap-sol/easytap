"use server";

import { revalidatePath } from "next/cache";

// Generic refresh action
export async function refreshAction(path: string) {
  revalidatePath(path);
  return { success: true };
}

// Specific action for products
export async function refreshProductsAction() {
  revalidatePath("/admin/products");
  return { success: true };
}

// Specific action for overview
export async function refreshOverviewAction() {
  revalidatePath("/admin/overview");
  return { success: true };
}
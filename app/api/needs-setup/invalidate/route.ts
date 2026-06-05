import { NextResponse } from "next/server";
import { invalidateSetupCache } from "@/lib/setup-cache";

export async function POST() {
  try {
    invalidateSetupCache();
    return NextResponse.json(
      { success: true, message: "Setup cache invalidated" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error invalidating cache",
      },
      { status: 500 },
    );
  }
}

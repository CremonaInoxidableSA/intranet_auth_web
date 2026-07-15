import { NextResponse } from "next/server"
import { invalidateSetupCache } from "@/lib/setup-cache"

export async function POST() {
  invalidateSetupCache()
  return NextResponse.json({ success: true })
}

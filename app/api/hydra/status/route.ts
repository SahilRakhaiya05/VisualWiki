import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    enabled: Boolean(process.env.HYDRADB_API_KEY),
    tenantConfigured: Boolean(process.env.HYDRADB_TENANT_ID),
    mode: process.env.HYDRADB_API_KEY ? "connected" : "local"
  });
}

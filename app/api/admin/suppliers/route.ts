import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { suppliers } from "@/lib/schema";
import { withAdminAuth } from "@/lib/auth/middleware";

async function getHandler() {
  const result = await db.select().from(suppliers).orderBy(suppliers.name);

  const serialized = result.map((s) => ({
    ...s,
    id: s.id.toString(),
  }));

  return NextResponse.json({ success: true, data: serialized });
}

async function postHandler(request: NextRequest) {
  const body = await request.json();
  const { name, contactName, phone, email, address } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "Name is required" },
      { status: 400 }
    );
  }

  const [newSupplier] = await db
    .insert(suppliers)
    .values({
      name: name.trim(),
      contactName: contactName ?? null,
      phone: phone ?? null,
      email: email ?? null,
      address: address ?? null,
    })
    .returning();

  return NextResponse.json(
    {
      success: true,
      data: {
        ...newSupplier,
        id: newSupplier.id.toString(),
      },
    },
    { status: 201 }
  );
}

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);

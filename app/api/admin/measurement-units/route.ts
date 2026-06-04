import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { measurementUnits } from "@/lib/schema";
import { withAdminAuth } from "@/lib/auth/middleware";
import { eq } from "drizzle-orm";

const getHandler = async () => {
  try {
    const units = await db.select().from(measurementUnits);
    const serialized = units.map((u) => ({
      id: u.id.toString(),
      code: u.code,
      name: u.name,
      unitType: u.unitType,
      isBaseUnit: u.isBaseUnit,
    }));
    return NextResponse.json({ success: true, data: serialized }, { status: 200 });
  } catch (error) {
    console.error("Error fetching measurement units:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data unit pengukuran" },
      { status: 500 }
    );
  }
};

const postHandler = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { code, name, unitType } = body;

    if (
      typeof code !== "string" || !code.trim() ||
      typeof name !== "string" || !name.trim() ||
      typeof unitType !== "string" || !unitType.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Code, name, dan unit type wajib diisi" },
        { status: 400 }
      );
    }

    // Check for duplicate code
    const existing = await db
      .select({ id: measurementUnits.id })
      .from(measurementUnits)
      .where(eq(measurementUnits.code, code.trim().toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: `Unit dengan kode "${code}" sudah ada` },
        { status: 409 }
      );
    }

    const result = await db
      .insert(measurementUnits)
      .values({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        unitType: unitType.trim().toLowerCase(),
        isBaseUnit: false,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Unit berhasil ditambahkan",
        data: {
          id: result[0].id.toString(),
          code: result[0].code,
          name: result[0].name,
          unitType: result[0].unitType,
          isBaseUnit: result[0].isBaseUnit,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating measurement unit:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan unit" },
      { status: 500 }
    );
  }
};

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);

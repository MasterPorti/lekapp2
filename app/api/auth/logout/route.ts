import { NextResponse } from "next/server";
import { logoutUser } from "../../../lib/auth";

export async function POST() {
  try {
    await logoutUser();
    return NextResponse.json({ success: true, message: "Sesión cerrada con éxito" });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 });
  }
}

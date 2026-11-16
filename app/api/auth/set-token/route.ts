//TODO: ELIMINAR ESTA RUTA Y SU USO DEL REPOSITORIO CUANDO SE INTEGRE EL LOGIN Y REGISTER EN EL FRONTEND CON BACKEND, SE HA AÑADIDO UNICAMENTE CON EL FIN DE PERMITIR MODIFICAR LAS COOKIES PARA TEST
import { NextResponse, type NextRequest } from "next/server";
import { createSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { error: "Debes proporcionar un token en la query (?token=...)" },
      { status: 400 }
    );
  }

  await createSession(token);
  return NextResponse.redirect(new URL("/profile", request.nextUrl));
}

// Protegida pela sessão de admin (middleware.ts cobre `/admin/eventos/:path*`).
import { EVENT } from "@/content/event";
import { listRegistrations, registrationsToCsv } from "@/lib/event-registrations";

export async function GET(): Promise<Response> {
  try {
    const registrations = await listRegistrations(EVENT.slug);
    return new Response(registrationsToCsv(registrations), {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="inscritos-${EVENT.slug}.csv"`,
      },
    });
  } catch (error) {
    console.error("Falha ao exportar inscrições do evento", error);
    return Response.json({ error: "Não foi possível gerar a exportação agora." }, { status: 500 });
  }
}

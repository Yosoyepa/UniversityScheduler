import { redirect } from "next/navigation";

export default function Home() {
  // Redirigir el index principal directamente al dashboard/horario
  redirect("/dashboard/schedule");
}

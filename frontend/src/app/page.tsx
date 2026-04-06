/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
import { redirect } from "next/navigation";

export default function Home() {
  // Redirigir el index principal directamente al dashboard/horario
  redirect("/dashboard/schedule");
}

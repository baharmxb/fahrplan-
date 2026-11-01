import { DayView } from "@/components/PlanViews";
import { PLAN } from "@/lib/plan";

export const dynamicParams = false;

export function generateStaticParams() {
  return PLAN.map(({ day }) => ({ day: String(day) }));
}

export default async function DayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  return <DayView number={Number(day)} />;
}

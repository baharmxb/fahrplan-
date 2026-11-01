import { LessonsView } from "@/components/LessonsView";
import { readContentCounts } from "@/lib/content-index";

export default async function LessonsPage() {
  return <LessonsView counts={await readContentCounts()} />;
}

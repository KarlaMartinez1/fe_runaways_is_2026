import { redirect } from "next/navigation";

interface LessorReportsPageProps {
  searchParams?: Promise<{
    from?: string;
    to?: string;
    order?: string;
    page?: string;
    scenario?: string;
  }>;
}

export default async function LessorReportsPage({
  searchParams,
}: LessorReportsPageProps) {
  const resolved = searchParams ? await searchParams : {};
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolved)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  redirect(query ? `/owner/reports?${query}` : "/owner/reports");
}

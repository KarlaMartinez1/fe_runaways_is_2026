import { redirect } from "next/navigation";

interface LessorRatingsPageProps {
  searchParams?: Promise<{
    from?: string;
    to?: string;
    order?: string;
    page?: string;
    scenario?: string;
    bypass?: string;
    dev?: string;
  }>;
}

export default async function LessorRatingsPage({
  searchParams,
}: LessorRatingsPageProps) {
  const resolved = searchParams ? await searchParams : {};
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolved)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  redirect(query ? `/owner/reports/ratings?${query}` : "/owner/reports/ratings");
}

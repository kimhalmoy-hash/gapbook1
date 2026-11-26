import { notFound } from "next/navigation";
import { PageView } from "@/components/PageView";
import { alleRuter, finnRute, metadataFor } from "@/lib/katalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return alleRuter().map((rute) => ({ slug: rute.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const rute = finnRute(slug);
  if (!rute) return {};
  return metadataFor(rute);
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const rute = finnRute(slug);
  if (!rute) notFound();
  return <PageView rute={rute} />;
}

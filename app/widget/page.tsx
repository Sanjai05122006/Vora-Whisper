import { WidgetApp } from "@/components/widget-app";

type WidgetPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function WidgetPage({ searchParams }: WidgetPageProps) {
  const embed = searchParams?.embed;
  const isEmbedded = Array.isArray(embed) ? embed[0] === "1" : embed === "1";

  return <WidgetApp embedded={isEmbedded} />;
}

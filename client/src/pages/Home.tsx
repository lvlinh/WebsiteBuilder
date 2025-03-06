import HeroBanner from "@/components/Home/HeroBanner";
import NewsFeed from "@/components/Home/NewsFeed";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { language } = useI18n();

  return (
    <main>
      <HeroBanner />
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold tracking-tight mb-8">
          {language === 'vi' ? 'Tin tức mới nhất' : 'Latest News'}
        </h2>
        <NewsFeed />
      </section>
    </main>
  );
}
import HeroBanner from "@/components/Home/HeroBanner";
import NewsFeed from "@/components/Home/NewsFeed";

export default function Home() {
  return (
    <main>
      <HeroBanner />
      <section className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Latest News</h2>
            <NewsFeed />
          </div>
          <div>
            {/* Calendar/Events section to be added */}
          </div>
        </div>
      </section>
    </main>
  );
}
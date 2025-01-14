import VideoDownloader from "../components/VideoDownloader";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="py-3 px-4">
          <h1 className="text-2xl font-bold text-center">YouTube Video Downloader</h1>
        </div>
      </header>
      <main className="pt-24 px-4">
        <VideoDownloader />
      </main>
    </div>
  );
};

export default Index;
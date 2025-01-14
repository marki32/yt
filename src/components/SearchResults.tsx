import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Video {
  id: { videoId: string } | string;
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    publishedAt: string;
  };
}

interface SearchResultsProps {
  videos: Video[];
  onVideoSelect: (videoId: string) => void;
}

const SearchResults = ({ videos, onVideoSelect }: SearchResultsProps) => {
  const getVideoId = (video: Video) => {
    return typeof video.id === 'string' ? video.id : video.id.videoId;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <Card 
          key={getVideoId(video)} 
          className="overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gray-50 dark:bg-gray-900 border-0"
        >
          <div className="aspect-video relative">
            <img
              src={video.snippet.thumbnails.medium.url}
              alt={video.snippet.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-red-500 transition-colors duration-300">
              {video.snippet.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {video.snippet.channelTitle}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {new Date(video.snippet.publishedAt).toLocaleDateString()}
            </p>
            <Button
              onClick={() => onVideoSelect(getVideoId(video))}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all duration-300"
              variant="secondary"
            >
              Select Video
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SearchResults;

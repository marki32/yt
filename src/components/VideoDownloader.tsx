import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchResults from './SearchResults';
import { API_URL } from '../config';

const QUALITY_OPTIONS = [
  { label: '4K Ultra HD', value: '313+140', resolution: '2160p' },
  { label: '2K Quad HD', value: '271+140', resolution: '1440p' },
  { label: 'Full HD', value: '137+140', resolution: '1080p' },
  { label: 'HD', value: '22', resolution: '720p' },
  { label: 'SD', value: '135+140', resolution: '480p' },
  { label: '360p', value: '18', resolution: '360p' },
];

const VideoDownloader = () => {
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const [selectedQuality, setSelectedQuality] = useState(QUALITY_OPTIONS[2].value);
  const [downloading, setDownloading] = useState(false);
  const [searching, setSearching] = useState(false);
  const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

  const getVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const searchVideos = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          searchQuery
        )}&type=video&maxResults=12&key=${API_KEY}`
      );
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search videos');
    } finally {
      setSearching(false);
    }
  };

  const fetchVideoDetails = async (videoId?: string) => {
    const id = videoId || getVideoId(url);
    if (!id) return;

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${id}&key=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        setVideoDetails(data.items[0]);
        if (videoId) {
          setUrl(`https://youtube.com/watch?v=${videoId}`);
          // Scroll to the video details
          setTimeout(() => {
            document.querySelector('.video-details')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
      alert('Failed to fetch video details');
    }
  };

  const handleVideoSelect = (videoId: string) => {
    fetchVideoDetails(videoId);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const downloadUrl = `${API_URL}/download`;
      console.log('Calling URL:', downloadUrl);
      const response = await fetch(downloadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formatId: selectedQuality,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${videoDetails.snippet.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download failed: ${error.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 dark:text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 mb-2">
            YouTube Downloader
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Download your favorite YouTube videos in high quality
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="url" className="text-sm sm:text-base">Paste URL</TabsTrigger>
              <TabsTrigger value="search" className="text-sm sm:text-base">Search Videos</TabsTrigger>
            </TabsList>

            <TabsContent value="url">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  type="text"
                  placeholder="Paste YouTube URL here"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => fetchVideoDetails()}
                  className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  Get Info
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="search">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  type="text"
                  placeholder="Search YouTube videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchVideos()}
                  className="flex-1"
                />
                <Button 
                  onClick={searchVideos} 
                  disabled={searching}
                  className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>
              <SearchResults videos={searchResults} onVideoSelect={handleVideoSelect} />
            </TabsContent>
          </Tabs>

          {videoDetails && (
            <Card className="p-4 sm:p-6 mt-6 video-details bg-gray-50 dark:bg-gray-900 border-0 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img 
                    src={videoDetails.snippet.thumbnails.medium.url} 
                    alt={videoDetails.snippet.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 line-clamp-2">
                    {videoDetails.snippet.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {videoDetails.snippet.channelTitle}
                  </p>
                  
                  <div className="mt-auto space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Select Quality" />
                        </SelectTrigger>
                        <SelectContent>
                          {QUALITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.resolution} - {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleDownload} 
                      disabled={downloading}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      {downloading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Downloading...
                        </span>
                      ) : (
                        'Download Video'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoDownloader;

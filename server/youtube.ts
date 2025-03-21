
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export async function getVideoRecommendation(subject: string) {
  try {
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: 'snippet',
        q: `${subject} tutorial 2025`,
        type: 'video',
        maxResults: 1,
        key: YOUTUBE_API_KEY
      }
    });

    const video = response.data.items[0];
    return {
      title: video.snippet.title,
      description: video.snippet.description,
      url: `https://youtube.com/watch?v=${video.id.videoId}`
    };
  } catch (error) {
    console.error('Error fetching YouTube recommendation:', error);
    return null;
  }
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StoryCard from '../StoryCard';
import { GetMyTimelines } from '../../../apis/apicalls/apicalls';
import { toast } from 'react-toastify';
import LoadingOverlay from '../../loading-overlay/LoadingOverlay';

export default function MyTimelines() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [myTimelines, setMyTimelines] = useState([]);

  const fetchData = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('token');
      const response = await GetMyTimelines(authToken, { pageNumber: null, pageSize: null, orderBy: null });

      if (response.status === 401) {
        setIsLoading(false);
        navigate('/user-login');
        toast.info('Please log in again');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setMyTimelines(data.data);
      } else {
        toast.error(data.errorMessage || 'Failed to load stories');
      }
    } catch (error) {
      console.error('Error fetching timelines:', error);
      toast.error('Network error: Please try again later');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section>
      <div>
        <StoryCard
          title="Stories from your Heart"
          secondaryTitle="Where memories find their voice and moments become eternal"
          data={myTimelines}
          refetch={fetchData}
        />
      </div>
      {isLoading && (
        <LoadingOverlay
          isVisible={isLoading}
          message="Loading timelines"
          submessage="Please wait while we load your timelines"
          variant="slate"
          size="medium"
          showDots={true}
        />
      )}
    </section>
  );
}
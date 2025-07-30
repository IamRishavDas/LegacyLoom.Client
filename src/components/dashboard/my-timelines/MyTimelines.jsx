import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setTimelines, resetStoryCardState } from '../../../store/storyCardSlice';
import StoryCard from '../StoryCard';
import { GetMyTimelines } from '../../../apis/apicalls/apicalls';
import { toast } from 'react-toastify';
import LoadingOverlay from '../../loading-overlay/LoadingOverlay';

export default function MyTimelines() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { timelines } = useSelector((state) => state.storyCard);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (force = false) => {
    if (!force && timelines.length > 0) {
      return;
    }

    if (isLoading) return;
    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('token');
      const response = await GetMyTimelines(authToken, { pageNumber: null, pageSize: null, orderBy: null });

      if(response.status === 429){
          toast.warn("Too many request are made, please relax yourself while using this application");
          return;
      }

      if (response.status === 401) {
        setIsLoading(false);
        navigate('/user-login');
        toast.info('Please log in again');
        return;
      }

      const data = await response.json();
      if (data.success) {
        dispatch(setTimelines(data.data));
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
    if (timelines.length === 0) {
      fetchData();
    }
  }, [timelines]);

  return (
    <section>
      <div>
        <StoryCard
          title="Stories from your Heart"
          secondaryTitle="Where memories find their voice and moments become eternal"
          data={timelines}
          refetch={() => fetchData(true)}
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
import HomeContent from './HomeContent';
import HomeNav from './HomeNav';

const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <HomeNav/>
      <HomeContent/>
    </div>
  );
};

export default HomePage;
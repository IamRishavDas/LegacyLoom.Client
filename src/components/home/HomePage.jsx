import HomeContent from './HomeContent';
import SnowflakeAnimation, { SnowflakePresets } from '../animations/SnowflakeAnimation';


const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SnowflakeAnimation 
          {...SnowflakePresets.subtle}
          zIndex={0}
      />
      <HomeContent/>
    </div>
  );
};

export default HomePage;
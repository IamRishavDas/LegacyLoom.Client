import { Slide, ToastContainer } from "react-toastify";
import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetPublicFeed, resetStoryCardState, resetTimelines } from "./store/storyCardSlice";
import "./styles/toast.css"

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch(resetStoryCardState());
      dispatch(resetPublicFeed());
      dispatch(resetTimelines());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dispatch]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="light"
        transition={Slide}
        className="custom-toast-container"
      />
      <AppRoutes />
    </>
  );
}

export default App;
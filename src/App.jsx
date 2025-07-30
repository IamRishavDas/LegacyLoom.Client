import { Slide, ToastContainer } from "react-toastify"
import AppRoutes from "./routes/AppRoutes"
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetStoryCardState } from "./store/storyCardSlice";

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch(resetStoryCardState());
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
      />
      <AppRoutes/>
    </>
  )
}

export default App

import { Slide, ToastContainer } from "react-toastify"
import AppRoutes from "./routes/AppRoutes"

function App() {
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

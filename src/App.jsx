import { Slide, ToastContainer } from "react-toastify"
import AppRoutes from "./routes/AppRoutes"

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
      />
      <AppRoutes/>
    </>
  )
}

export default App

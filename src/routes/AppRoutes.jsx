import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '../components/home/HomePage'
import RegisterPage from '../components/register/RegisterPage'
import UserLoginPage from '../components/login/UserLoginPage'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
          <Route index element={<HomePage />} />
          <Route path='/user-login' element={<UserLoginPage/>}/>
          <Route path='/register' element={<RegisterPage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes

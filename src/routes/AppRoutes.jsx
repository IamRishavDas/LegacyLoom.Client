import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '../components/home/HomePage'
import RegisterPage from '../components/register/RegisterPage'
import UserLoginPage from '../components/login/UserLoginPage'
import UserDashboard from '../components/dashboard/UserDashboard'
import NotFound from '../components/not-found/NotFound'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
          <Route index element={<HomePage />} />
          <Route path='/home' element={<HomePage />} />
          <Route path='/user-login' element={<UserLoginPage/>}/>
          <Route path='/register' element={<RegisterPage/>}/>
          <Route path='/dashboard' element={<UserDashboard/>}/>
          <Route path='/not-found' element={<NotFound/>}/>
          <Route path='*' element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes

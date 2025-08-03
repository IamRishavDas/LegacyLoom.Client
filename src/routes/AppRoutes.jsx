import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '../components/home/HomePage'
import RegisterPage from '../components/register/RegisterPage'
import UserLoginPage from '../components/login/UserLoginPage'
import UserDashboard from '../components/dashboard/UserDashboard'
import NotFound from '../components/not-found/NotFound'
import Editor from '../components/dashboard/editor/Editor'
import DashboardNavbar from '../components/dashboard/DashboradNavbar'
import HomeNav from '../components/home/HomeNav'
import UnauthorizedPage from '../components/not-authenticated/UnauthorizedPage'
import MyTimelines from '../components/dashboard/my-timelines/MyTimelines'
import MyTimeline from '../components/dashboard/my-timelines/MyTimeline'
import PublicTimeline from '../components/dashboard/dashboard-content/PublicTimeline'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
          <Route element={<HomeNav/>}>
            <Route path='/' element={<HomePage />} />
            <Route path='/home' element={<HomePage />} />
            <Route path='/user-login' element={<UserLoginPage/>}/>
            <Route path='/register' element={<RegisterPage/>}/>
          </Route>
          <Route element={<DashboardNavbar/>}>
            <Route path='/dashboard' element={<UserDashboard/>}/>
            <Route path='/my-timelines' element={<MyTimelines/>}/>
            <Route path='/my-timelines/:id' element={<MyTimeline/>}/>
            <Route path='/dashboard/:id' element={<PublicTimeline/>}/>
            <Route path='/timeline-editor' element={<Editor/>}/>
          </Route>
          <Route path='/not-found' element={<NotFound/>}/>
          <Route path='/not-authorized' element={<UnauthorizedPage/>}/>
          <Route path='*' element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes

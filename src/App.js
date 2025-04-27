import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import './App.css';
import Login from './components/Login';
import Dashbord from './components/Dashbord';
import SignUp from './components/SignUp';

const route = createBrowserRouter([
  {
    path:'/signup',
    element:<SignUp/>
  },
  {
    path:'/dashbord',
    element:<Dashbord/>
  },
  {
    path:'/login',
    element:<Login/>
  }

])
function App() {
  return (
    <>
     <RouterProvider router={route}></RouterProvider>
     
    </>
  );
}

export default App;

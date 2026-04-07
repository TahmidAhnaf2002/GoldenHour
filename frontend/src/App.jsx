// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import HomePage from './pages/HomePage';
// import DonorRegistrationPage from './pages/DonorRegistrationPage';
// import FindDonorPage from './pages/FindDonorPage';
// import DashboardPage from './pages/DashboardPage';

// const ProtectedRoute = ({ children }) => {
//   const { user } = useAuth();
//   return user ? children : <Navigate to="/login" />;
// };

// const App = () => {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route
//             path="/home"
//             element={
//               <ProtectedRoute>
//                 <HomePage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/donor/register"
//             element={
//               <ProtectedRoute>
//                 <DonorRegistrationPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route path="/donor/find" element={<FindDonorPage />} />
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <DashboardPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route path="*" element={<Navigate to="/login" />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// };

// export default App;
/////////////////////////Feature 2//////////////////////////////////
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DonorRegistrationPage from './pages/DonorRegistrationPage';
import FindDonorPage from './pages/FindDonorPage';
import DashboardPage from './pages/DashboardPage';
import EmergencyBoardPage from './pages/EmergencyBoardPage';
import CreateEmergencyPage from './pages/CreateEmergencyPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/register"
            element={
              <ProtectedRoute>
                <DonorRegistrationPage />
              </ProtectedRoute>
            }
          />
          <Route path="/donor/find" element={<FindDonorPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/emergency" element={<EmergencyBoardPage />} />
          <Route
            path="/emergency/create"
            element={
              <ProtectedRoute>
                <CreateEmergencyPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
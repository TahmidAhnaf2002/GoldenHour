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
import CampBoardPage from './pages/CampBoardPage';
import CreateCampPage from './pages/CreateCampPage';
import CampManagePage from './pages/CampManagePage';
import BloodBankBoardPage from './pages/BloodBankBoardPage';
import BloodBankRegisterPage from './pages/BloodBankRegisterPage';
import BloodBankDashboardPage from './pages/BloodBankDashboardPage';
import AntivenomFinderPage from './pages/AntivenomFinderPage';
import AntivenomRegisterPage from './pages/AntivenomRegisterPage';
import MedicineFinderPage from './pages/MedicineFinderPage';
import MedicineAddPage from './pages/MedicineAddPage';
import MedicineManagePage from './pages/MedicineManagePage';
import MedicineReservationsPage from './pages/MedicineReservationsPage';
import NearExpiryBoardPage from './pages/NearExpiryBoardPage';
import NearExpiryPostPage from './pages/NearExpiryPostPage';
import NearExpiryManagePage from './pages/NearExpiryManagePage';
import NearExpiryMyClaimsPage from './pages/NearExpiryMyClaimsPage';
import MedicineAlternativePage from './pages/MedicineAlternativePage';
import HospitalBoardPage from './pages/HospitalBoardPage';
import HospitalRegisterPage from './pages/HospitalRegisterPage';
import HospitalDashboardPage from './pages/HospitalDashboardPage';


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



          <Route path="/camps" element={<CampBoardPage />} />
          <Route
            path="/camps/create"
            element={<ProtectedRoute><CreateCampPage /></ProtectedRoute>}
          />
          <Route
            path="/camps/:id/manage"
            element={<ProtectedRoute><CampManagePage /></ProtectedRoute>}
          />
          <Route path="/bloodbanks" element={<BloodBankBoardPage />} />
          <Route
            path="/bloodbank/register"
            element={<ProtectedRoute><BloodBankRegisterPage /></ProtectedRoute>}
          />
          <Route
            path="/bloodbank/dashboard"
            element={<ProtectedRoute><BloodBankDashboardPage /></ProtectedRoute>}
          />
          <Route path="/antivenom" element={<AntivenomFinderPage />} />
          <Route
            path="/antivenom/register"
            element={<ProtectedRoute><AntivenomRegisterPage /></ProtectedRoute>}
          />

          <Route path="/medicines" element={<MedicineFinderPage />} />
          <Route
            path="/medicines/add"
            element={<ProtectedRoute><MedicineAddPage /></ProtectedRoute>}
          />
          <Route
            path="/medicines/manage"
            element={<ProtectedRoute><MedicineManagePage /></ProtectedRoute>}
          />
          <Route
            path="/medicines/reservations"
            element={<ProtectedRoute><MedicineReservationsPage /></ProtectedRoute>}
          />

          <Route path="/nearexpiry" element={<NearExpiryBoardPage />} />
          <Route
            path="/nearexpiry/post"
            element={<ProtectedRoute><NearExpiryPostPage /></ProtectedRoute>}
          />
          <Route
            path="/nearexpiry/manage"
            element={<ProtectedRoute><NearExpiryManagePage /></ProtectedRoute>}
          />
          <Route
            path="/nearexpiry/myclaims"
            element={<ProtectedRoute><NearExpiryMyClaimsPage /></ProtectedRoute>}
          />

          <Route path="/medicines/alternatives" element={<MedicineAlternativePage />} />

          <Route path="/hospitals" element={<HospitalBoardPage />} />
          
          <Route
            path="/hospitals/register"
            element={<ProtectedRoute><HospitalRegisterPage /></ProtectedRoute>}
          />
          <Route
            path="/hospitals/dashboard"
            element={<ProtectedRoute><HospitalDashboardPage /></ProtectedRoute>}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
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
import EquipmentBoardPage from './pages/EquipmentBoardPage';
import EquipmentAddPage from './pages/EquipmentAddPage';
import EquipmentManagePage from './pages/EquipmentManagePage';
import EquipmentBookingsPage from './pages/EquipmentBookingsPage';
import HospitalVerificationPage from './pages/HospitalVerificationPage';
import ERWaitTimePage from './pages/ERWaitTimePage';
import ResponderRegisterPage from './pages/ResponderRegisterPage';
import ResponderDashboardPage from './pages/ResponderDashboardPage';
import SOSPage from './pages/SOSPage';
import LendingBoardPage from './pages/LendingBoardPage';
import LendingListPage from './pages/LendingListPage';
import LendingDashboardPage from './pages/LendingDashboardPage';
import FirstAidGuidePage from './pages/FirstAidGuidePage';
import HealthAlertPage from './pages/HealthAlertPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import DataQualityPage from './pages/DataQualityPage';
import OrganDonorPage from './pages/OrganDonorPage';
import PreparednesScorePage from './pages/PreparednesScorePage';
import EmergencyIdPage from './pages/EmergencyIdPage';
import EmergencyIdScanPage from './pages/EmergencyIdScanPage';




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
          <Route path="/equipment" element={<EquipmentBoardPage />} />
          <Route
            path="/equipment/add"
            element={<ProtectedRoute><EquipmentAddPage /></ProtectedRoute>}
          />
          <Route
            path="/equipment/manage"
            element={<ProtectedRoute><EquipmentManagePage /></ProtectedRoute>}
          />
          <Route
            path="/equipment/bookings"
            element={<ProtectedRoute><EquipmentBookingsPage /></ProtectedRoute>}
          />


          <Route
            path="/hospitals/verification"
            element={<ProtectedRoute><HospitalVerificationPage /></ProtectedRoute>}
          />


          <Route path="/hospitals/waittime" element={<ERWaitTimePage />} />

          <Route
            path="/responder/register"
            element={<ProtectedRoute><ResponderRegisterPage /></ProtectedRoute>}
          />
          <Route
            path="/responder/dashboard"
            element={<ProtectedRoute><ResponderDashboardPage /></ProtectedRoute>}
          />

          <Route
            path="/sos"
            element={<ProtectedRoute><SOSPage /></ProtectedRoute>}
          />

          <Route path="/lending" element={<LendingBoardPage />} />
          <Route
            path="/lending/list"
            element={<ProtectedRoute><LendingListPage /></ProtectedRoute>}
          />
          <Route
            path="/lending/dashboard"
            element={<ProtectedRoute><LendingDashboardPage /></ProtectedRoute>}
          />

          <Route path="/first-aid" element={<FirstAidGuidePage />} />

          <Route path="/health-alerts" element={<HealthAlertPage />} />



          <Route
            path="/admin"
            element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>}
          />

          <Route
            path="/analytics"
            element={<ProtectedRoute><AnalyticsDashboardPage /></ProtectedRoute>}
          />

          <Route
            path="/data-quality"
            element={<ProtectedRoute><DataQualityPage /></ProtectedRoute>}
          />

          <Route
            path="/organ-donor"
            element={<ProtectedRoute><OrganDonorPage /></ProtectedRoute>}
          />

          <Route
            path="/preparedness"
            element={<ProtectedRoute><PreparednesScorePage /></ProtectedRoute>}
          />

          <Route path="/emergency-id" element={<ProtectedRoute><EmergencyIdPage /></ProtectedRoute>} />
          <Route path="/emergency-id/scan/:emergencyId" element={<EmergencyIdScanPage />} />









        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
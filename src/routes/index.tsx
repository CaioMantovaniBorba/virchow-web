import { useState } from "react";
import { Routes as Router, Route } from 'react-router-dom';
import { UserContext } from "@/contexts/user";

import Login from '../pages/Login';
import SelectPatientForLado from '@/pages/SelectPatientForLaudo';
import CreateLaudo from '@/pages/CreateLaudo';
import RegisterPatient from '@/pages/RegisterPatient';
import SearchPatient from '@/pages/SearchPatient';
import EditPatient from '@/pages/EditPatient';
import EditLaudo from '@/pages/EditLaudo';
import Prints from "@/pages/Prints";
import { UserType } from "@/types/User";
import { PatientType } from "@/types/Patient";
import { LaudoType } from "@/types/Laudo";

const Routes: React.FC = () => {
  const [user, setUser] = useState<UserType>();
  const [patient, setPatient] = useState<PatientType>();
  const [laudo, setLaudo] = useState<LaudoType>();

  return (
    <UserContext.Provider value={{ user, setUser, patient, setPatient, laudo, setLaudo }}>
      <Router>
        <Route path="/" Component={Login} />
        <Route path="/pedidolaudo" Component={CreateLaudo} />
        <Route path="/editarlaudo" Component={EditLaudo} />
        <Route path="/impressoes" Component={Prints} />
        {/* <Route path="/incluirlaudo" Component={SelectPatientForLado} /> */}
        {/* <Route path="/cadastrarpaciente" Component={RegisterPatient} /> */}
        {/* <Route path="/cadastropaciente" Component={SearchPatient} /> */}
        {/* <Route path="/editarpaciente" Component={EditPatient} /> */}
      </Router>
    </UserContext.Provider>
  )
}

export default Routes;
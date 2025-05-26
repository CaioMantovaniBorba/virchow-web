import { useState } from "react";
import { Routes as Router, Route } from 'react-router-dom';
import { UserContext } from "@/contexts/user";

import Login from '../pages/Login';
import InclusionExaminations from '@/pages/InclusionExaminations';
import RequestExaminations from '@/pages/RequestExaminations';
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

  const userString = localStorage.getItem("user");
  const loggedUser = userString ? JSON.parse(userString) : null;

  return (
    <UserContext.Provider value={{ user, setUser, patient, setPatient, laudo, setLaudo }}>
      <Router>
        <Route path="/" Component={Login} />
        <Route path="/incluirlaudo" Component={InclusionExaminations} />
        <Route path="/pedidolaudo" Component={RequestExaminations} />
        <Route path="/editarlaudo" Component={EditLaudo} />
        <Route path="/cadastrarpaciente" Component={RegisterPatient} />
        <Route path="/cadastropaciente" Component={SearchPatient} />
        <Route path="/editarpaciente" Component={EditPatient} />
        <Route path="/impressoes" Component={Prints} />
      </Router>
    </UserContext.Provider>
  )
}

export default Routes;
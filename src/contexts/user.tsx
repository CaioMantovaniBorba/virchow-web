/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { createContext } from "react";
import { UserType } from "@/types/User";
import { PatientType } from "@/types/Patient";
import { LaudoType } from "@/types/Laudo";

interface UserContextType {
  user: UserType | undefined;
  setUser: Function;
  patient: PatientType | undefined;
  setPatient: Function;
  laudo: LaudoType | undefined;
  setLaudo: Function;
}

export const UserContext = createContext<UserContextType>({} as UserContextType);
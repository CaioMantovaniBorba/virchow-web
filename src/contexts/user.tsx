/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { createContext } from "react";
import { UserType } from "@/types/User";
import { PatientType } from "@/types/Patient";

interface UserContextType {
  user: UserType | undefined;
  setUser: Function;
  patient: PatientType | undefined;
  setPatient: Function;
}

export const UserContext = createContext<UserContextType>({} as UserContextType);
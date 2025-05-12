import { ChangeEvent, useContext, /* useEffect, */ useState } from 'react';
import { Loader2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
/* import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; */
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import { PatientType } from '@/types/Patient';
import { UserContext } from "@/contexts/user";

function InclusionOfExaminations() {
  const [openDialog, setOpenDialog] = useState(false);
  const [data, setData] = useState<PatientType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean>();

  const { setPatient } = useContext(UserContext);
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    const dateFormatted = new Date(date);
    return dateFormatted.toLocaleString().slice(0, 10);
  }

  const handleNavigate = (patient: PatientType) => {
    setOpenDialog(false);
    navigate("/pedidolaudo");
    setPatient(patient);
    localStorage.setItem("patient", JSON.stringify(patient));
  }

  const FormSchema = z.object({
    name: z.string(),
    unidadeSaude: z.string(),
    datNascimento: z.string()
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      unidadeSaude: "",
      datNascimento: ""
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {

    if (data.name.length <= 2 &&
      data.datNascimento.length === 0 &&
      data.unidadeSaude.length === 0
    ) {
      return alert("Preencha no mínimo um campo!");
    }

    setLoading(true);

    const patientData = {
      nome: data.name.toUpperCase(),
      datNascimento: data.datNascimento.length > 0 ? data.datNascimento : null,
    }

    api.post("/Paciente/filter", patientData)
      .then((response) => {
        if (response.data.length === 0) {
          toast.warn("Paciente não encontrado!", {
            position: "top-right",
          });
          setLoading(false);
          return;
        }
        setData(response.data);
        setOpenDialog(true);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Paciente não encontrado!", {
          position: "top-right",
        });
      }
      )
  }

  return (
    <>
      <Header />
      <ToastContainer autoClose={2000} />

      <div className="flex flex-col justify-center w-[90%] space-y-8">
        <div className="flex items-center w-full h-[50px] rounded-sm bg-gray-200  border border-gray-300">
          <span className="ml-2 text-xl font-bold">INCLUIR LAUDO</span>
        </div>

        <div className="flex flex-col rounded-sm border border-gray-300 space-y-4">
          <div className="flex items-center w-full h-[40px] bg-gray-200 border-b border-b-gray-300">
            <span className="ml-2 text-md">Pesquisar paciente</span>
          </div>


          {/* Pesquisar paciente */}
          <div className="flex p-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className='text-left'>
                      <FormLabel className='text-lg'>Nome Paciente *</FormLabel>
                      <FormControl>
                        <Input className="pl-2 w-full uppercase" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-4">
                  <div className="w-1/5">
                    <FormField
                      control={form.control}
                      name="datNascimento"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg max-sm:text-sm'>Data Nascimento</FormLabel>
                          <FormControl>
                            <Input
                              className="pl-2 w-full"
                              type="date"
                              {...field}
                              onChange={(e) => {
                                if (e.target.value.length <= 10) {
                                  field.onChange(e);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end w-full">
                  {loading ?
                    <Button className="w-1/5" disabled>
                      <Loader2 className="animate-spin" /> Aguarde
                    </Button> :
                    <Button type="submit" className="w-[200px] bg-[#0C647C] hover:bg-[#0C647C]/80">Pesquisar</Button>
                  }
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="md:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Listagem de Pacientes</DialogTitle>
            <DialogDescription>
              Pacientes encontrados
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center overflow-y-auto max-h-80 space-y-2">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Nasc</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data && data.map((patient) => (
                  <tr>
                    <td className="p-4 rounded border-t border-b border-l border-r-0">
                      <span className="text-sm">{patient.nome}</span>
                    </td>
                    <td className="border-t border-b text-center">
                      <span>{formatDate(patient.datNascimento)}</span>
                    </td>
                    <td className="border-t border-b border-r text-center">
                      <Button
                        className="bg-[#0C647C] hover:bg-[#0C647C]/80 w-[100px] m-2"
                        onClick={() => handleNavigate(patient)}
                      >
                        Selecionar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default InclusionOfExaminations;


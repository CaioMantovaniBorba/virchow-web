import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Textarea } from "@/components/ui/textarea";
import { Editor } from 'primereact/editor';

import { z } from "zod";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PatientType } from "@/types/Patient";
import api from "@/services/api";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
interface Examination {
  seq_exame: string;
  nome: string;
  codigo: string;
}

interface UserType {
  nome: string;
  seq_cliente: string;
}

type Age = {
  number: number;
  type: "M" | "A";
};

function RequestExaminations() {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [age, setAge] = useState<Age>({ number: 0, type: "M" });
  const [descricaoLaudo, setDescricaoLaudo] = useState('');

  const patientString = localStorage.getItem("patient");
  const patient: PatientType = patientString ? JSON.parse(patientString) : null;
  const userString = localStorage.getItem("user");
  const user: UserType = userString ? JSON.parse(userString) : null;

  const date = new Date();
  const requestDate = date.toISOString();

  const navigate = useNavigate();

  const FormSchema = z.object({
    name: z.string().min(10, {
      message: "Insira o nome do paciente.",
    }),
    estadoCivil: z.string(),
    sexo: z.string().min(1, {
      message: "Insira seu sexo."
    }),
    datNascimento: z.string().min(10, {
      message: "Insira a data de nascimento.",
    }),
    profissao: z.string(),
    procedencia: z.string(),
    medicoRequisitante: z.string().min(5, {
      message: "Insira o médico requisitante."
    }),
    hipoteseDiagnostica: z.string().min(10, {
      message: "Insira o hipótese diagnóstica."
    }),
    resumoClinico: z.string().min(10, {
      message: "Insira o resumo clínico."
    }),
    datUltimaMenstruacao: z.string().optional()
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: patient?.nome,
      estadoCivil: patient?.estadoCivil.descricao,
      sexo: patient?.sexo,
      datNascimento: patient?.datNascimento?.slice(0, 10),
      profissao: patient?.profissao,
      procedencia: patient?.procedencia
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const currentDate = new Date();

    const laudoData = {
      // id: 0,
      nomePaciente: data.name,
      idade: age.number,
      estadoCivil: data.estadoCivil,
      resumoClinico: data.resumoClinico,
      hipoteseDiagnostica: data.hipoteseDiagnostica,
      datUltimaMenstruacao: data.datUltimaMenstruacao ? data.datUltimaMenstruacao : null,
      datNascimento: data.datNascimento,
      medicoRequisitante: data.medicoRequisitante,
      datExame: currentDate,
      desLaudo: descricaoLaudo,
      exameId: 1
    }

    console.log(laudoData);

    // api.post("/pedido", data)
    //   .then(response => {
    //     toast.success("Pedido de exame criado com sucesso!");
    //     setTimeout(() => {
    //       api.get(`/pedido/${response.data}`, { responseType: "blob" })
    //         .then(response => {
    //           const fileURL = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    //           window.open(fileURL);
    //           if (fileURL) {
    //             navigate("/incluirlaudo");
    //           }
    //         })
    //         .catch(() => {
    //           toast.error("Não foi possível gerar a impressão!");
    //         })
    //     }, 1000);
    //   })
    //   .catch(() => {
    //     toast.error("Não foi possível processar o pedido de exame!");
    //     setLoading(false);
    //   })
  }

  const calculateAge = (birthDate: string | number | Date, currentDate = new Date()) => {
    const birth = new Date(birthDate);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    const birthYear = birth.getFullYear();
    const birthMonth = birth.getMonth();
    const birthDay = birth.getDate();

    let years = currentYear - birthYear;
    let months = currentMonth - birthMonth;

    if (months < 0 || (months === 0 && currentDay < birthDay)) {
      years--;
      months += 12;
    }

    if (currentDay < birthDay) {
      months--;
    }

    if (years === 0) {
      return setAge({ number: months, type: "M" });
    } else {
      return setAge({ number: years, type: "A" });
    }
  }

  useEffect(() => {
    calculateAge(patient.datNascimento.slice(0, 10));
  }, [patient.datNascimento])

  return (
    <>
      <Header />
      <ToastContainer autoClose={2000} />

      <div className="flex flex-col justify-center w-[90%] space-y-8 mt-[68px]">
        <div className="flex items-center w-full h-[50px] rounded-sm bg-gray-200  border border-gray-300">
          <span className="ml-2 text-xl font-bold">INCLUIR LAUDO</span>
        </div>

        <div className="flex flex-col rounded-sm border border-gray-300 space-y-4">
          <div className="flex items-center w-full h-[40px] bg-gray-200 border-b border-b-gray-300">
            <span className="ml-2 text-sm text-gray-600">* Campos obrigatórios</span>
          </div>

          <div className="w-full">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 p-2">
                <div className="flex w-full space-x-8">
                  <div className="w-1/3">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg'>Nome Paciente</FormLabel>
                          <FormControl>
                            <Input className="pl-2 w-full uppercase" disabled {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-1/3">
                    <FormField
                      control={form.control}
                      name="estadoCivil"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg'>Estado Civil</FormLabel>
                          <FormControl>
                            <Input className="pl-2 w-full uppercase" disabled {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-1/3">
                    <FormField
                      control={form.control}
                      name="sexo"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg'>Sexo</FormLabel>
                          <FormControl>
                            <Input className="pl-2 w-full uppercase" disabled {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex w-full space-x-8">
                  <div className="w-1/3">
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
                              disabled
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-1/3">
                    <label htmlFor="age" className="block text-sm font-medium leading-6">
                      Idade
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="undefined"
                      value={age.type === "M" ? `${age.number} meses` : `${age.number} anos`}
                      disabled
                      className="block p-2 w-full rounded-sm border-0 py-1.5 text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
                    />
                  </div>

                  <div className="w-1/3">
                    <FormField
                      control={form.control}
                      name="profissao"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg'>Profissão</FormLabel>
                          <FormControl>
                            <Input className="pl-2 w-full uppercase" disabled {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex w-full space-x-8">
                  <div className="w-1/3">
                    <FormField
                      control={form.control}
                      name="procedencia"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg'>Procedência</FormLabel>
                          <FormControl>
                            <Input className="pl-2 w-full uppercase" disabled {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-1/3">
                    {patient.sexo === "F" &&
                      <div className="w-1/3">
                        <FormField
                          control={form.control}
                          name="datUltimaMenstruacao"
                          render={({ field }) => (
                            <FormItem className='text-left'>
                              <FormLabel className='text-lg max-sm:text-sm'>Data da última menstruação</FormLabel>
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
                    }
                  </div>

                  <div className="w-1/3">
                  </div>
                </div>

                <div className="flex w-full space-x-8">
                  <div className="w-1/3">
                    <FormField
                      control={form.control}
                      name="tipoLaudo"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg'>Tipo de laudo</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Tipo de laudo</SelectLabel>
                                  <SelectItem value="M">Tipo 1</SelectItem>
                                  <SelectItem value="F">Tipo 2</SelectItem>
                                  <SelectItem value="F">Tipo 3</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-1/3">
                    <FormField
                      control={form.control}
                      name="medicoRequisitante"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg'>Médico requisitante</FormLabel>
                          <FormControl>
                            <Input className="pl-2 w-full uppercase" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-1/3">
                  </div>
                </div>

                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="hipoteseDiagnostica"
                    render={({ field }) => (
                      <FormItem className='text-left'>
                        <FormLabel className='text-lg'>Hipótese Diagnóstica</FormLabel>
                        <FormControl>
                          <Textarea className="pl-2 w-full uppercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="resumoClinico"
                    render={({ field }) => (
                      <FormItem className='text-left'>
                        <FormLabel className='text-lg'>Resumo Clínico</FormLabel>
                        <FormControl>
                          <Textarea className="pl-2 w-full uppercase" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="card">
                  <Editor value={descricaoLaudo} onTextChange={(e) => setDescricaoLaudo(e.htmlValue)} style={{ height: '320px' }} />
                </div>

                <div className="flex justify-end w-full">
                  <Button
                    className="w-[200px] m-2"
                    type="submit"
                  // onClick={() => setOpenDialog(true)}
                  >
                    Cancelar</Button>
                  {loading ?
                    <Button className="w-[200px] m-2" disabled>
                      <Loader2 className="animate-spin" /> Aguarde
                    </Button> :
                    <Button
                      type="submit"
                      className="w-[200px] bg-[#0C647C] hover:bg-[#0C647C]/80 m-2"
                    // onClick={() => handleConfirm()}
                    >
                      Salvar
                    </Button>
                  }
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmação</DialogTitle>
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>
          <span className="py-4">Tem certeza que deseja cancelar a inclusão do laudo?</span>
          <DialogFooter>
            <DialogClose>
              <Button className="w-[100px]">Não</Button>
            </DialogClose>
            <Button className="w-[100px] bg-[#0C647C] hover:bg-[#0C647C]/80" onClick={() => navigate("/incluirlaudo")}>Sim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openConfirmDialog} onOpenChange={setOpenConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmação</DialogTitle>
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>
          <span className="py-4">Deseja salvar o laudo?</span>
          <DialogFooter>
            <DialogClose>
              <Button className="w-[100px]">Não</Button>
            </DialogClose>
            <Button className="w-[100px] bg-[#0C647C] hover:bg-[#0C647C]/80">Sim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RequestExaminations;


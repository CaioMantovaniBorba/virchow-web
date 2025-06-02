import { useState, useContext, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import api from "@/services/api";
import { UserContext } from "@/contexts/user";

interface EstadoCivilType {
  id: number;
  descricao: string;
}

function EditPatient() {
  const [loading, setLoading] = useState(false);
  const { patient } = useContext(UserContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [estadoCivil, setEstadoCivil] = useState<EstadoCivilType[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/EstadoCivil')
      .then(response => setEstadoCivil(response.data))
      .catch(() => {
        toast.error("Erro ao listar estados civis!", {
          position: "top-right",
        });
      })
  }, []);

  useEffect(() => {
    if (patient?.nome.length === 0 || patient === undefined) {
      navigate("/cadastropaciente");
    }
  })

  const FormSchema = z.object({
    name: z.string().min(10, {
      message: "Insira o nome do paciente.",
    }),
    estadoCivil: z.object({
      id: z.number(),
      descricao: z.string(),
    }).optional(),
    sexo: z.string().min(1, {
      message: "Insira seu sexo."
    }),
    datNascimento: z.string().optional(),
    profissao: z.string(),
    procedencia: z.string(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: patient?.nome,
      estadoCivil: patient?.estadoCivil ?? null,
      sexo: patient?.sexo,
      datNascimento: patient?.datNascimento?.slice(0, 10),
      profissao: patient?.profissao,
      procedencia: patient?.procedencia
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (
      data.name === patient?.nome &&
      data.sexo === patient.sexo &&
      data.datNascimento === patient.datNascimento?.slice(0, 10) &&
      data.profissao === patient.profissao &&
      data.procedencia === patient.procedencia &&
      data.estadoCivil.id === patient.estadoCivil.id
    ) {
      return alert("Nenhum dado do paciente foi alterado!");
    }
    if (data.datNascimento.length > 0) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const birth = new Date(data.datNascimento);
      const year = birth.getFullYear();
      if (year < 1900 || year > currentYear)
        return alert("Insira a data correta!");
    }

    setLoading(true);

    const pacienteData = {
      id: patient?.id,
      nome: data.name.toUpperCase(),
      estadoCivil: {
        id: data?.estadoCivil.id,
        descricao: data?.estadoCivil.descricao
      },
      sexo: data.sexo,
      datNascimento: data.datNascimento,
      profissao: data.profissao.toUpperCase(),
      procedencia: data.procedencia.toUpperCase()
    }

    api.put(`/Paciente/${patient?.id}`, pacienteData)
      .then(() => {
        toast.success("Paciente atualizado com sucesso!", {
          position: "top-right",
        });
        setTimeout(() => {
          navigate("/cadastropaciente");
          setLoading(false);
        }, 2000);
      })
      .catch(() => {
        toast.error("Erro ao atualizar paciente!", {
          position: "top-right",
        });
        setLoading(false);
      }
      )
  }

  return (
    <>
      <Header />
      <ToastContainer autoClose={2000} />

      <div className="flex flex-col justify-center w-[90%] space-y-8">
        <div className="flex items-center w-full h-[50px] rounded-sm bg-gray-200  border border-gray-300">
          <span className="ml-2 text-xl font-bold">EDITAR PACIENTE</span>
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
                            <Input className="pl-2 w-full uppercase" {...field} />
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
                        <FormItem className="text-left">
                          <FormLabel className="text-lg">Estado Civil</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                const selected = estadoCivil.find(item => item.id.toString() === value);
                                if (selected) field.onChange(selected);
                              }}
                              value={field.value?.id?.toString() ?? ""}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione">
                                  {field.value?.descricao ?? "Selecione"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Estado Civil</SelectLabel>
                                  {estadoCivil.map((item) => (
                                    <SelectItem key={item.id} value={item.id.toString()}>
                                      {item.descricao}
                                    </SelectItem>
                                  ))}
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
                      name="sexo"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg'>Sexo</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder="Selecione"
                                  children={
                                    field.value === "M"
                                      ? "Masculino"
                                      : field.value === "F"
                                        ? "Feminino"
                                        : "Selecione"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Sexo</SelectLabel>
                                  <SelectItem value="M">Masculino</SelectItem>
                                  <SelectItem value="F">Feminino</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
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
                            <Input className="pl-2 w-full uppercase" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="w-1/3">
                    <FormField
                      control={form.control}
                      name="procedencia"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg'>Procedência</FormLabel>
                          <FormControl>
                            <Input className="pl-2 w-full uppercase" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end w-full space-x-2">
                  <Button type="button" className="w-[200px]" onClick={() => setOpenDialog(true)}>Cancelar</Button>
                  {loading ?
                    <Button className="w-1/5" disabled>
                      <Loader2 className="animate-spin" /> Aguarde
                    </Button> :
                    <Button type="submit" className="w-[200px] bg-[#0C647C] hover:bg-[#0C647C]/80">Salvar</Button>
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
          <span className="py-4">Tem certeza que deseja cancelar a edição do paciente?</span>
          <DialogFooter>
            <DialogClose>
              <Button className="w-[100px]">Não</Button>
            </DialogClose>
            <Button className="w-[100px] bg-[#0C647C] hover:bg-[#0C647C]/80" onClick={() => navigate("/cadastropaciente")}>Sim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EditPatient;


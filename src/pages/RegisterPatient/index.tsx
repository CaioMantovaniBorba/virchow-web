import { useEffect, useState } from "react";
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
  FormMessage
} from "@/components/ui/form";
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import api from "@/services/api";

interface EstadoCivilType {
  id: number;
  descricao: string;
}

function RegisterPatient() {
  const [loading, setLoading] = useState(false);
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

  const FormSchema = z.object({
    name: z.string().min(8, {
      message: "Insira o nome do paciente.",
    }),
    estadoCivil: z.string(),
    sexo: z.string().min(1, {
      message: "Insira seu sexo."
    }),
    datNascimento: z.string().min(10, {
      message: "Insira a data de nascimento.",
    }),
    profissao: z.string().min(10, {
      message: "Insira a profissão."
    }),
    procedencia: z.string().min(4, {
      message: "Insira a procedência."
    })
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      estadoCivil: "",
      sexo: "",
      datNascimento: "",
      profissao: "",
      procedencia: ""
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
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
      nome: data.name.toUpperCase(),
      estadoCivil: {
        id: 1,
        descricao: "Solteiro"
      },
      sexo: data.sexo,
      datNascimento: `${data.datNascimento}T00:00:00.000Z`,
      profissao: data.profissao.toUpperCase(),
      procedencia: data.procedencia.toUpperCase()
    }
    api.post("/Paciente", pacienteData)
      .then(() => {
        toast.success("Paciente cadastrado com sucesso!", {
          position: "top-right",
        });
        setTimeout(() => {
          navigate("/cadastropaciente");
        }, 2000);
      })
      .catch((response) => {
        console.log(response.status);
        if (response.status == 409) {
          return toast.error("Paciente já cadastrado!");
        }
        toast.error("Erro ao cadastrar paciente!", {
          position: "top-right",
        });
      }
      ).finally(() => {
        setLoading(false);
      })
  }

  return (
    <>
      <Header />
      <ToastContainer autoClose={2000} />

      <div className="flex flex-col justify-center w-[90%] space-y-8">
        <div className="flex items-center w-full h-[50px] rounded-sm bg-gray-200  border border-gray-300">
          <span className="ml-2 text-xl font-bold">INCLUIR PACIENTE</span>
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
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg'>Estado Civil</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder="Selecione"
                                  children={
                                    estadoCivil.find((item) => item.id === field.value)?.descricao
                                  }
                                />
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
                            <Select onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
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
          <span className="py-4">Tem certeza que deseja cancelar a inclusão do paciente?</span>
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

export default RegisterPatient;


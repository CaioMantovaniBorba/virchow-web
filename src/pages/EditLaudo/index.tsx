import { useEffect, useState, useRef } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { PatientType } from "@/types/Patient";
import { LaudoType as LaudoBodyType } from "@/types/Laudo";
import api from "@/services/api";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  CaretSortIcon
} from "@radix-ui/react-icons";

interface LaudoType {
  id: number;
  nome: string;
  descricao: string;
  topicosList: string[];
}

interface DiagnosticoType {
  id: number;
  codigo: string;
  conteudo: string;
}

type Age = {
  number: number;
  type: "M" | "A";
};

function EditLaudo() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 500 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDiagnosticosDialog, setOpenDiagnosticosDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState<Age>({ number: 0, type: "M" });
  const [descricaoLaudo, setDescricaoLaudo] = useState<string | null>(null);
  const [tiposLaudo, setTiposLaudo] = useState<LaudoType[]>([]);
  const [data, setData] = useState<DiagnosticoType[]>([]);

  const patientString = localStorage.getItem("patient");
  const patient: PatientType = patientString ? JSON.parse(patientString) : null;
  const laudoString = localStorage.getItem("laudo");
  const laudo: LaudoBodyType = laudoString ? JSON.parse(laudoString) : null;

  const editorRef = useRef(null);
  const navigate = useNavigate();

  const columns: ColumnDef<DiagnosticoType>[] = [
    {
      accessorKey: "codigo",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Código
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("codigo")}</div>
    },
    {
      accessorKey: "conteudo",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nome
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-left">{row.getValue("conteudo")}</div>
    },
    {
      accessorKey: "Selecione",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
          </Button>
        )
      },
      cell: ({ row }) => <Button
        className="bg-[#0C647C] hover:bg-[#0C647C]/80 w-[80px] m-2"
        onClick={() => insertText(row.getValue("conteudo"))}
      >Selecionar</Button>
    },

  ]

  const table = useReactTable({
    data,
    columns,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    api.get('/Exame')
      .then(response => setTiposLaudo(response.data))
      .catch(() => {
        toast.error("Erro ao listar tipos de laudos!", {
          position: "top-right",
        });
      })

    if (laudo) {
      setDescricaoLaudo(laudo.desLaudo);
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault(); // evita conflito com autocompletes ou outras ações padrão
        setOpenDiagnosticosDialog(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const insertText = (diagnostico: string) => {
    const quill = editorRef.current?.getQuill();
    if (quill) {
      const cursorPos = quill.getSelection()?.index || 0;
      quill.insertText(cursorPos, diagnostico);
      setOpenDiagnosticosDialog(false);
    }
  };

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
    datUltimaMenstruacao: z.string().optional(),
    tiposLaudo: z.string()
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: laudo?.nomePaciente,
      estadoCivil: laudo?.estadoCivil,
      sexo: laudo?.sexo,
      profissao: laudo?.profissao,
      procedencia: laudo?.procedencia,
      medicoRequisitante: laudo?.medicoRequisitante,
      hipoteseDiagnostica: laudo?.hipoteseDiagnostica,
      resumoClinico: laudo?.resumoClinico,
      datNascimento: laudo?.datNascimento?.slice(0, 10),
    },
  });

  const selectedTipoLaudoId = form.watch("tiposLaudo");

  useEffect(() => {
    if (selectedTipoLaudoId) {
      api.get(`/Diagnostico/${selectedTipoLaudoId}`)
        .then((response) => {
          setData(response.data);
        })
        .catch(() => {
          toast.error("Erro ao listar os diagnósticos!", {
            position: "top-right",
          });
        })
    }
  }, [selectedTipoLaudoId]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const currentDate = new Date();

    const laudoData = {
      nomePaciente: data.name,
      idade: age.number.toString(),
      estadoCivil: data.estadoCivil,
      resumoClinico: data.resumoClinico,
      hipoteseDiagnostica: data.hipoteseDiagnostica,
      datUltimaMenstruacao: data.datUltimaMenstruacao ? data.datUltimaMenstruacao : null,
      datNascimento: `${data.datNascimento}T00:00:00.000Z`,
      medicoRequisitante: data.medicoRequisitante,
      datExame: currentDate,
      desLaudo: descricaoLaudo,
      exameId: 1
    }

    console.log("laudoData", laudoData);

    api.put(`/Laudo/${laudo.id}`, laudoData)
      .then(() => {
        toast.success("Laudo atualizado com sucesso!");
        setTimeout(() => {
          navigate("/impressoes");
        }, 1000);
      })
      .catch(() => {
        toast.error("Não foi possível atualizar o laudo!");
        setLoading(false);
      })
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
          <span className="ml-2 text-xl font-bold">EDITAR LAUDO</span>
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

                  <div className="w-1/3">
                  </div>
                </div>

                <div className="flex w-full space-x-8">
                  <div className="w-1/3">
                    <FormField
                      control={form.control}
                      name="tiposLaudo"
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
                                  {tiposLaudo.map(item => (
                                    <SelectItem value={item.id}>{item.nome}</SelectItem>
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
                  <Editor
                    ref={editorRef}
                    value={descricaoLaudo}
                    onTextChange={(e) => setDescricaoLaudo(e.htmlValue)}
                    style={{ height: '320px' }}
                  />
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

      <Dialog open={openDiagnosticosDialog} onOpenChange={setOpenDiagnosticosDialog}>
        <DialogContent className="md:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Listagem de Diagnósticos</DialogTitle>
            <DialogDescription>
              Diagnósticos encontrados
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col justify-center overflow-y-auto max-h-80 space-y-2">
            <div className="flex w-1/2">
              <Input
                placeholder="Filtrar pelo código"
                value={(table.getColumn("codigo")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("codigo")?.setFilterValue(event.target.value)
                }
                className="max-w-md"
              />
            </div>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Sem dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EditLaudo;


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

interface EstadoCivilType {
  id: number;
  descricao: string;
}

function RequestExaminations() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 500 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDiagnosticosDialog, setOpenDiagnosticosDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState<Age>({ number: 0, type: "M" });
  const [descricaoLaudo, setDescricaoLaudo] = useState<string | null>(null);
  const [tiposLaudo, setTiposLaudo] = useState<LaudoType[]>([]);
  const [data, setData] = useState<DiagnosticoType[]>([]);
  const [estadoCivil, setEstadoCivil] = useState<EstadoCivilType[]>([]);

  const patientString = localStorage.getItem("patient");
  const patient: PatientType = patientString ? JSON.parse(patientString) : null;

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

    api.get('/EstadoCivil')
      .then(response => setEstadoCivil(response.data))
      .catch(() => {
        toast.error("Erro ao listar estados civis!", {
          position: "top-right",
        });
      })
  }, []);

  const handleTipoLaudoChange = (
    value: string,
    fieldOnChange: (value: any) => void
  ) => {
    const selectedLaudo = tiposLaudo.find(item => item.id.toString() === value);

    if (selectedLaudo) {
      const htmlTopicos = selectedLaudo.topicosList
        .map(t => `<p>${t}</p><br /><br />`)
        .join('');

      setDescricaoLaudo(htmlTopicos);

      fieldOnChange(selectedLaudo);
    } else {
      fieldOnChange(null);
      setDescricaoLaudo("");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Space") {
        openDialogAndSaveCursor();
        e.preventDefault();
        setOpenDiagnosticosDialog(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const editorRef = useRef<any>(null);
  const cursorIndexRef = useRef<number | null>(null);

  // capturar a posição do cursor
  const openDialogAndSaveCursor = () => {
    const quill = editorRef.current?.getQuill();
    if (quill) {
      const selection = quill.getSelection();
      if (selection) {
        cursorIndexRef.current = selection.index;
      }
    }
    setOpenDiagnosticosDialog(true);
  };

  const insertText = (diagnostico: string) => {
    const quill = editorRef.current?.getQuill();
    if (quill && cursorIndexRef.current !== null) {
      quill.insertText(cursorIndexRef.current, diagnostico);
      quill.setSelection(cursorIndexRef.current + diagnostico.length);
      cursorIndexRef.current = null; // limpa depois de usar
    }
    setOpenDiagnosticosDialog(false);
  };

  const FormSchema = z.object({
    name: z.string().min(10, {
      message: "Insira o nome do paciente.",
    }),
    estadoCivil: z.preprocess(
      (val) => {
        if (val === "" || val === null || val === undefined) {
          return null;
        }
        return val;
      },
      z.object({
        id: z.number(),
        descricao: z.string(),
      }).nullable()
    ),
    sexo: z.string().nullable().optional(),
    datNascimento: z.string().optional(),
    profissao: z.string().nullable().optional(),
    procedencia: z.string().nullable().optional(),
    medicoRequisitante: z.string().nullable().optional(),
    resumoClinico: z.string().nullable().optional(),
    datUltimaMenstruacao: z.string().optional(),
    tiposLaudo: z.preprocess(
      (val) => val === "" ? undefined : val,
      z.object({
        id: z.number(),
        nome: z.string(),
        descricao: z.string(),
        topicosList: z.array(z.string()),
      }, {
        required_error: "Selecione o tipo de laudo.",
      })
    ),
    nroLaudo: z.coerce.number({
      required_error: "Insira o número do laudo.",
      invalid_type_error: "Insira o número do laudo.",
    }).min(1, {
      message: "Insira o número do laudo.",
    }),
    datExame: z.string({
      required_error: "Insira a data do exame.",
      invalid_type_error: "Data inválida.",
    }).min(10, {
      message: "Insira a data do exame.",
    }),
    idade: z.string().nullable().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      estadoCivil: "",
      sexo: "",
      datNascimento: "",
      profissao: "",
      procedencia: "",
    },
  });

  const selectedTipoLaudo = form.watch("tiposLaudo");

  useEffect(() => {
    if (selectedTipoLaudo) {
      api.get(`/Diagnostico/${selectedTipoLaudo.id}`)
        .then((response) => {
          setData(response.data);
        })
        .catch(() => {
          toast.error("Erro ao listar os diagnósticos!", {
            position: "top-right",
          });
        })
    }
  }, [selectedTipoLaudo]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    const currentDate = new Date();

    const laudoData = {
      nomePaciente: data?.name ? data.name : "",
      estadoCivil: data?.estadoCivil?.id ? data.estadoCivil.descricao : null,
      sexo: data?.sexo ? data.sexo : "",
      profissao: data?.profissao ? data.profissao : "",
      procedencia: data?.procedencia ? data.procedencia : "",
      resumoClinico: data?.resumoClinico ? data.resumoClinico : "",
      datUltimaMenstruacao: data.datUltimaMenstruacao ? data.datUltimaMenstruacao : null,
      datNascimento: data?.datNascimento ? `${data.datNascimento}T00:00:00.000Z` : null,
      medicoRequisitante: data.medicoRequisitante ? data.medicoRequisitante : null,
      desLaudo: descricaoLaudo,
      exameId: parseInt(selectedTipoLaudo.id),
      nroLaudo: data.nroLaudo,
      datExame: data.datExame,
      idade: data?.idade ? data.idade : ""
    }

    api.post("/Laudo", laudoData)
      .then(response => {
        toast.success("Laudo criado com sucesso!");
        setTimeout(() => {
          api.get(`/Laudo/${response.data.id}/pdf`, { responseType: "blob" })
            .then(response => {
              const fileURL = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
              window.open(fileURL);
              if (fileURL) {
                navigate("/impressoes");
              }
            })
            .catch(() => {
              toast.error("Não foi possível gerar a impressão!");
            })
        }, 1000);
      })
      .catch((error) => {
        if (error.status === 409) {
          return toast.error(error.response.data.error);
        }
        toast.error("Não foi possível processar o laudo!");
      })
      .finally(() => {
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
    calculateAge(patient?.datNascimento?.slice(0, 10));
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
                            <Input className="pl-2 w-full" {...field} />
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
                                const selected = estadoCivil.find(
                                  (item) => item.id.toString() === value
                                );
                                if (selected) field.onChange(selected);
                              }}
                              value={field.value?.id?.toString() ?? ""}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder="Selecione"
                                  children={
                                    field.value?.descricao ?? "Selecione"
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
                            <Input className="pl-2 w-full" {...field} />
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
                      name="idade"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg'>Idade</FormLabel>
                          <FormControl>
                            <Input className="pl-2 w-full" {...field} />
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
                            <Input className="pl-2 w-full" {...field} />
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
                            <Input className="pl-2 w-full" {...field} />
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
                      name="nroLaudo"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg'>Número de laudo</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="pl-2 w-full"
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const raw = e.target.value;
                                field.onChange(raw === "" ? undefined : raw);
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
                      name="datExame"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg max-sm:text-sm'>Data Exame</FormLabel>
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
                      name="datUltimaMenstruacao"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg max-sm:text-sm'>Data da última menstruação</FormLabel>
                          <FormControl>
                            <Input className="pl-2 w-full" {...field} />
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
                      name="tiposLaudo"
                      render={({ field }) => (
                        <FormItem className="text-left">
                          <FormLabel className="text-lg">Tipo de laudo</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => handleTipoLaudoChange(value, field.onChange)}
                              value={field.value?.id?.toString() ?? ""}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione">
                                  {field.value?.nome ?? "Selecione"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Tipo de laudo</SelectLabel>
                                  {tiposLaudo.map(item => (
                                    <SelectItem key={item.id} value={item.id.toString()}>
                                      {item.nome}
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
                      name="medicoRequisitante"
                      render={({ field }) => (
                        <FormItem className='text-left'>
                          <FormLabel className='text-lg'>Médico requisitante</FormLabel>
                          <FormControl>
                            <Input className="pl-2 w-full" {...field} />
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
                    name="resumoClinico"
                    render={({ field }) => (
                      <FormItem className='text-left'>
                        <FormLabel className='text-lg'>Resumo Clínico</FormLabel>
                        <FormControl>
                          <Textarea className="pl-2 w-full h-[200px]" {...field} />
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
                    type="button"
                    onClick={() => setOpenCancelDialog(true)}
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

      <Dialog open={openCancelDialog} onOpenChange={setOpenCancelDialog}>
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
            <Button className="w-[100px] bg-[#0C647C] hover:bg-[#0C647C]/80" onClick={() => navigate("/impressoes")}>Sim</Button>
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
                placeholder="Filtrar pela descrição"
                value={(table.getColumn("conteudo")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("conteudo")?.setFilterValue(event.target.value)
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

export default RequestExaminations;


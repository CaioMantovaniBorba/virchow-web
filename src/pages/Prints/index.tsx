import * as React from "react";
import { useState, useContext } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Trash2 } from "lucide-react";
import { z } from "zod";
import { ToastContainer, toast } from 'react-toastify';
import { ptBR } from "date-fns/locale";
import {
  CaretSortIcon,
  Pencil2Icon
} from "@radix-ui/react-icons";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, lightFormat, subDays } from "date-fns"
import { CalendarIcon, PrinterIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import api from '@/services/api';
import { UserContext } from "@/contexts/user";
import { LaudoType } from "@/types/Laudo";
import { useNavigate } from "react-router-dom";

function Prints() {
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 500 });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({})
  const [data, setData] = useState<LaudoType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPrintRequest, setLoadingPrintRequest] = useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const { setLaudo } = useContext(UserContext);
  const navigate = useNavigate();

  const handlePrintLaudo = (laudo: LaudoType) => {
    setLoadingPrintRequest(true);
    api.get(`/Laudo/${laudo.id}/pdf`, { responseType: "blob" })
      .then(response => {
        setLoadingPrintRequest(false);
        const fileURL = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
        window.open(fileURL);
      })
      .catch(() => {
        setLoadingPrintRequest(false);
        toast.error("Não foi possível gerar a impressão!");
      })
  }

  const formatDate = (date: string) => {
    const dateFormatted = new Date(date);
    return date ? dateFormatted.toLocaleString().slice(0, 10) : null;
  }

  const columns: ColumnDef<LaudoType>[] = [
    {
      accessorKey: "nroLaudo",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Número do laudo
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("nroLaudo")}</div>
    },
    {
      accessorKey: "nomePaciente",
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
      cell: ({ row }) => <div className="text-left">{row.getValue("nomePaciente")}</div>
    },
    {
      accessorKey: "datNascimento",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Data de nascimento
            <CaretSortIcon className="h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{formatDate(row.getValue("datNascimento"))}</div>
    },
    {
      accessorKey: "exame",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Exame
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left">
          {row.original.exame?.nome}
        </div>
      )
    },
    {
      accessorKey: "datInclusao",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Data inclusão
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{formatDate(row.getValue("datInclusao"))}</div>
    },
    {
      accessorKey: "pedido",
      header: () => {
        return <Button variant="ghost">Imprimir</Button>
      },
      cell: ({ row }) =>
        <div className="cursor-pointer flex justify-center" onClick={() => handlePrintLaudo(row.original)}>
          {loadingPrintRequest ? <Loader2 className="animate-spin" /> : <PrinterIcon />}
        </div>
    },
    {
      accessorKey: "etiqueta",
      header: () => {
        return <Button variant="ghost">Alterar</Button>
      },
      cell: ({ row }) =>
        <div className="cursor-pointer flex justify-center" onClick={() => handleNavigate(row.original)}>
          <Pencil2Icon />
        </div>
    }
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

  const FormSchema = z.object({
    nroLaudo: z.string().optional(),
    nomePaciente: z.string().optional(),
    datNascimento: z.string().optional(),
    datInclusao: z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nomePaciente: "",
      datNascimento: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    const initial = date?.from ? new Date(date.from) : new Date();
    const final = date?.to ? new Date(date.to) : new Date();

    const laudoData = {
      nroLaudo: data.nroLaudo ? Number(data.nroLaudo) : null,
      nomePaciente: data.nomePaciente?.length > 0 ? data.nomePaciente.toUpperCase() : null,
      datNascimento: data.datNascimento.length > 0 ? data.datNascimento : null,
      datInclusaoInicial: date ? `${lightFormat(new Date(initial), 'yyyy-MM-dd')}T00:00:00.933Z` : null,
      datInclusaoFinal: date ? `${lightFormat(new Date(final), 'yyyy-MM-dd')}T23:59:00.933Z` : null,
    }

    api.post("/Laudo/filter", laudoData)
      .then((response) => {
        if (response.data === null) {
          toast.warn("Nenhum pedido foi encontrado!", {
            position: "top-right",
          });
          setLoading(false);
        }
        setData(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Erro ao localizar pedidos!", {
          position: "top-right",
        });
      }
      )
  }

  const handleNavigate = (laudo: LaudoType) => {
    setLaudo(laudo);
    navigate("/editarLaudo");
    localStorage.setItem("laudo", JSON.stringify(laudo));
  }

  return (
    <>
      <Header />
      <ToastContainer autoClose={2000} />

      <div className="flex flex-col justify-center w-[90%] space-y-8">
        <div className="flex items-center w-full h-[50px] rounded-sm bg-gray-200 border border-gray-300">
          <span className="ml-2 text-xl font-bold">IMPRESSÃO</span>
        </div>
        {/* Pesquisar requisição */}
        <div className="flex">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
              <FormField
                control={form.control}
                name="nroLaudo"
                render={({ field }) => (
                  <FormItem className='text-left'>
                    <FormLabel className='text-lg'>Número do laudo</FormLabel>
                    <FormControl>
                      <Input className="pl-2 w-1/5 uppercase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nomePaciente"
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

              <div className="flex space-x-4">
                <div className="w-1/5">
                  <FormField
                    control={form.control}
                    name="datNascimento"
                    render={({ field }) => (
                      <FormItem className='text-left'>
                        <FormLabel className='text-lg max-sm:text-sm'>Data Nascimento</FormLabel>
                        <FormControl>
                          <Input className="pl-2 w-full" type="date"  {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="w-2/5">
                  <div className="space-y-2">
                    <FormLabel htmlFor="date" className="block text-lg">Data Inclusão - Data Final</FormLabel>
                    <div className="flex items-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                              "w-[300px] justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon />
                            {date?.from ? (
                              date.to ? (
                                <>
                                  {format(date.from, "dd/MM/yyyy")} -{" "}
                                  {format(date.to, "dd/MM/yyyy")}
                                </>
                              ) : (
                                format(date.from, "dd/MM/yyyy")
                              )
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                            lang="pt"
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <Trash2
                        width={20}
                        className="ml-2 cursor-pointer hover:stroke-red-500"
                        onClick={() => setDate(undefined)
                        }
                      />
                    </div>
                  </div>
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

        {/* Listar laudos */}
        {data?.length >= 0 &&
          <div className="w-full mb-40">
            <Toaster />

            <div className="rounded-md border">
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
          </div>
        }
      </div>
    </>
  );
}

export default Prints;

import * as React from "react";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { ToastContainer, toast } from 'react-toastify';
import {
  CaretSortIcon,
  ChevronDownIcon,
  PlusCircledIcon,
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import api from '@/services/api';
import { UserContext } from "@/contexts/user";
import { PatientType } from "@/types/Patient";

function SearchPatient() {
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({})
  const [data, setData] = useState<PatientType[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setPatient } = useContext(UserContext);

  const formatDate = (date: string) => {
    const dateFormatted = new Date(date);
    return date ? dateFormatted.toLocaleString().slice(0, 10) : null;
  }

  const formatColumnName = (id: string) => {
    switch (id) {
      case "datNascimento":
        return "Data de Nascimento"
      default:
        return id;
    }
  }

  const handleNavigate = (patient: PatientType) => {
    setPatient(patient);
    navigate("/editarpaciente");
  }

  const columns: ColumnDef<PatientType>[] = [
    {
      accessorKey: "nome",
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
      cell: ({ row }) => <div className="text-left">{row.getValue("nome")}</div>
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
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{formatDate(row.getValue("datNascimento"))}</div>
    },
    {
      id: "edit",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            className="cursor-pointer"
            onClick={() => handleNavigate(row.original)}
          >
            <Pencil2Icon />
            <span className="font-normal">Editar paciente</span>
          </Button>
        )
      },
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
    name: z.string(),
    unidadeSaude: z.string(),
    datNascimento: z.string(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      unidadeSaude: "",
      datNascimento: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);

    const patientData = {
      nome: data.name.toUpperCase(),
      datNascimento: data.datNascimento.length > 0 ? data.datNascimento : null,
    }

    api.post("/Paciente/filter", patientData)
      .then((response) => {
        if (response.data === null) {
          toast.warn("Não existe paciente com os dados informados! Para cadastrá-lo, clique em INCLUIR PACIENTE", {
            position: "top-right",
          });
          setLoading(false);
        }
        setData(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Erro ao localizar paciente!", {
          position: "top-right",
        });
      }
      )
  }

  return (
    <>
      <Header />
      <ToastContainer autoClose={1500} />

      <div className="flex flex-col justify-center w-[90%] space-y-8">
        <div className="flex items-center w-full h-[50px] rounded-sm bg-gray-200 border border-gray-300">
          <span className="ml-2 text-xl font-bold">CADASTROS DE PACIENTES</span>
        </div>

        <Button className="flex w-[200px] bg-[#0C647C] hover:bg-[#0C647C]/80" onClick={() => navigate("/cadastrarpaciente")}>
          INCLUIR PACIENTE <PlusCircledIcon className="ml-2 h-8 w-8 " />
        </Button>

        {/* Pesquisar paciente */}
        <div className="flex">
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

                <div className="w-2/5">
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

        {/* Listar pacientes */}
        {data?.length > 0 &&
          <div className="w-full mb-40">
            <Toaster />

            <div className="flex items-center justify-between w-full py-4 space-x-4">
              <div className="flex w-4/5 space-x-4">
                <Input
                  placeholder="Filtrar pelo nome"
                  value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    table.getColumn("nome")?.setFilterValue(event.target.value)
                  }
                  className="max-w-md"
                />
                <Input
                  placeholder="Filtrar pela data de nascimento"
                  value={(table.getColumn("datNascimento")?.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    table.getColumn("datNascimento")?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm"
                />
              </div>

              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Colunas <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {formatColumnName(column.id)}
                          </DropdownMenuCheckboxItem>
                        )
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

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
                        Sem pacientes cadastrados.
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

export default SearchPatient;


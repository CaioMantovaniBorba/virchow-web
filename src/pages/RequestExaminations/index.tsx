import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

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
import { PatientType } from "@/types/Patient";
import api from "@/services/api";
import { Loader2 } from "lucide-react";
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
  const [suggestionDialog, setSuggestionDialog] = useState(false);
  const [hypothesis, setHypothesis] = useState("");
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [examinationsRequested, setExaminationsRequested] = useState<Examination[]>([]);
  const [textErrorHipothesis, setTextErrorHypothesis] = useState("");
  const [textErrorExamination, setTextErrorExamination] = useState("");
  const [loading, setLoading] = useState(false);
  const [dengue, setDengue] = useState(false);
  const [pregnant, setPregnant] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [age, setAge] = useState<Age>({ number: 0, type: "M" });

  const patientString = localStorage.getItem("patient");
  const patient: PatientType = patientString ? JSON.parse(patientString) : null;
  const userString = localStorage.getItem("user");
  const user: UserType = userString ? JSON.parse(userString) : null;

  // const paciente = {
  //   nome: "CAIO MANTOVANI BORBA",
  //   nome_social: "CAIO",
  //   flg_sexo: "M",
  //   datNascimento: "1997-03-20",
  //   profissao: "DÉBORA MANTOVANI",
  //   nro_cns: "584769251847536",
  //   municipio: {
  //     nome: "MARILANDIA",
  //     seq_municipio: "3135",
  //     seq_pais: "1"
  //   },
  //   unidadeSaude: {
  //     nome: "PENITENCIARIA ASSIS",
  //     seq_unidade_saude: "90",
  //     codigo: "4047230"
  //   }
  // }

  const date = new Date();
  const requestDate = date.toISOString();

  const navigate = useNavigate();

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

  const handleConfirm = () => {
    setOpenConfirmDialog(true)
  }

  const handleRequest = () => {
    setOpenConfirmDialog(false)

    if (hypothesis.length < 5) {
      return setTextErrorHypothesis("Preencha a hipótese diagnóstica.");
    }
    if (examinationsRequested.length === 0) {
      toast.error("Selecione um exame!");
      return setTextErrorExamination("Selecione um exame.");
    }
    setTextErrorHypothesis("");
    setTextErrorExamination("");
    setLoading(true);

    const data = {
      usuarioInclui: {
        nome: user.nome,
        seq_cliente: user.seq_cliente
      },
      hipotese_diagnostica: hypothesis,
      gestante: pregnant,
      dengue: dengue,
      paciente: {
        nro_idade: age.number,
        flg_tipo_idade: age.type,
        nome: patient.nome,
        sexo: patient.sexo,
        datNascimento: patient.datNascimento.slice(0, 10),
        profissao: patient.profissao,
      },
      exames: examinationsRequested
    }

    api.post("/pedido", data)
      .then(response => {
        toast.success("Pedido de exame criado com sucesso!");
        setTimeout(() => {
          api.get(`/pedido/${response.data}`, { responseType: "blob" })
            .then(response => {
              const fileURL = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
              window.open(fileURL);
              if (fileURL) {
                navigate("/incluirlaudo");
              }
            })
            .catch(() => {
              toast.error("Não foi possível gerar a impressão!");
            })
        }, 1000);
      })
      .catch(() => {
        toast.error("Não foi possível processar o pedido de exame!");
        setLoading(false);
      })
  }

  const updateExaminations = (examinationsRequested: Examination[]) => {
    const removeCodes = ["HB", "HT", "LEUCOC", "PLAQUE", "HEMOGR"];

    const filteredExaminations = examinationsRequested.filter(
      (examination: Examination) => !removeCodes.includes(examination.codigo)
    );

    const newExaminations = [
      { codigo: "HB", nome: "HEMOGLOBINA", seq_exame: "788" },
      { codigo: "HT", nome: "HEMATOCRITO", seq_exame: "822" },
      { codigo: "LEUCOC", nome: "LEUCOCITOS", seq_exame: "860" },
      { codigo: "PLAQUE", nome: "CONTAGEM DE PLAQUETAS", seq_exame: "947" },
    ];

    return [...filteredExaminations, ...newExaminations];
  }

  const handleSuggestionOfExaminations = () => {
    if (examinationsRequested.some((examination) =>
      examination.codigo === "HEMOGR"
    )) {
      setExaminationsRequested((prevArray) => {
        const filteredArray = prevArray.filter(
          (examination) => !examination.codigo.includes("HEMOGR")
        );
        return [
          ...filteredArray,
          { codigo: "HB", nome: "HEMOGLOBINA", seq_exame: "788" },
          { codigo: "HT", nome: "HEMATOCRITO", seq_exame: "822" },
          { codigo: "LEUCOC", nome: "LEUCOCITOS", seq_exame: "860" },
        ];
      });
    }

    if (examinationsRequested.some((examination) =>
      examination.codigo === "HB" ||
      examination.codigo === "HT" ||
      examination.codigo === "LEUCOC" ||
      examination.codigo === "PLAQUE")) {
      setExaminationsRequested(updateExaminations(examinationsRequested));
    }

    if (!examinationsRequested.some((examination) =>
      examination.codigo === "HB" ||
      examination.codigo === "HT" ||
      examination.codigo === "LEUCOC" ||
      examination.codigo === "PLAQUE"
    )) {
      setExaminationsRequested(prevArray => {
        return [
          ...prevArray,
          { codigo: "HB", nome: "HEMOGLOBINA", seq_exame: "788" },
          { codigo: "HT", nome: "HEMATOCRITO", seq_exame: "822" },
          { codigo: "LEUCOC", nome: "LEUCOCITOS", seq_exame: "860" },
          { codigo: "PLAQUE", nome: "CONTAGEM DE PLAQUETAS", seq_exame: "947" }
        ]
      });

      //Se o paciente TIVER dengue, NÃO DEVE ser possível selecionar HEMOGR
      const codeToExclude = ["HEMOGR"];
      setExaminations((prevArray) => {
        const filteredArray = prevArray.filter(
          (examination) => !codeToExclude.includes(examination.codigo)
        );
        return [
          ...filteredArray
        ];
      });

      setSuggestionDialog(false);
    }
    setSuggestionDialog(false);
  }

  const setOpenSuggestionDialog = () => {
    setDengue(true)
    setSuggestionDialog(true)

    //Se o paciente tiver dengue, NÃO DEVE ser possível selecionar HEMOGR
    setExaminations((prevArray) => {
      const filteredArray = prevArray.filter(examination => examination.codigo !== "HEMOGR");
      return filteredArray;
    });
  }

  const setCloseSuggestionDialog = () => {
    setDengue(false)
    //Se o paciente NÃO tiver dengue, DEVE ser possível selecionar HEMOGR
    setExaminations((prevArray) => {
      const hemogrExists = prevArray.some(examination => examination.codigo === "HEMOGR");
      if (!hemogrExists) {
        return [
          ...prevArray,
          { codigo: "HEMOGR", nome: "HEMOGRAMA", seq_exame: "808" }
        ];
      }
      return prevArray;
    });
  }

  return (
    <>
      <Header />
      <ToastContainer autoClose={2000} />

      <div className="flex flex-col justify-center w-[90%] space-y-8 mt-[68px]">
        <div className="flex items-center w-full h-[50px] rounded-sm bg-gray-200  border border-gray-300">
          <span className="ml-2 text-xl font-bold">INCLUIR LAUDO</span>
        </div>

        <div className="flex flex-col rounded-sm border border-gray-300">
          <div className="flex items-center w-full h-[40px] bg-gray-200 border-b border-b-gray-300">
            <span className="ml-2 text-sm text-gray-600">* Campos obrigatórios</span>
          </div>

          {/* Unidade de Saúde; Munícipio; Código Unidade de Saúde */}
          <div className="flex w-full p-2 space-x-2">
            <div className="w-2/5">
            </div>

            <div className="w-2/5">
              <label htmlFor="municipality" className="block text-sm font-medium leading-6">
                Munícipio
              </label>
              <input
                id="municipality"
                name="municipality"
                type="text"
                value={patient.unidadeSaude.municipio.nome}
                disabled
                autoComplete="address-level1"
                className="block p-2 w-full rounded-sm border-0 py-1.5 text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="w-1/5">
            </div>
          </div>

          {/* Nome Paciente; Nome Social; Idade */}
          <div className="flex w-full p-2 space-x-2">
            <div className="w-2/5">
              <label htmlFor="name" className="block text-sm font-medium leading-6">
                Nome Paciente
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={patient.nome}
                disabled
                className="block p-2 w-full rounded-sm border-0 py-1.5 text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="w-2/5">
              <label htmlFor="socialname" className="block text-sm font-medium leading-6">
                Nome Social
              </label>
              <input
                id="socialname"
                name="socialname"
                type="text"
                value={patient.nome_social}
                disabled
                autoComplete="additional-name"
                className="block p-2 w-full rounded-sm border-0 py-1.5 text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="w-1/5">
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
          </div>

          {/* Data Nascimento; Sexo; Gestante; Dengue */}
          <div className="flex w-full p-2 space-x-2">
            <div className="w-3/12">
              <label htmlFor="bday" className="block text-sm font-medium leading-6">
                Data Nascimento
              </label>
              <input
                id="bday"
                name="bday"
                type="date"
                value={patient.datNascimento.slice(0, 10)}
                disabled
                className="block p-2 w-full rounded-sm border-0 py-1.5 text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="w-2/12">
              <label htmlFor="gender" className="block text-sm font-medium leading-6">
                Sexo
              </label>
              <input
                id="gender"
                name="gender"
                type="text"
                value={patient.sexo === "M" ? "Masculino" : "Feminino"}
                disabled
                className="block p-2 w-full rounded-sm border-0 py-1.5 text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
              />
            </div>

            {patient.sexo === "F" &&
              <div className="w-2/12 space-y-2">
                <label htmlFor="pregnant" className="block text-sm text-center font-medium leading-6">
                  Gestante?
                </label>
                <input
                  id="pregnant"
                  name="pregnant"
                  type="checkbox"
                  className="block p-2 w-full rounded-sm border-0 py-1.5 text-gray-600 shadow-sm"
                  onChange={() => setPregnant(!pregnant)}
                />
              </div>
            }

            <div className="w-2/12 space-y-2">
              <label htmlFor="dengue" className="block text-sm text-center font-medium leading-6">
                Dengue?
              </label>
              <input
                id="dengue"
                name="dengue"
                type="checkbox"
                className="block p-2 w-full rounded-sm border-0 py-1.5 text-gray-600 shadow-sm"
                onChange={() => !dengue ? setOpenSuggestionDialog() : setCloseSuggestionDialog()}
                checked={dengue}
              />
            </div>
          </div>

          {/* Nome Mãe; Data Requisição */}
          <div className="flex w-full p-2 space-x-2">
            <div className="w-2/5">
              <label htmlFor="mothersname" className="block text-sm font-medium leading-6">
                Nome Mãe
              </label>
              <input
                id="mothersname"
                name="mothersname"
                type="text"
                value={patient.profissao}
                disabled
                className="block p-2 w-full rounded-sm border-0 py-1.5 text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
              />
            </div>

            <div className="w-2/5">
              <label htmlFor="requestdate" className="block text-sm font-medium leading-6">
                Data Requisição
              </label>
              <input
                id="requestdate"
                name="requestdate"
                type="date"
                value={requestDate.slice(0, 10)}
                disabled
                className="block p-2 w-full rounded-sm border-0 py-1.5 text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="w-full p-2">
            <label htmlFor="diagnostic" className="block text-sm font-medium leading-6">
              Hipótese Diagnóstica *
            </label>
            <textarea
              id="diagnostic"
              name="diagnostic"
              maxLength={200}
              className={`resize-none block p-2 w-full rounded-sm py-1.5 text-gray-600 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6
                ${(textErrorHipothesis.length > 0 && hypothesis.length < 5) && 'border-red-500 border-2'}
                `}
              onChange={(e) => setHypothesis(e.target.value)}
            />
            {(textErrorHipothesis.length > 0 && hypothesis.length < 5) && <span className="text-sm text-red-500">{textErrorHipothesis}</span>}
          </div>

          <div className="flex justify-end w-full">
            <Button className="w-[200px] m-2" onClick={() => setOpenDialog(true)}>Cancelar</Button>
            {loading ?
              <Button className="w-[200px] m-2" disabled>
                <Loader2 className="animate-spin" /> Aguarde
              </Button> :
              <Button
                type="submit"
                className="w-[200px] bg-[#0C647C] hover:bg-[#0C647C]/80 m-2"
                onClick={() => handleConfirm()}>
                Salvar
              </Button>
            }
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
          <span className="py-4">Tem certeza que deseja cancelar o pedido de exame?</span>
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
          <span className="py-4">Deseja salvar o pedido de exames?</span>
          <DialogFooter>
            <DialogClose>
              <Button className="w-[100px]">Não</Button>
            </DialogClose>
            <Button className="w-[100px] bg-[#0C647C] hover:bg-[#0C647C]/80" onClick={() => handleRequest()}>Sim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={suggestionDialog} onOpenChange={setSuggestionDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sugestão de exames</DialogTitle>
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>
          <span className="py-4">Deseja incluir os exames <br /><b>HB, HT, LEUCOC e PLAQUE?</b></span>
          <DialogFooter>
            <DialogClose>
              <Button className="w-[100px]">Não</Button>
            </DialogClose>
            <Button className="w-[100px] bg-[#0C647C] hover:bg-[#0C647C]/80" onClick={() => handleSuggestionOfExaminations()}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RequestExaminations;


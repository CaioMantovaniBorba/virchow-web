export type PatientType = {
    id: number,
    nome: string,
    sexo: string,
    datNascimento: string,
    estadoCivil: {
      id: number,
      descricao: string
    },
    profissao: string,
    procedencia: string
}


export type LaudoType = {
  id: number,
  nomePaciente: string,
  idade: string,
  estadoCivil: string,
  sexo: string,
  datNascimento: string,
  procedencia: string,
  profissao: string,
  resumoClinico: string,
  datUltimaMenstruacao: string,
  medicoRequisitante: string,
  datExame: string,
  exame: {
		id: number,
		nome: string,
		descricao: string,
		topicosList: []
	},
  desLaudo: string,
  tipoLaudoId: number
}
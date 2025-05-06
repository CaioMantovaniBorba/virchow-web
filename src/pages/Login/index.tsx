import { useContext, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNavigate } from "react-router-dom";
import { PersonIcon, LockClosedIcon } from '@radix-ui/react-icons';
import { ToastContainer, toast } from 'react-toastify';
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UserContext } from "@/contexts/user";

import api from "@/services/api";

const FormSchema = z.object({
  login: z.string().min(4, {
    message: "Insira seu usuário.",
  }),
  senha: z.string().min(4, {
    message: "Insira sua senha.",
  }),
});

function Login() {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  // useEffect(() => {
  //   const signed = localStorage.getItem("token");
  //   if (signed) {
  //     navigate("incluirlaudo");
  //   }
  // }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      login: "",
      senha: ""
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true);
    api.post("/Auth/login", data)
      .then(response => {
        setUser(response.data);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
        navigate("/cadastropaciente");
        setLoading(false);
      })
      .catch(() => {
        toast.error("Erro ao realizar login!", {
          position: "top-right",
        });
        setLoading(false);
      }
      )
  }

  return (
    <div className="flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat min-w-full min-h-screen">
      <ToastContainer autoClose={2000} />
      <h1 className="text-3xl text-center font-extrabold w-[500px] text-[#1f4576] -m-8">VIRCHOW</h1>
      <div className="relative flex flex-col items-center justify-center mt-20 rounded-2xl shadow-xl bg-gray-100/70 w-[400px] h-[480px]">
        <div className="absolute top-4 left-4 flex justify-end w-full">
          {/* <img src={Logo} alt="" className="h-[40px] pr-8" /> */}
        </div>
        <span className="text-[#1f4576] text-4xl mb-8">Identificação</span>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-[300px] space-y-6">
            <FormField
              control={form.control}
              name="login"
              render={({ field }) => (
                <FormItem className='text-left'>
                  <FormLabel className='text-lg text-[#1f4576]'>Usuário</FormLabel>
                  <div className="relative rounded-2xl">
                    <FormControl>
                      <Input className="pl-10 rounded-2xl bg-gray-100"  {...field} />
                    </FormControl>
                    <div className="absolute left-1 top-[4px] p-[6px] bg-[#1f4576] rounded-full">
                      <PersonIcon color="#fff" />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem className='text-left'>
                  <FormLabel className='text-lg text-[#1f4576]'>Senha</FormLabel>
                  <div className="relative rounded-2xl">
                    <FormControl>
                      <Input className="pl-10 rounded-2xl bg-gray-100" type="password"  {...field} />
                    </FormControl>
                    <div className="absolute left-1 top-[4px] p-[6px] bg-[#1f4576] rounded-full">
                      <LockClosedIcon color="#fff" />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center w-full">
              {loading ?
                <Button className="w-[90%] h-[40px] mt-8 rounded-2xl" disabled>
                  <Loader2 className="animate-spin" /> AGUARDE
                </Button> :
                <Button type="submit" className='w-[90%] h-[40px] mt-8 rounded-2xl bg-[#1f4576] hover:bg-[#1f4576]/90'>ENTRAR</Button>
              }
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Login;

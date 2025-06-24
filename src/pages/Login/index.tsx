import { useContext, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNavigate } from "react-router-dom";
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

import Front from "@/assets/front.png";
import Behind from "@/assets/behind.png";
import Virchow from "@/assets/virchow.png";

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

  useEffect(() => {
    const signed = localStorage.getItem("token");
    if (signed) {
      navigate("/impressoes");
    }
  }, []);

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
        navigate("/impressoes");
      })
      .catch(() => {
        toast.error("Erro ao realizar login!", {
          position: "top-right",
        });
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="flex min-w-full min-h-screen">
      <ToastContainer autoClose={2000} />

      <div className="relative flex items-center justify-center w-2/3 bg-[#0F6278CC]">
        <img
          src={Behind}
          alt=""
          className="absolute h-full w-1/2 object-contain z-0"
        />
        <img
          src={Front}
          alt=""
          className="relative h-[500px] w-[300px] object-cover z-10 rounded-full"
        />
      </div>


      <div className="flex flex-col items-center justify-center w-1/3">
        {/* <h1 className="text-5xl text-center font-extrabold w-[500px] text-[#0C647C] mb-4">VIRCHOW</h1> */}
        <img
          src={Virchow}
          alt=""
          className="w-[60%] object-contain mb-4"
        />
        <span className="text-lg text-center font-semibold w-[500px] text-gray-500">Laboratório de Patologia</span>

        <div className="relative flex flex-col items-center justify-center rounded-2xl w-[400px] h-[480px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-[300px] space-y-6">
              <FormField
                control={form.control}
                name="login"
                render={({ field }) => (
                  <FormItem className='text-left'>
                    <FormLabel className='text-lg text-gray-500'>Login</FormLabel>
                    <FormControl>
                      <Input className="pl-4 rounded-xl bg-gray-100"  {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem className='text-left'>
                    <FormLabel className='text-lg text-gray-500'>Senha</FormLabel>
                    <FormControl>
                      <Input className="pl-4 rounded-xl bg-gray-100" type="password"  {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center w-full">
                {loading ?
                  <Button className="w-[90%] h-[40px] mt-8 rounded-2xl" disabled>
                    <Loader2 className="animate-spin" /> AGUARDE
                  </Button> :
                  <Button type="submit" className='w-[90%] h-[40px] mt-8 rounded-xl bg-[#0C647C] hover:bg-[#0C647C]/90'>Acessar</Button>
                }
              </div>
            </form>
          </Form>
        </div>

        <span className="text-sm text-center font-semibold text-gray-400">Desenvolvido por Caio e João</span>
      </div>
    </div>
  )
}

export default Login;

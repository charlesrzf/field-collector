"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FormsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>();

  const forms = [
    {
      title: "Location",
      id: "location",
    },
    {
      title: "Litho",
      id: "litho",
    },
    {
      title: "Sampling",
      id: "sampling",
    },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(JSON.parse(storedUser ?? "[]"));
  }, []);

  useEffect(() => {
    const syncDataOnReconnect = async () => {
      const unsyncedData = JSON.parse(
        localStorage.getItem("unsyncedFormData") ?? "[]"
      );

      if (unsyncedData.length > 0) {
        for (let i = 0; i < unsyncedData.length; i++) {
          const { id, formId, data } = unsyncedData[i];

          try {
            formId
              ? await api.put(`${id}/${formId}/`, data)
              : await api.post(`${id}/`, data);

            unsyncedData.splice(i, 1);
            i--;
            toast.success(`Dados do formulário ${id} enviados com sucesso.`);
          } catch (error: any) {
            console.error(
              `Erro ao tentar enviar dados para ${id}: ${error.message}`
            );
          }
        }

        localStorage.setItem("unsyncedFormData", JSON.stringify(unsyncedData));
      }
    };

    window.addEventListener("online", syncDataOnReconnect);

    return () => {
      window.removeEventListener("online", syncDataOnReconnect);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleExport = async () => {
    try {
      const response = await api.get("arquivos/gerarcsv/", {
        headers: {
          Accept: "application/zip",
        },
        responseType: "arraybuffer",
      });

      const blob = new Blob([response], { type: "application/zip" });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "arquivos.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar o arquivo:", error);
    }
  };

  return (
    <>
      <ToastContainer />

      <div className="flex items-center p-4 gap-5 mb-1 bg-primary">
        <Image src="/images/iubi.png" alt="license" width={80} height={80} />
        {user?.nome && (
          <div className="flex items-center justify-between w-full">
            <div>
              <Label className="text-sm font-bold text-primary-foreground">
                Bem vindo,
              </Label>
              <p className="text-xl text-primary-foreground font-bold uppercase">
                {user?.nome}
              </p>
            </div>
            <button onClick={() => logout()}>
              <Image
                src="/images/logout.png"
                alt="license"
                width={30}
                height={30}
              />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col p-4 gap-3">
        {forms?.map((form) => (
          <Button
            key={form.id}
            size="lg"
            className="w-full uppercase"
            variant="secondary"
          >
            <Link className="w-full" href={`/forms/${form.id}`}>
              {form.title}
            </Link>
          </Button>
        ))}

        <Button
          size="lg"
          className="w-full uppercase mt-5"
          onClick={() => handleExport()}
        >
          Exportar
        </Button>
      </div>
    </>
  );
}

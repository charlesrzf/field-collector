"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function FormsPage() {
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
    const syncDataOnReconnect = async () => {
      const unsyncedData = JSON.parse(
        localStorage.getItem("unsyncedFormData") ?? "[]"
      );

      if (unsyncedData.length > 0) {

        for (let i = 0; i < unsyncedData.length; i++) {
          const { id: formId, data } = unsyncedData[i];
          const url = `https://bbx.ge21gt.cloud/bbx/${formId}/`;

          try {
            const response = await fetch(url, {
              method: "POST",
              body: JSON.stringify(data),
              headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
              unsyncedData.splice(i, 1);
              i--;
              toast.success(
                `Dados do formulário ${formId} enviados com sucesso.`
              );
            } else {
              console.error(
                `Erro ao enviar dados para ${formId}: ${response.statusText}`
              );
            }
          } catch (error: any) {
            console.error(
              `Erro ao tentar enviar dados para ${formId}: ${error.message}`
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

  return (
    <>
      <ToastContainer />

      <div className="flex items-center p-4 gap-5 mb-5 bg-primary">
        <Image src="/images/iubi.png" alt="license" width={80} height={80} />
        <Label className="text-xl font-bold text-primary-foreground">
          INSERIR DADOS
        </Label>
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
      </div>
    </>
  );
}

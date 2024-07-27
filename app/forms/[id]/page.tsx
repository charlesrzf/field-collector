"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

interface SelectOptions {
  [key: string]: Array<{ label: string; value: string }>;
}

interface OriginalArray {
  [key: string]: any[];
}

interface FormInput {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
}

const FormPage = () => {
  const { id } = useParams();

  const { register, handleSubmit, reset } = useForm();
  const [options, setOptions] = useState<SelectOptions>({});
  const [originalArrays, setOriginalArrays] = useState<OriginalArray>({});
  const [form, setForm] = useState<FormInput[]>([]);

  useEffect(() => {
    const formType = id;
    setForm(getFormById(formType as string));
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      const savedData = localStorage.getItem("formSelectData");

      let savedOptions = {};
      let savedOriginalArrays = {};

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);

          if (parsedData[id.toString()]) {
            savedOptions = parsedData[id.toString()]?.options || {};
            savedOriginalArrays =
              parsedData[id.toString()]?.originalArrays || {};
          }
        } catch (error) {
          console.error("Erro ao parsear dados do localStorage:", error);
        }
      }

      if (navigator.onLine) {
        try {
          const promises = form
            .filter((input) => input.type === "select")
            .map((input) => fetchSelectOptions(input.name));

          const results = await Promise.all(promises);
          const newOptions = results.reduce((acc, result, index) => {
            const inputName = form.filter((input) => input.type === "select")[
              index
            ].name;
            acc[inputName] = result.transformedArray;
            return acc;
          }, {} as SelectOptions);
          setOptions(newOptions);

          const newOriginalArrays = results.reduce((acc, result, index) => {
            const inputName = form.filter((input) => input.type === "select")[
              index
            ].name;
            acc[inputName] = result.originalArray;
            return acc;
          }, {} as OriginalArray);
          setOriginalArrays(newOriginalArrays);

          const existingData =
            JSON.parse(localStorage.getItem("formSelectData") ?? "{}") || {};

          existingData[id.toString()] = {
            options: newOptions,
            originalArrays: newOriginalArrays,
          };

          localStorage.setItem("formSelectData", JSON.stringify(existingData));
        } catch (error) {
          console.error("Erro ao buscar dados da API:", error);
        }
      } else {
        if (
          savedOptions &&
          Object.keys(savedOptions).length > 0 &&
          savedOriginalArrays &&
          Object.keys(savedOriginalArrays).length > 0
        ) {
          setOptions(savedOptions);
          setOriginalArrays(savedOriginalArrays);
        } else {
          console.warn(
            "Nenhum dado encontrado no localStorage para o formulário atual."
          );
        }
      }
    };

    fetchData();
  }, [form, id]);

  const getFormBody = (data: any) => {
    switch (id) {
      case "location": {
        return {
          holeid: Text(data.holeid),
          prospect: originalArrays.prospect.find(
            (element) => element.id == data.prospect
          ),
          tenement: originalArrays.tenement.find(
            (element) => element.id == data.tenement
          ),
          datum: originalArrays.datum.find(
            (element) => element.id == data.datum
          ),
          surveycoordinate: originalArrays.surveyCoordinate.find(
            (element) => element.id == data.surveyCoordinate
          ),
          easting: Number(data.easting),
          northing: Number(data.northing),
          rl: Number(data.rl),
          depth: Number(data.depth),
          startdate: dayjs(data.startdate).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
          enddate: dayjs(data.enddate).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
          comments: data.comments,
        };
      }
      case "litho": {
        return {
          lithoid: Number(data.lithoid),
          holeid: originalArrays.prospect.find(
            (element) => element.id == data.holeid
          ),
          fromdepth: Number(data.fromdepth),
          todepth: Number(data.todepth),
          regolith: originalArrays.regolith.find(
            (element) => element.id == data.regolith
          ),
          lithocode: originalArrays.lithocode.find(
            (element) => element.id == data.lithocode
          ),
          geodescription: data.geodescription,
        };
      }
      case "sampling": {
        return {
          holeid: originalArrays.prospect.find(
            (element) => element.id == data.holeid
          ),
          sampleid: Number(data.sampleid),
          checkid: Number(data.checkid),
          fromdepth: Number(data.fromdepth),
          todepth: Number(data.todepth),
          sampletype: originalArrays.sampletype.find(
            (element) => element.id == data.sampletype
          ),
          category: originalArrays.category.find(
            (element) => element.id == data.category
          ),
          weightkg: Number(data.weightkg),
          comments: data.comments,
        };
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const dataSend = getFormBody(data);
      const url = `https://bbx.ge21gt.cloud/bbx/${id}/`;

      if (navigator.onLine) {
        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify(dataSend),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const responseJson = await response.json();
        toast.success(responseJson.mensagem);
        reset();
      } else {
        const existingUnsyncedData =
          JSON.parse(localStorage.getItem("unsyncedFormData") ?? "[]") || [];

        existingUnsyncedData.push({
          id,
          data: dataSend,
        });

        localStorage.setItem(
          "unsyncedFormData",
          JSON.stringify(existingUnsyncedData)
        );

        toast.info(
          "Você está offline. Os dados serão enviados assim que a conexão for restabelecida."
        );
        reset();
      }
    } catch (error: any) {
      toast.error(`Erro ao enviar dados: ${error.message}`);
    }
  };

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

  const fetchSelectOptions = async (name: string) => {
    try {
      const url = `https://bbx.ge21gt.cloud/bbx/${name.toLowerCase()}/`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      const array =
        json[`lista${name.charAt(0).toUpperCase() + name.slice(1)}`];

      const transformedArray = array.map((item: any) => ({
        label:
          item.name ||
          item.tenement ||
          item.description ||
          item.surveycoordinate ||
          item.datum,
        value: item.id,
      }));

      return { transformedArray, originalArray: array };
    } catch (error: any) {
      console.error(error.message);
    }

    return { transformedArray: [], originalArray: [] };
  };

  const getFormById = (id: string) => {
    switch (id) {
      case "location":
        return require("@/data/formLocation.json");
      case "litho":
        return require("@/data/formLitho.json");
      case "sampling":
        return require("@/data/formSampling.json");
      default:
        return [];
    }
  };

  return (
    <>
      <ToastContainer />

      <div className="flex items-center p-4 gap-5 mb-5 bg-primary">
        <Link href="/forms">
          <Image
            src="/images/arrow-back.svg"
            alt="back"
            width={25}
            height={25}
            className="filter invert sepia saturate-0 hue-rotate-0 brightness-200 contrast-100"
          />
        </Link>
        <div>
          <Label className="text-sm font-bold text-primary-foreground">
            PREENCHER FORMULÁRIO
          </Label>
          <p className="text-xl text-primary-foreground font-bold uppercase">
            {id}
          </p>
        </div>
      </div>

      <form
        className="flex flex-col p-4 gap-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        {form?.map((input) => (
          <div className="grid gap-2" key={input.name}>
            <Label htmlFor={input?.name}>
              {input?.label} {input?.required && "*"}
            </Label>
            {input?.type === "select" ? (
              <Select
                options={options[input.name] || []}
                {...register(input.name)}
              />
            ) : (
              <Input
                {...register(input.name)}
                id={input?.name}
                type={input?.type}
                placeholder={input?.placeholder}
                required={input?.required}
                inputMode={input?.type === "number" ? "numeric" : "text"}
                style={{ minWidth: "calc(100% - 1rem)" }}
              />
            )}
          </div>
        ))}

        <Button size="lg" className="w-full uppercase" type="submit">
          Enviar
        </Button>
      </form>
    </>
  );
};

export default FormPage;

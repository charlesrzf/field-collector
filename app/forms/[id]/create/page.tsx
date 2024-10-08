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
import api from "@/services/api";

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

const FormPageCreate = () => {
  const { id } = useParams();

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const category = watch("category");
  const [options, setOptions] = useState<SelectOptions>({});
  const [originalArrays, setOriginalArrays] = useState<OriginalArray>({});
  const [form, setForm] = useState<FormInput[]>([]);

  const teamOptions = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
  ];

  const statusOptions = [
    { label: "Concluded", value: "concluded" },
    { label: "In Progress", value: "in_progress" },
    { label: "Programmed", value: "programmed" },
  ];

  useEffect(() => {
    const formType = id;
    setForm(getFormById(formType as string));
  }, [id]);

  useEffect(() => {
    if (!form) return;
    setValue("diameter", 3);
    if (options) {
      setValue("surveyCoordinate", "2");
    }
  }, [form, options]);

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
          proposedid: data.proposedid,
          holeid: data.holeid,
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
          geologist: originalArrays.geologist.find(
            (element) => element.id == data.geologist
          ),
          easting: Number(data.easting),
          northing: Number(data.northing),
          rl: Number(data.rl),
          diameter: Number(data.diameter),
          depth: Number(data.depth),
          waterTable: data.waterTable,
          team: data.team,
          status: data.status,
          startdate: dayjs(data.startdate).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
          enddate: dayjs(data.enddate).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
          comments: data.comments,
        };
      }
      case "litho": {
        return {
          fromdepth: Number(data.fromdepth),
          todepth: Number(data.todepth),
          regolith: originalArrays.regolith.find(
            (element) => element.id == data.regolith
          ),
          lithocode: originalArrays.lithocode.find(
            (element) => element.id == data.lithocode
          ),
          geodescription: data.geodescription,
          location: originalArrays.location.find(
            (element) => element.id == data.location
          ),
        };
      }
      case "sampling": {
        return {
          sampleid: data.sampleid,
          batch: data.batch,
          checkid: Number(data.checkid),
          fromdepth: Number(data.fromdepth),
          todepth: Number(data.todepth),
          sampletype: originalArrays.sampletype.find(
            (element) => element.id == data.sampletype
          ),
          category: originalArrays.category.find(
            (element) => element.id == data.category
          ),
          duplicatereference: data.duplicatereference,
          weightkg: Number(data.weightkg),
          seal: data.seal,
          comments: data.comments,
          location: originalArrays.location.find(
            (element) => element.id == data.location
          ),
        };
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const dataSend = getFormBody(data);

      if (navigator.onLine) {
        const response = await api.post(`${id}/`, dataSend);
        toast.success(response.mensagem);
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
          const { id, formId, data } = unsyncedData[i];

          try {
            formId
              ? await api.put(`${id}/${formId}/`, data)
              : await api.put(`${id}/`, data);

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

  const fetchSelectOptions = async (name: string) => {
    try {
      const response = await api.get(`${name.toLowerCase()}/`);
      const array =
        response[`lista${name.charAt(0).toUpperCase() + name.slice(1)}`];

      const transformedArray = array.map((item: any) => {
        const properties = [
          item.holeid,
          item.name,
          item.tenement,
          item.code,
          item.description,
          item.surveycoordinate,
          item.datum,
        ];

        const label = properties.find((prop) => typeof prop === "string") ?? "";

        return { label, value: item.id };
      });

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

      <div className="flex items-center p-4 gap-5 mb-1 bg-primary">
        <Link href={`/forms/${id}`}>
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
                options={[
                  { value: "", label: "Selecione..." },
                  ...(input.name === "status"
                    ? statusOptions
                    : input.name === "team"
                    ? teamOptions
                    : options[input.name] || []),
                ]}
                {...register(input.name)}
              />
            ) : (
              <Input
                {...register(input.name)}
                id={input?.name}
                type={input?.type}
                step="0.01"
                placeholder={input?.placeholder}
                required={
                  input?.required ||
                  (input.name === "duplicatereference" && category == 10)
                }
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

export default FormPageCreate;

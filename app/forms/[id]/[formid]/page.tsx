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

const FormPageUpdate = () => {
  const { id, formid } = useParams();

  const { register, handleSubmit, setValue } = useForm();
  const [options, setOptions] = useState<SelectOptions>({});
  const [originalArrays, setOriginalArrays] = useState<OriginalArray>({});
  const [form, setForm] = useState<FormInput[]>([]);
  const [formId, setFormId] = useState<number>();

  const fetchForm = async (formid: string) => {
    try {
      const url = `https://bbx.ge21gt.cloud/bbx/${id}/pesquisar/${formid}/`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      const list =
        json[
          `lista${
            id.toString().charAt(0).toUpperCase() + id.toString().slice(1)
          }`
        ][0];

      Object.entries(list).forEach(([key, value]) => {
        if (key === "startdate" || key === "enddate") {
          setValue(key, dayjs(value as string).format("YYYY-MM-DD"));
        } else if (typeof value === "object" && value !== null) {
          if (key === "surveycoordinate") {
            if ('id' in value) {
              setValue("surveyCoordinate", value.id);
            }
          } else {
            if ('id' in value) {
              setValue(key, value.id);
            }
          }
        } else {
          setValue(key, value);
        }
      });

      setFormId(list?.id);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (formid) fetchForm(formid.toString());
  }, [formid]);

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
          id: formId,
          proposedid: Number(data.proposedid),
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
          watertable: data.diameter,
          team: data.team,
          status: data.status,
          startdate: dayjs(data.startdate).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
          enddate: dayjs(data.enddate).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
          comments: data.comments,
        };
      }
      case "litho": {
        return {
          id: formId,
          lithoid: Number(data.lithoid),
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
          id: formId,
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
      const url = `https://bbx.ge21gt.cloud/bbx/${id}/${formId}`;

      if (navigator.onLine) {
        const response = await fetch(url, {
          method: "PUT",
          body: JSON.stringify(dataSend),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        toast.success("Atualizado com sucesso!");
      } else {
        const existingUnsyncedData =
          JSON.parse(localStorage.getItem("unsyncedFormData") ?? "[]") || [];

        existingUnsyncedData.push({
          id,
          formId,
          data: dataSend,
        });

        localStorage.setItem(
          "unsyncedFormData",
          JSON.stringify(existingUnsyncedData)
        );

        toast.info(
          "Você está offline. Os dados serão enviados assim que a conexão for restabelecida."
        );
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
          let url = "";

          if (formId) {
            url = `https://bbx.ge21gt.cloud/bbx/${id}/${formId}`;
          } else {
            url = `https://bbx.ge21gt.cloud/bbx/${id}/`;
          }

          try {
            const response = await fetch(url, {
              method: formId ? "PUT" : "POST",
              body: JSON.stringify(data),
              headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
              unsyncedData.splice(i, 1);
              i--;
              toast.success(`Dados do formulário ${id} enviados com sucesso.`);
            } else {
              console.error(
                `Erro ao enviar dados para ${id}: ${response.statusText}`
              );
            }
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
      const url = `https://bbx.ge21gt.cloud/bbx/${name.toLowerCase()}/`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      const array =
        json[`lista${name.charAt(0).toUpperCase() + name.slice(1)}`];

      const transformedArray = array.map((item: any) => {
        const properties = [
          item.holeid,
          item.name,
          item.tenement,
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
            ATUALIZAR FORMULÁRIO
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
          Atualizar
        </Button>
      </form>
    </>
  );
};

export default FormPageUpdate;

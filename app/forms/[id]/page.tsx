"use client";

import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const FormPage = () => {
  const { id } = useParams();
  const [data, setData] = useState<any[]>([]);

  const fetchList = async (name: string) => {
    try {
      const url = `https://bbx.ge21gt.cloud/bbx/${name.toLowerCase()}/`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      const list = json[`lista${name.charAt(0).toUpperCase() + name.slice(1)}`];
      setData(list);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (id) fetchList(id.toString());
  }, [id]);

  return (
    <>
      <div className="flex justify-between items-center bg-primary p-4">
        <div className="flex items-center gap-5">
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
              LISTAGEM
            </Label>
            <p className="text-xl text-primary-foreground font-bold uppercase">
              {id}
            </p>
          </div>
        </div>

        <Button>
          <Link className="w-full" href={`/forms/${id}/create`}>
            CRIAR
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 m-5">
        {data?.map((item, key) => (
          <Button
            key={item.id}
            size="lg"
            className="w-full uppercase"
            variant="secondary"
          >
            <Link
              className="w-full"
              href={`/forms/${id}/${
                item.holeid || item.lithoid || item.sampleid
              }`}
            >
              {item.holeid || item.lithoid || item.sampleid}
            </Link>
          </Button>
        ))}
      </div>
    </>
  );
};

export default FormPage;

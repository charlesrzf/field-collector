import Image from "next/image";

export function License() {
  return (
    <div className="flex flex-row pt-2 justify-end items-center w-full max-w-sm gap-2">
      <span>Licensed to </span>
      <Image src="/images/bbx-logo.png" alt="license" width={60} height={60} />
    </div>
  );
}

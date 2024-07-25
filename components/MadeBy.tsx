import Image from "next/image";

export function MadeBy() {
  return (
    <div className="flex flex-row pt-2 justify-end items-center w-full max-w-sm">
      <span className="pr-1 text-sm">Made by </span>
      <Image src="/images/ge21gt.png" alt="license" width={60} height={60} />
    </div>
  );
}

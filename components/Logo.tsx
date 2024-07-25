import Image from "next/image";

export function Logo() {
  return (
    <div className="p-5">
      <Image src="/images/iubi.png" alt="license" width={100} height={100} />
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <h1>404 Not Found</h1>
      <Link href="/">Return to home</Link>
    </main>
  );
}
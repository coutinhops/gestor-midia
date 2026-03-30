'use client';
import { useRouter } from 'next/navigation';
// Redirect to login / dashboard depending on auth status
export default function Home() {
  const router = useRouter();
  router.push('/login');
  return null;
}

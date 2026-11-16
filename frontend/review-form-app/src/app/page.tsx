import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/review/service-provider/enter-token');
}
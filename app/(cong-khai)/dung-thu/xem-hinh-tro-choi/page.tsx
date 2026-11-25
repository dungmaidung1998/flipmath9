import { notFound } from 'next/navigation';
import XemHinhClient from './XemHinhClient';

export default function XemHinhTroChoiPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <XemHinhClient />;
}

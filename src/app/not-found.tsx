import Link from "next/link";
import { Notice } from "@/components/ui";

export default function NotFound() {
  return (
    <Notice title="این صفحه در برنامه نیست">
      <p>نشانی را بررسی کن یا به برنامه‌ی امروز برگرد.</p>
      <Link prefetch={false} className="button" href="/">
        برنامه امروز
      </Link>
    </Notice>
  );
}

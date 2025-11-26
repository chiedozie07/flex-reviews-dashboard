import Link from "next/link";
import { ListChecks, ClipboardList, ListTodo } from "lucide-react";


export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-gray-50">
      <div className="max-w-3xl text-center">

        {/* title */}
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
          Flex Living Reviews Dashboard Assessment
        </h2>

        {/* subtitle */}
        <p className="mt-6 text-lg text-gray-600">
          Welcome Guest! This project showcases a full reviews management
          workflow including review normalization, manager approval, property
          review UI, and API integrations built with Next.js, TypeScript, and Tailwind CSS.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-black text-white rounded-lg text-lg font-medium hover:bg-gray-900 transition"
          >
            Go to Dashboard
          </Link>

          <a
            href="https://github.com/chiedozie07/flex-reviews-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-100 transition"
          >
            View Repository
          </a>
        </div>

        {/* information box */}
        <div className="mt-14 bg-white shadow-md rounded-xl p-8 text-left border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-black" />
            Project Features
          </h2>

          <ul className="space-y-2 text-gray-700 leading-relaxed">
            <li>• Hostaway Reviews API integration with field normalization</li>
            <li>• Manager dashboard for filtering, reviewing & approving feedback</li>
            <li>• Property review display matching Flex Living’s visual style</li>
            <li>• Fully approved reviews shown on public property pages</li>
            <li>• Exploration for Google Reviews integration</li>
          </ul>
        </div>

        {/* footer */}
        <footer className="mt-14 text-sm text-gray-500">
          © {new Date().getFullYear()} Flex Reviews Dashboard - Built by{" "}
          <span className="font-semibold">Chiedozie Ezidiegwu</span>
        </footer>
      </div>
    </main>
  );
}
